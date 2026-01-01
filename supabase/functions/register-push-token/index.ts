import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

// Allowed origins for CORS
const allowedOrigins = [
  "https://noor-alfurqan.lovable.app",
  "https://a627a8a5-f451-4c03-86fb-fc0ef654d906.lovableproject.com",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
];

const getCorsHeaders = (origin: string | null): Record<string, string> => {
  const allowedOrigin = allowedOrigins.includes(origin || "") ? origin! : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

// Input validation constants
const MAX_TOKEN_LENGTH = 500;
const MAX_PLATFORM_LENGTH = 50;
const VALID_PLATFORMS = ["web", "android", "ios"] as const;
const FCM_TOKEN_PATTERN = /^[a-zA-Z0-9_:/-]+$/;

interface RegisterTokenPayload {
  fcm_token: string;
  platform?: typeof VALID_PLATFORMS[number];
  device_info?: Record<string, unknown>;
}

// Validate FCM token format
function validateFcmToken(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  if (token.length > MAX_TOKEN_LENGTH) return false;
  if (!FCM_TOKEN_PATTERN.test(token)) return false;
  return true;
}

// Sanitize device_info to prevent large payloads
function sanitizeDeviceInfo(info: unknown): Record<string, unknown> | null {
  if (!info || typeof info !== "object") return null;
  const sanitized: Record<string, unknown> = {};
  const allowedKeys = ["userAgent", "platform", "language", "screenWidth", "screenHeight", "vendor"];
  for (const key of allowedKeys) {
    if (key in (info as Record<string, unknown>)) {
      const value = (info as Record<string, unknown>)[key];
      if (typeof value === "string" && value.length <= 500) {
        sanitized[key] = value;
      } else if (typeof value === "number") {
        sanitized[key] = value;
      }
    }
  }
  return Object.keys(sanitized).length > 0 ? sanitized : null;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Get user from authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ success: false, error: "Authorization required" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid user session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawPayload = await req.json();
    const fcm_token = rawPayload.fcm_token;
    const platform = rawPayload.platform || "web";
    const device_info = rawPayload.device_info;

    // Validate FCM token
    if (!validateFcmToken(fcm_token)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid fcm_token format or length" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate platform
    if (!VALID_PLATFORMS.includes(platform as typeof VALID_PLATFORMS[number])) {
      return new Response(
        JSON.stringify({ success: false, error: `platform must be one of: ${VALID_PLATFORMS.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize device info
    const sanitizedDeviceInfo = sanitizeDeviceInfo(device_info);

    console.log(`📱 Registering token for user ${user.id}, platform: ${platform}`);

    // Check if token already exists
    const { data: existing } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("fcm_token", fcm_token)
      .single();

    if (existing) {
      // Update existing token
      const { error: updateError } = await supabase
        .from("push_subscriptions")
        .update({
          user_id: user.id,
          platform,
          device_info: sanitizedDeviceInfo,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) throw updateError;

      console.log("✅ Token updated");
      return new Response(
        JSON.stringify({ success: true, message: "Token updated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert new token
    const { error: insertError } = await supabase
      .from("push_subscriptions")
      .insert({
        user_id: user.id,
        fcm_token,
        platform,
        device_info: sanitizedDeviceInfo,
        is_active: true,
      });

    if (insertError) throw insertError;

    console.log("✅ New token registered");
    return new Response(
      JSON.stringify({ success: true, message: "Token registered" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});