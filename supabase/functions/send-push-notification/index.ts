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
const MAX_TITLE_LENGTH = 200;
const MAX_BODY_LENGTH = 1000;
const MAX_TAG_LENGTH = 100;
const VALID_NOTIFICATION_TYPES = ["prayer", "wird", "azkar", "custom", "general"] as const;

interface NotificationPayload {
  user_id?: string;
  title: string;
  body: string;
  tag?: string;
  broadcast?: boolean;
  notification_type?: typeof VALID_NOTIFICATION_TYPES[number];
  data?: Record<string, string>;
}

// Sanitize string input
function sanitizeString(input: string, maxLength: number): string {
  return input.slice(0, maxLength).trim();
}

// Validate notification payload
function validatePayload(payload: NotificationPayload): { valid: boolean; error?: string } {
  if (!payload.title || typeof payload.title !== "string") {
    return { valid: false, error: "title is required and must be a string" };
  }
  if (!payload.body || typeof payload.body !== "string") {
    return { valid: false, error: "body is required and must be a string" };
  }
  if (payload.notification_type && !VALID_NOTIFICATION_TYPES.includes(payload.notification_type)) {
    return { valid: false, error: `notification_type must be one of: ${VALID_NOTIFICATION_TYPES.join(", ")}` };
  }
  if (payload.user_id && typeof payload.user_id !== "string") {
    return { valid: false, error: "user_id must be a string" };
  }
  return { valid: true };
}

interface FirebaseServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

// Generate OAuth2 access token using service account credentials
async function getAccessToken(serviceAccount: FirebaseServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: exp,
  };

  const base64url = (data: string) =>
    btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const signatureInput = `${headerB64}.${payloadB64}`;

  // Import and sign with private key
  const privateKeyPem = serviceAccount.private_key;
  const pemContents = privateKeyPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const signatureB64 = base64url(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${signatureInput}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`);
  }

  return tokenData.access_token;
}

// Send FCM message to a single token
async function sendFCMMessage(
  token: string,
  notification: { title: string; body: string },
  data: Record<string, string>,
  accessToken: string,
  projectId: string
): Promise<{ success: boolean; error?: string }> {
  const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  const message = {
    message: {
      token,
      notification,
      webpush: {
        headers: { Urgency: "high" },
        notification: {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: data.tag || "general",
          vibrate: [200, 100, 200],
          requireInteraction: true,
          dir: "rtl",
          lang: "ar",
        },
        fcm_options: {
          link: data.click_url || "/",
        },
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    },
  };

  const response = await fetch(fcmUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(message),
  });

  const result = await response.json();

  if (response.ok) {
    return { success: true };
  }

  return {
    success: false,
    error: result.error?.message || JSON.stringify(result),
  };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");

  // Require service-role bearer or admin-only CRON token
  const authHeader = req.headers.get("Authorization") || "";
  const cronSecret = Deno.env.get("CRON_SECRET_TOKEN") || "";
  const isService = supabaseServiceKey && authHeader === `Bearer ${supabaseServiceKey}`;
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  if (!isService && !isCron) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const rawPayload = await req.json();
    
    
    // Validate payload structure
    const validation = validatePayload(rawPayload);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs
    const title = sanitizeString(rawPayload.title, MAX_TITLE_LENGTH);
    const body = sanitizeString(rawPayload.body, MAX_BODY_LENGTH);
    const tag = rawPayload.tag ? sanitizeString(rawPayload.tag, MAX_TAG_LENGTH) : undefined;
    const { user_id, broadcast, notification_type, data } = rawPayload;

    console.log("📤 Sending notification:", { title: title.substring(0, 50), broadcast, notification_type, user_id });

    // Check Firebase config
    if (!serviceAccountJson) {
      console.log("⚠️ FIREBASE_SERVICE_ACCOUNT not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "FIREBASE_SERVICE_ACCOUNT not configured",
          code: "FCM_NOT_CONFIGURED",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let serviceAccount: FirebaseServiceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid FIREBASE_SERVICE_ACCOUNT JSON" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get FCM tokens
    let query = supabase
      .from("push_subscriptions")
      .select("fcm_token, user_id")
      .eq("is_active", true);

    if (!broadcast && user_id) {
      query = query.eq("user_id", user_id);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      throw new Error(`Database error: ${subError.message}`);
    }

    // Filter valid tokens (exclude browser-fallback tokens)
    const validSubscriptions = (subscriptions || []).filter(
      (sub) => sub.fcm_token && !sub.fcm_token.startsWith("browser-fallback")
    );

    if (validSubscriptions.length === 0) {
      console.log("📭 No valid FCM tokens found");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No valid FCM tokens found",
          sent: 0,
          total: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get access token
    console.log("🔐 Generating access token...");
    const accessToken = await getAccessToken(serviceAccount);

    // Send to all tokens
    const results: Array<{ token: string; success: boolean; error?: string; userId: string }> = [];
    const invalidTokens: string[] = [];

    for (const sub of validSubscriptions) {
      const result = await sendFCMMessage(
        sub.fcm_token,
        { title, body },
        {
          notification_type: notification_type || "general",
          tag: tag || "",
          ...data,
        },
        accessToken,
        serviceAccount.project_id
      );

      results.push({
        token: sub.fcm_token.substring(0, 20) + "...",
        success: result.success,
        error: result.error,
        userId: sub.user_id,
      });

      // Track invalid tokens for cleanup
      if (!result.success && result.error?.includes("UNREGISTERED")) {
        invalidTokens.push(sub.fcm_token);
      }

      // Log notification
      await supabase.from("notification_logs").insert({
        user_id: sub.user_id,
        title,
        body,
        notification_type: notification_type || "general",
        tag,
        status: result.success ? "sent" : "failed",
        error_message: result.error,
        sent_at: result.success ? new Date().toISOString() : null,
      });
    }

    // Cleanup invalid tokens
    if (invalidTokens.length > 0) {
      console.log(`🧹 Removing ${invalidTokens.length} invalid tokens`);
      for (const token of invalidTokens) {
        await supabase.from("push_subscriptions").delete().eq("fcm_token", token);
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`✅ Sent ${successCount}/${validSubscriptions.length} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notifications sent`,
        sent: successCount,
        total: validSubscriptions.length,
        results,
      }),
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