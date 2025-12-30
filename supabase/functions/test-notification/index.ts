import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");

  // Check configuration status
  const configStatus = {
    supabase_url: !!supabaseUrl,
    supabase_anon_key: !!supabaseAnonKey,
    firebase_configured: !!serviceAccountJson,
    firebase_valid: false,
    firebase_project_id: null as string | null,
  };

  // Validate Firebase config
  if (serviceAccountJson) {
    try {
      const sa = JSON.parse(serviceAccountJson);
      configStatus.firebase_valid = !!(sa.project_id && sa.private_key && sa.client_email);
      configStatus.firebase_project_id = sa.project_id || null;
    } catch {
      configStatus.firebase_valid = false;
    }
  }

  // Get user if authenticated
  const authHeader = req.headers.get("Authorization");
  let userId: string | null = null;

  if (authHeader) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id || null;
  }

  // If user is authenticated and Firebase is configured, try sending a test notification
  if (userId && configStatus.firebase_valid) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader || "",
        },
        body: JSON.stringify({
          user_id: userId,
          title: "🧪 اختبار الإشعارات",
          body: "تم إرسال هذا الإشعار بنجاح! نظام الإشعارات يعمل.",
          tag: "test",
          notification_type: "custom",
        }),
      });

      const result = await response.json();

      return new Response(
        JSON.stringify({
          success: true,
          config_status: configStatus,
          test_result: result,
          user_id: userId,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          config_status: configStatus,
          error: error instanceof Error ? error.message : "Test failed",
          user_id: userId,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  // Return config status only
  return new Response(
    JSON.stringify({
      success: true,
      config_status: configStatus,
      message: !configStatus.firebase_valid
        ? "Firebase not configured - add FIREBASE_SERVICE_ACCOUNT secret"
        : !userId
        ? "User not authenticated - login to test notifications"
        : "Ready to test",
      user_id: userId,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
