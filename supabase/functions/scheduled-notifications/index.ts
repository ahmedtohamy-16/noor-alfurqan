import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

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

// Get timezone offset in minutes
function getTimezoneOffset(timezone: string): number {
  try {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    return Math.round((tzDate.getTime() - utcDate.getTime()) / (1000 * 60));
  } catch {
    return 0; // Default to UTC if timezone is invalid
  }
}

// Convert local time to UTC minutes
function localTimeToUTCMinutes(localTime: string, timezoneOffset: number): number {
  const [hours, minutes] = localTime.split(":").map(Number);
  let utcMinutes = (hours * 60 + minutes) - timezoneOffset;
  
  // Handle day overflow
  if (utcMinutes < 0) utcMinutes += 24 * 60;
  if (utcMinutes >= 24 * 60) utcMinutes -= 24 * 60;
  
  return utcMinutes;
}

// Prayer API for calculating prayer times
async function getPrayerTimes(lat: number, lng: number, method: number = 4): Promise<Record<string, string> | null> {
  try {
    const today = new Date();
    const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lng}&method=${method}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.data?.timings || null;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return null;
  }
}

// Convert HH:MM to minutes since midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

interface UserSettings {
  user_id: string;
  notifications_enabled: boolean;
  daily_wird_enabled: boolean;
  daily_wird_time: string | null;
  prayer_reminder_minutes: number;
  latitude: number | null;
  longitude: number | null;
  prayer_method: number;
  timezone: string | null;
}

interface ScheduledNotification {
  user_id: string;
  title: string;
  body: string;
  tag: string;
  notification_type: string;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    const currentUTCMinutes = currentHour * 60 + currentMinute;

    console.log(`⏰ Scheduled check at ${currentHour}:${String(currentMinute).padStart(2, "0")} UTC`);

    // Get users with notifications enabled
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("user_id, notifications_enabled, daily_wird_enabled, daily_wird_time, prayer_reminder_minutes, latitude, longitude, prayer_method, timezone")
      .eq("notifications_enabled", true);

    if (settingsError) throw settingsError;

    if (!settings || settings.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No users with notifications enabled", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`👥 Found ${settings.length} users with notifications enabled`);

    const notifications: ScheduledNotification[] = [];
    const prayerNames: Record<string, string> = {
      Fajr: "الفجر",
      Dhuhr: "الظهر",
      Asr: "العصر",
      Maghrib: "المغرب",
      Isha: "العشاء",
    };

    for (const user of settings as UserSettings[]) {
      // Get user's timezone offset
      const userTimezone = user.timezone || "UTC";
      const timezoneOffset = getTimezoneOffset(userTimezone);
      
      console.log(`👤 Processing user ${user.user_id} (timezone: ${userTimezone}, offset: ${timezoneOffset} min)`);

      // === Daily Wird Reminder (using LOCAL time) ===
      if (user.daily_wird_enabled && user.daily_wird_time) {
        // Convert user's local wird time to UTC for comparison
        const wirdUTCMinutes = localTimeToUTCMinutes(user.daily_wird_time, timezoneOffset);
        
        console.log(`📖 User wird time: ${user.daily_wird_time} local = ${Math.floor(wirdUTCMinutes/60)}:${String(wirdUTCMinutes%60).padStart(2,"0")} UTC`);
        
        if (Math.abs(currentUTCMinutes - wirdUTCMinutes) <= 1) {
          console.log(`✅ Wird time matched for user ${user.user_id}`);
          notifications.push({
            user_id: user.user_id,
            title: "📖 تذكير بالورد اليومي",
            body: "حان وقت قراءة وردك اليومي من القرآن الكريم",
            tag: "daily-wird",
            notification_type: "wird",
          });
        }
      }

      // === Prayer Time Reminders (API returns local time based on coordinates) ===
      if (user.latitude && user.longitude && user.prayer_reminder_minutes > 0) {
        const prayerTimes = await getPrayerTimes(
          user.latitude,
          user.longitude,
          user.prayer_method || 4
        );

        if (prayerTimes) {
          for (const [prayer, arabicName] of Object.entries(prayerNames)) {
            const prayerTime = prayerTimes[prayer];
            if (!prayerTime) continue;

            // Prayer time is already in local time from the API
            const prayerLocalMinutes = timeToMinutes(prayerTime);
            const reminderLocalMinutes = prayerLocalMinutes - user.prayer_reminder_minutes;
            
            // Convert reminder time to UTC for comparison
            const reminderUTCMinutes = localTimeToUTCMinutes(
              `${Math.floor(reminderLocalMinutes / 60)}:${String(reminderLocalMinutes % 60).padStart(2, "0")}`,
              timezoneOffset
            );
            
            if (Math.abs(currentUTCMinutes - reminderUTCMinutes) <= 1) {
              console.log(`🕌 Prayer reminder for ${prayer} matched for user ${user.user_id}`);
              notifications.push({
                user_id: user.user_id,
                title: `🕌 صلاة ${arabicName}`,
                body: `باقي ${user.prayer_reminder_minutes} دقيقة على صلاة ${arabicName}`,
                tag: `prayer-${prayer.toLowerCase()}`,
                notification_type: "prayer",
              });
            }
          }
        }
      }

      // === Morning Azkar (6:00 AM user's local time) ===
      const morningAzkarUTC = localTimeToUTCMinutes("06:00", timezoneOffset);
      if (Math.abs(currentUTCMinutes - morningAzkarUTC) <= 1) {
        notifications.push({
          user_id: user.user_id,
          title: "🌅 أذكار الصباح",
          body: "حان وقت أذكار الصباح - ابدأ يومك بذكر الله",
          tag: "morning-azkar",
          notification_type: "azkar",
        });
      }

      // === Evening Azkar (5:00 PM user's local time) ===
      const eveningAzkarUTC = localTimeToUTCMinutes("17:00", timezoneOffset);
      if (Math.abs(currentUTCMinutes - eveningAzkarUTC) <= 1) {
        notifications.push({
          user_id: user.user_id,
          title: "🌙 أذكار المساء",
          body: "حان وقت أذكار المساء - اختم يومك بذكر الله",
          tag: "evening-azkar",
          notification_type: "azkar",
        });
      }
    }

    // Send notifications
    let sentCount = 0;
    if (notifications.length > 0) {
      console.log(`📤 Sending ${notifications.length} notifications...`);

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
          
          if (result.success && result.sent > 0) {
            sentCount++;
            console.log(`✅ Sent to ${notification.user_id}: ${notification.title}`);
            
            // Save to notification history
            await supabase.from("notification_history").insert({
              user_id: notification.user_id,
              title: notification.title,
              body: notification.body,
              notification_type: notification.notification_type,
              tag: notification.tag,
            });
          }
        } catch (error) {
          console.error(`❌ Failed to send to ${notification.user_id}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${settings.length} users`,
        notifications_queued: notifications.length,
        notifications_sent: sentCount,
        timestamp: now.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Scheduled notifications error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
