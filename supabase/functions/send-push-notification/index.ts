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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");

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

    // If FCM Server Key is available, send via FCM
    if (fcmServerKey) {
      const tokens = validTokens.map((sub) => sub.fcm_token);

      // Send via Firebase Cloud Messaging HTTP v1 API
      const fcmResponse = await fetch(
        "https://fcm.googleapis.com/fcm/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=${fcmServerKey}`,
          },
          body: JSON.stringify({
            registration_ids: tokens,
            notification: {
              title,
              body,
              icon: "/favicon.ico",
              badge: "/favicon.ico",
              tag: tag || notification_type || "general",
              click_action: "https://noor-alfurqan.lovable.app/",
            },
            data: {
              notification_type,
              tag,
              timestamp: new Date().toISOString(),
            },
            android: {
              priority: "high",
              notification: {
                sound: "default",
                click_action: "OPEN_APP",
              },
            },
            webpush: {
              headers: {
                Urgency: "high",
              },
              notification: {
                icon: "/favicon.ico",
                badge: "/favicon.ico",
                vibrate: [200, 100, 200],
                requireInteraction: true,
              },
            },
          }),
        }
      );

      const fcmResult = await fcmResponse.json();
      console.log("FCM Response:", fcmResult);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Notifications sent via FCM",
          sent: tokens.length,
          fcm_result: fcmResult,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no FCM Server Key, log and return
    console.log("FCM_SERVER_KEY not configured - push notifications require server key");
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "FCM_SERVER_KEY not configured. Please add it to enable push notifications.",
        sent: 0,
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
