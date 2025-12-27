import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Prayer names in Arabic
const PRAYER_NAMES: Record<string, string> = {
  fajr: "الفجر",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    
    console.log(`Running scheduled notifications check at ${currentHour}:${currentMinute} UTC`);

    // Get users with notifications enabled
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("user_id, daily_wird_enabled, daily_wird_time, notifications_enabled, prayer_reminder_minutes")
      .eq("notifications_enabled", true);

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      throw settingsError;
    }

    if (!settings || settings.length === 0) {
      console.log("No users with notifications enabled");
      return new Response(
        JSON.stringify({ success: true, message: "No users with notifications enabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${settings.length} users with notifications enabled`);

    const notifications: Array<{ user_id: string; title: string; body: string; tag: string }> = [];

    for (const userSettings of settings) {
      // Check Daily Wird reminder
      if (userSettings.daily_wird_enabled && userSettings.daily_wird_time) {
        const [wirdHour, wirdMinute] = userSettings.daily_wird_time.split(":").map(Number);
        
        // Check if it's time for wird reminder (within 1 minute window)
        if (currentHour === wirdHour && Math.abs(currentMinute - wirdMinute) <= 1) {
          notifications.push({
            user_id: userSettings.user_id,
            title: "تذكير بالورد اليومي 📖",
            body: "حان وقت قراءة وردك اليومي من القرآن الكريم",
            tag: "daily-wird",
          });
        }
      }

      // Morning Azkar reminder (6:00 AM local - approximate 4:00 UTC for Middle East)
      if (currentHour === 4 && currentMinute === 0) {
        notifications.push({
          user_id: userSettings.user_id,
          title: "أذكار الصباح 🌅",
          body: "حان وقت أذكار الصباح - ابدأ يومك بذكر الله",
          tag: "morning-azkar",
        });
      }

      // Evening Azkar reminder (5:00 PM local - approximate 15:00 UTC for Middle East)
      if (currentHour === 15 && currentMinute === 0) {
        notifications.push({
          user_id: userSettings.user_id,
          title: "أذكار المساء 🌙",
          body: "حان وقت أذكار المساء - اختم يومك بذكر الله",
          tag: "evening-azkar",
        });
      }
    }

    // Send notifications
    if (notifications.length > 0) {
      console.log(`Sending ${notifications.length} notifications`);
      
      for (const notification of notifications) {
        try {
          const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify(notification),
          });
          
          const result = await response.json();
          console.log(`Notification sent to ${notification.user_id}:`, result);
        } catch (error) {
          console.error(`Error sending notification to ${notification.user_id}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${settings.length} users, sent ${notifications.length} notifications`,
        notifications_sent: notifications.length,
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
