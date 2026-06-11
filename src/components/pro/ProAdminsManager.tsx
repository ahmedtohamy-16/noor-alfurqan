import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Plus, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PRO_ADMINS_DOC, PRO_CONFIG_COLLECTION } from "@/hooks/usePro";

const PRO_COLOR = "#0074fc";

const ProAdminsManager = () => {
  const [emails, setEmails] = useState<string[]>([]);
  const [uids, setUids] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newUid, setNewUid] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const db = getFirestoreDb();
    const snap = await getDoc(doc(db, PRO_CONFIG_COLLECTION, PRO_ADMINS_DOC));
    if (snap.exists()) {
      const d = snap.data();
      setEmails((d.emails as string[]) || []);
      setUids((d.uids as string[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (nextEmails: string[], nextUids: string[]) => {
    setSaving(true);
    try {
      const db = getFirestoreDb();
      await setDoc(
        doc(db, PRO_CONFIG_COLLECTION, PRO_ADMINS_DOC),
        { emails: nextEmails, uids: nextUids, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setEmails(nextEmails);
      setUids(nextUids);
      toast.success("تم التحديث");
    } catch (e: any) {
      console.error(e);
      toast.error("فشل التحديث — تحقق من صلاحيات Firestore");
    } finally {
      setSaving(false);
    }
  };

  const addEmail = () => {
    const v = newEmail.trim().toLowerCase();
    if (!v || !v.includes("@")) { toast.error("بريد غير صحيح"); return; }
    if (emails.includes(v)) { toast.info("موجود بالفعل"); return; }
    save([...emails, v], uids);
    setNewEmail("");
  };

  const addUid = () => {
    const v = newUid.trim();
    if (!v) return;
    if (uids.includes(v)) { toast.info("موجود بالفعل"); return; }
    save(emails, [...uids, v]);
    setNewUid("");
  };

  const removeEmail = (e: string) => save(emails.filter((x) => x !== e), uids);
  const removeUid = (u: string) => save(emails, uids.filter((x) => x !== u));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-end text-right">
          <span>مشرفو Pro (وصول مجاني)</span>
          <Crown className="w-5 h-5" style={{ color: PRO_COLOR }} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground text-right">
          أي مستخدم بريده أو UID في هذه القائمة يحصل على كل مزايا Pro تلقائيًا
          بدون اشتراك. للاختبار والتطوير فقط.
        </p>

        {/* Emails */}
        <div className="space-y-2">
          <h4 className="font-semibold text-right">قائمة البريد الإلكتروني</h4>
          <div className="flex gap-2">
            <Input
              placeholder="email@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEmail()}
              dir="ltr"
            />
            <Button onClick={addEmail} disabled={saving}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {loading ? <span className="text-sm text-muted-foreground">جارٍ التحميل…</span> :
             emails.length === 0 ? <span className="text-sm text-muted-foreground">لا يوجد</span> :
             emails.map((e) => (
              <Badge key={e} variant="secondary" className="gap-1 pr-2">
                <button onClick={() => removeEmail(e)} className="hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </button>
                <span dir="ltr">{e}</span>
                <Sparkles className="w-3 h-3" style={{ color: PRO_COLOR }} />
              </Badge>
            ))}
          </div>
        </div>

        {/* UIDs */}
        <div className="space-y-2">
          <h4 className="font-semibold text-right">قائمة UID (Firebase)</h4>
          <div className="flex gap-2">
            <Input
              placeholder="firebase uid"
              value={newUid}
              onChange={(e) => setNewUid(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addUid()}
              dir="ltr"
            />
            <Button onClick={addUid} disabled={saving}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {uids.length === 0 ? <span className="text-sm text-muted-foreground">لا يوجد</span> :
              uids.map((u) => (
              <Badge key={u} variant="outline" className="gap-1 pr-2">
                <button onClick={() => removeUid(u)} className="hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </button>
                <span dir="ltr" className="font-mono text-xs">{u}</span>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProAdminsManager;
