import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const Body = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,20}$/),
  password: z.string().min(1).max(256),
});
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
// One generic answer for every failure so callers cannot learn whether a username exists.
const invalid = () => json({ error: "invalid_credentials" }, 400);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let raw: unknown;
  try { raw = await req.json(); } catch { return invalid(); }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return invalid();
  const { username, password } = parsed.data;

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: email, error: lookupError } = await admin.rpc("get_email_by_username", { name: username });
  if (lookupError || typeof email !== "string" || !email) return invalid();

  const anon = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) return invalid();

  // The email is never returned; only the caller's own session after a correct password.
  return json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
});
