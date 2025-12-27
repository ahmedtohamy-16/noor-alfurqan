import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  user_id?: string;
  title: string;
  body: string;
  tag?: string;
  broadcast?: boolean;
  notification_type?: "prayer" | "wird" | "azkar" | "custom";
}

// Get OAuth2 access token using service account
async function getAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // 1 hour expiry

  // Create JWT header
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  // Create JWT payload
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: exp,
  };

  // Base64url encode
  const encoder = new TextEncoder();
  const base64url = (data: string) => {
    return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));

  const signatureInput = `${headerB64}.${payloadB64}`;

  // Import private key and sign
  const privateKeyPem = serviceAccount.private_key;
  const pemContents = privateKeyPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(signatureInput)
  );

  const signatureB64 = base64url(
    String.fromCharCode(...new Uint8Array(signature))
  );

  const jwt = `${signatureInput}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResponse.json();
  
  if (!tokenResponse.ok) {
    console.error("Token exchange error:", tokenData);
    throw new Error(`Failed to get access token: ${tokenData.error_description || tokenData.error}`);
  }

  return tokenData.access_token;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    const { user_id, title, body, tag, broadcast, notification_type } = payload;

    console.log("Sending notification:", { title, body, tag, broadcast, notification_type });

    // Get FCM tokens
    let query = supabase.from("push_subscriptions").select("fcm_token, user_id");

    if (!broadcast && user_id) {
      query = query.eq("user_id", user_id);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No subscriptions found");
      return new Response(
        JSON.stringify({ success: true, message: "No subscriptions found", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${subscriptions.length} subscriptions`);

    // Filter out browser-fallback tokens (they don't support server push)
    const validTokens = subscriptions.filter(
      (sub) => sub.fcm_token && !sub.fcm_token.startsWith("browser-fallback")
    );

    if (validTokens.length === 0) {
      console.log("No valid FCM tokens found (only browser-fallback tokens)");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Only browser-fallback tokens found - notifications will be shown when app is open",
          sent: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse service account
    if (!serviceAccountJson) {
      console.error("FIREBASE_SERVICE_ACCOUNT not configured");
      return new Response(
        JSON.stringify({
          success: false,
          message: "FIREBASE_SERVICE_ACCOUNT not configured",
          sent: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (e) {
      console.error("Failed to parse service account JSON:", e);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid FIREBASE_SERVICE_ACCOUNT JSON",
          sent: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get OAuth2 access token
    console.log("Getting OAuth2 access token...");
    const accessToken = await getAccessToken(serviceAccount);
    console.log("Got access token successfully");

    const projectId = serviceAccount.project_id;
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    // Send notifications to each token
    const results = [];
    const tokens = validTokens.map((sub) => sub.fcm_token);

    for (const token of tokens) {
      try {
        const message = {
          message: {
            token: token,
            notification: {
              title,
              body,
            },
            webpush: {
              headers: {
                Urgency: "high",
              },
              notification: {
                icon: "/favicon.ico",
                badge: "/favicon.ico",
                tag: tag || notification_type || "general",
                vibrate: [200, 100, 200],
                requireInteraction: true,
              },
              fcm_options: {
                link: "https://noor-alfurqan.lovable.app/",
              },
            },
            data: {
              notification_type: notification_type || "general",
              tag: tag || "",
              timestamp: new Date().toISOString(),
            },
          },
        };

        const fcmResponse = await fetch(fcmUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(message),
        });

        const fcmResult = await fcmResponse.json();
        
        if (fcmResponse.ok) {
          console.log("FCM sent successfully to token:", token.substring(0, 20) + "...");
          results.push({ token: token.substring(0, 20) + "...", success: true });
        } else {
          console.error("FCM error for token:", token.substring(0, 20) + "...", fcmResult);
          results.push({ token: token.substring(0, 20) + "...", success: false, error: fcmResult });
          
          // Remove invalid tokens
          if (fcmResult.error?.code === 404 || fcmResult.error?.details?.[0]?.errorCode === "UNREGISTERED") {
            console.log("Removing invalid token from database");
            await supabase.from("push_subscriptions").delete().eq("fcm_token", token);
          }
        }
      } catch (tokenError) {
        console.error("Error sending to token:", tokenError);
        results.push({ token: token.substring(0, 20) + "...", success: false, error: String(tokenError) });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`Sent ${successCount}/${tokens.length} notifications successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notifications sent via FCM v1 API`,
        sent: successCount,
        total: tokens.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
