// AI text moderation via Lovable AI Gateway
// Returns { allowed: boolean, reason?: string }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Require authenticated caller to prevent quota abuse
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { content } = await req.json();
    if (typeof content !== "string" || content.trim().length === 0) {
      return new Response(JSON.stringify({ error: "content required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (content.length > 5000) {
      return new Response(JSON.stringify({ error: "content too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      // If AI not enabled, allow by default but log
      console.warn("LOVABLE_API_KEY missing — bypassing moderation");
      return new Response(JSON.stringify({ allowed: true, bypassed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "أنت مُشرف محتوى لمنصة إسلامية. أجب بـ JSON فقط: {\"allowed\": boolean, \"reason\": string}. ارفض المحتوى إذا احتوى على: شتائم، عنف، إباحية، تهديدات، تحريض طائفي، إساءة للأديان أو الأنبياء، ترويج للمحرمات (خمر، قمار، موسيقى محرمة). اقبل النقاش الديني المحترم والمحتوى العادي.",
          },
          { role: "user", content: `راجع: \n"""${content}"""` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(
        JSON.stringify({ error: "rate_limit" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!aiRes.ok) {
      console.error("AI gateway error", aiRes.status, await aiRes.text());
      // Fail-open for availability (log only)
      return new Response(JSON.stringify({ allowed: true, bypassed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const raw = data?.choices?.[0]?.message?.content || "{}";
    let parsed: { allowed: boolean; reason?: string } = { allowed: true };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { allowed: true };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("moderate-content error", e);
    return new Response(JSON.stringify({ allowed: true, bypassed: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
