import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, LockKeyhole, Search, Sparkles, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getAyahAsync } from "@/data/quranAyats";
import { surahs } from "@/data/surahs";

interface Suggestion { surah: number; ayah: number; text: string; name: string }

export default function QuranTopicSearch() {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [access, setAccess] = useState<"checking" | "paid" | "locked" | "error">("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    let current = true;
    setSuggestions(null);
    setError("");
    setAccess("checking");
    if (!user) { setAccess("locked"); return; }
    supabase.from("pro_entitlements").select("status,source,expires_at").eq("user_id", user.uid).maybeSingle().then(({ data, error }) => {
      if (!current) return;
      if (error) { setAccess("error"); return; }
      const paid = data?.status === "active" && data.source === "subscription" && (!data.expires_at || Date.parse(data.expires_at) > Date.now());
      setAccess(paid ? "paid" : "locked");
    });
    return () => { current = false; abort.current?.abort(); };
  }, [user?.uid]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || access !== "paid" || !question.trim()) return;
    const controller = new AbortController();
    abort.current = controller;
    setBusy(true); setError(""); setSuggestions(null);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("سجّل الدخول أولًا");
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quran-topic-suggestions`, {
        method: "POST", signal: controller.signal,
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ question: question.trim() }),
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        throw new Error(failure.message || "تعذّر البحث الآن");
      }
      if (!response.body) throw new Error("لم تصل نتيجة البحث");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let received = false;
      while (true) {
        const chunk = await reader.read();
        buffer += decoder.decode(chunk.value, { stream: !chunk.done });
        const events = buffer.split("\n\n"); buffer = events.pop() || "";
        for (const frame of events) {
          const line = frame.split("\n").find(value => value.startsWith("data: "));
          if (!line) continue;
          const payload = JSON.parse(line.slice(6));
          if (frame.startsWith("event: error")) throw new Error(payload.message);
          if (!frame.startsWith("event: result")) continue;
          if (!Array.isArray(payload.verses)) throw new Error("تعذّر التحقق من الاقتراحات");
          const seen = new Set<string>();
          const verified: Suggestion[] = [];
          // Never render generated Quran text: resolve each reference from the authentic local corpus.
          for (const ref of payload.verses.slice(0, 5)) {
            if (!Number.isInteger(ref.surah) || !Number.isInteger(ref.ayah)) continue;
            const id = `${ref.surah}:${ref.ayah}`;
            if (seen.has(id)) continue;
            const ayah = await getAyahAsync(ref.surah, ref.ayah);
            const surah = surahs.find(s => s.number === ref.surah);
            if (!ayah || !surah) continue;
            seen.add(id);
            verified.push({ surah: ref.surah, ayah: ref.ayah, text: ayah.text_uthmani, name: surah.name });
          }
          if (controller.signal.aborted) return;
          received = true; setSuggestions(verified);
        }
        if (chunk.done) break;
      }
      if (!received) throw new Error("لم تكتمل نتيجة البحث");
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "تعذّر البحث الآن");
    } finally { setBusy(false); abort.current = null; }
  };

  return (
    <section className="mb-6 border-y border-primary/20 py-5" dir="rtl" aria-labelledby="quran-topic-title">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 id="quran-topic-title" className="font-bold text-lg">آيات مرتبطة بموضوعك</h2>
        <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs font-bold" dir="ltr">PRO</span>
      </div>
      {access === "checking" ? <Loader2 className="w-5 h-5 animate-spin text-primary" aria-label="التحقق من الاشتراك" /> : access === "error" ? (
        <p role="alert" className="text-destructive text-sm">تعذّر التحقق من اشتراكك؛ أعد فتح الصفحة لاحقًا.</p>
      ) : access === "locked" ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground flex items-center gap-2"><LockKeyhole className="w-4 h-4" />حصري لمشتركي Pro المدفوع</p>
          <Button asChild variant="outline" size="sm"><Link to={user ? "/pro" : "/auth?mode=login&next=%2Fquran"}>{user ? "اشتراك Pro" : "تسجيل الدخول"}<ArrowLeft className="w-4 h-4 mr-2" /></Link></Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <label htmlFor="quran-topic-question" className="text-sm">سؤالك أو موضوعك</label>
          <Textarea id="quran-topic-question" value={question} onChange={e => setQuestion(e.target.value)} placeholder="مثل: الصبر عند الشدائد" maxLength={1000} disabled={busy} className="min-h-24 resize-y" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">اقتراحات بالذكاء الاصطناعي، وليست فتوى أو تفسيرًا معتمدًا.</p>
            {busy ? <Button type="button" variant="outline" onClick={() => abort.current?.abort()} className="shrink-0"><Square className="w-4 h-4 ml-2" />إيقاف</Button> : <Button type="submit" disabled={!question.trim()} className="shrink-0"><Search className="w-4 h-4 ml-2" />اقتراح آيات</Button>}
          </div>
        </form>
      )}
      <div aria-live="polite" className="mt-3">
        {busy && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />جارٍ البحث والتحقق من الآيات…</p>}
        {error && <p role="alert" className="text-sm text-destructive break-words" dir="auto">{error}</p>}
        {suggestions?.length === 0 && <p className="text-sm text-muted-foreground">لم يُعثر على آيات ذات صلة واضحة بهذا الموضوع.</p>}
        {suggestions && suggestions.length > 0 && <div className="space-y-3 mt-4">{suggestions.map(s => (
          <article key={`${s.surah}:${s.ayah}`} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3 mb-3"><h3 className="text-primary text-sm font-bold">{s.name} · الآية {s.ayah.toLocaleString("ar-EG")}</h3><span dir="ltr" className="text-xs text-muted-foreground">{s.surah}:{s.ayah}</span></div>
            <p className="font-quran text-xl leading-loose text-foreground">{s.text}</p>
            <Button asChild variant="ghost" size="sm" className="mt-2"><Link to={`/surah/${s.surah}?ayah=${s.ayah}`}>قراءة في السياق<ArrowLeft className="w-4 h-4 mr-2" /></Link></Button>
          </article>
        ))}</div>}
      </div>
    </section>
  );
}