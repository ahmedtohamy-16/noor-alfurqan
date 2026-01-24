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

// Adhan sound URLs
const adhanSounds: Record<string, { url: string; fajrUrl?: string }> = {
  makkah: {
    url: "https://www.islamcan.com/audio/adhan/azan1.mp3",
    fajrUrl: "https://www.islamcan.com/audio/adhan/azan-fajr1.mp3"
  },
  madinah: { url: "https://www.islamcan.com/audio/adhan/azan2.mp3" },
  mishary: { url: "https://www.islamcan.com/audio/adhan/azan3.mp3" },
  "abdul-basit": { url: "https://www.islamcan.com/audio/adhan/azan4.mp3" },
  egypt: { url: "https://www.islamcan.com/audio/adhan/azan5.mp3" },
};

// Get timezone offset in minutes
function getTimezoneOffset(timezone: string): number {
  try {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    return Math.round((tzDate.getTime() - utcDate.getTime()) / (1000 * 60));
  } catch {
    return 0;
  }
}

// Convert local time to UTC minutes
function localTimeToUTCMinutes(localTime: string, timezoneOffset: number): number {
  const [hours, minutes] = localTime.split(":").map(Number);
  let utcMinutes = (hours * 60 + minutes) - timezoneOffset;
  
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
  // Prayer toggles
  adhan_sound: string | null;
  prayer_fajr_enabled: boolean;
  prayer_dhuhr_enabled: boolean;
  prayer_asr_enabled: boolean;
  prayer_maghrib_enabled: boolean;
  prayer_isha_enabled: boolean;
  // Azkar settings
  azkar_morning_enabled: boolean;
  azkar_morning_time: string | null;
  azkar_evening_enabled: boolean;
  azkar_evening_time: string | null;
  azkar_sleep_enabled: boolean;
  azkar_sleep_time: string | null;
  azkar_wakeup_enabled: boolean;
  azkar_wakeup_time: string | null;
  azkar_prayer_enabled: boolean;
  azkar_prayer_delay_minutes: number;
}

interface ScheduledNotification {
  user_id: string;
  title: string;
  body: string;
  tag: string;
  notification_type: string;
  data?: Record<string, string>;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // FAIL-SECURE: Require secret to be configured
  const cronSecret = Deno.env.get("CRON_SECRET_TOKEN");
  if (!cronSecret) {
    console.error("❌ CRON_SECRET_TOKEN not configured - denying access for security");
    return new Response(
      JSON.stringify({ error: "Server misconfiguration" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Single authentication method - only accept X-Cron-Secret header
  const authHeader = req.headers.get("X-Cron-Secret");
  if (authHeader !== cronSecret) {
    console.warn("⚠️ Unauthorized cron access attempt", {
      timestamp: new Date().toISOString(),
      hasHeader: !!authHeader,
    });
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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
      .select(`
        user_id, notifications_enabled, daily_wird_enabled, daily_wird_time, 
        prayer_reminder_minutes, latitude, longitude, prayer_method, timezone,
        adhan_sound, prayer_fajr_enabled, prayer_dhuhr_enabled, prayer_asr_enabled,
        prayer_maghrib_enabled, prayer_isha_enabled,
        azkar_morning_enabled, azkar_morning_time, azkar_evening_enabled, azkar_evening_time,
        azkar_sleep_enabled, azkar_sleep_time, azkar_wakeup_enabled, azkar_wakeup_time,
        azkar_prayer_enabled, azkar_prayer_delay_minutes
      `)
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
    const prayerNames: Record<string, { ar: string; key: string }> = {
      Fajr: { ar: "الفجر", key: "fajr" },
      Dhuhr: { ar: "الظهر", key: "dhuhr" },
      Asr: { ar: "العصر", key: "asr" },
      Maghrib: { ar: "المغرب", key: "maghrib" },
      Isha: { ar: "العشاء", key: "isha" },
    };

    for (const user of settings as UserSettings[]) {
      const userTimezone = user.timezone || "UTC";
      const timezoneOffset = getTimezoneOffset(userTimezone);
      
      console.log(`👤 Processing user ${user.user_id} (timezone: ${userTimezone}, offset: ${timezoneOffset} min)`);

      // === Daily Wird Reminder ===
      if (user.daily_wird_enabled && user.daily_wird_time) {
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

      // === Prayer Time Reminders with Adhan ===
      if (user.latitude && user.longitude && user.prayer_reminder_minutes > 0) {
        const prayerTimes = await getPrayerTimes(
          user.latitude,
          user.longitude,
          user.prayer_method || 4
        );

        if (prayerTimes) {
          const adhanSoundId = user.adhan_sound || "makkah";
          const adhanConfig = adhanSounds[adhanSoundId] || adhanSounds.makkah;

          for (const [prayer, info] of Object.entries(prayerNames)) {
            // Check if this prayer is enabled for user
            const prayerEnabledKey = `prayer_${info.key}_enabled` as keyof UserSettings;
            const isPrayerEnabled = user[prayerEnabledKey] ?? true;
            
            if (!isPrayerEnabled) {
              continue;
            }

            const prayerTime = prayerTimes[prayer];
            if (!prayerTime) continue;

            const prayerLocalMinutes = timeToMinutes(prayerTime);
            const reminderLocalMinutes = prayerLocalMinutes - user.prayer_reminder_minutes;
            
            const reminderUTCMinutes = localTimeToUTCMinutes(
              `${Math.floor(reminderLocalMinutes / 60)}:${String(reminderLocalMinutes % 60).padStart(2, "0")}`,
              timezoneOffset
            );
            
            if (Math.abs(currentUTCMinutes - reminderUTCMinutes) <= 1) {
              console.log(`🕌 Prayer reminder for ${prayer} matched for user ${user.user_id}`);
              
              // Use Fajr-specific adhan if available
              const adhanUrl = prayer === "Fajr" && adhanConfig.fajrUrl 
                ? adhanConfig.fajrUrl 
                : adhanConfig.url;

              notifications.push({
                user_id: user.user_id,
                title: `🕌 صلاة ${info.ar}`,
                body: `باقي ${user.prayer_reminder_minutes} دقيقة على صلاة ${info.ar}`,
                tag: `prayer-${info.key}`,
                notification_type: "prayer",
                data: {
                  adhanUrl,
                  prayerName: info.ar,
                  prayerTime: prayerTime
                }
              });
            }
          }
        }
      }

      // === Morning Azkar ===
      if (user.azkar_morning_enabled) {
        const morningTime = user.azkar_morning_time || "06:00:00";
        const morningUTCMinutes = localTimeToUTCMinutes(morningTime.slice(0, 5), timezoneOffset);
        if (Math.abs(currentUTCMinutes - morningUTCMinutes) <= 1) {
          notifications.push({
            user_id: user.user_id,
            title: "🌅 أذكار الصباح",
            body: "حان وقت أذكار الصباح - ابدأ يومك بذكر الله",
            tag: "morning-azkar",
            notification_type: "azkar",
          });
        }
      }

      // === Evening Azkar ===
      if (user.azkar_evening_enabled) {
        const eveningTime = user.azkar_evening_time || "17:00:00";
        const eveningUTCMinutes = localTimeToUTCMinutes(eveningTime.slice(0, 5), timezoneOffset);
        if (Math.abs(currentUTCMinutes - eveningUTCMinutes) <= 1) {
          notifications.push({
            user_id: user.user_id,
            title: "🌙 أذكار المساء",
            body: "حان وقت أذكار المساء - اختم يومك بذكر الله",
            tag: "evening-azkar",
            notification_type: "azkar",
          });
        }
      }

      // === Sleep Azkar ===
      if (user.azkar_sleep_enabled) {
        const sleepTime = user.azkar_sleep_time || "22:00:00";
        const sleepUTCMinutes = localTimeToUTCMinutes(sleepTime.slice(0, 5), timezoneOffset);
        if (Math.abs(currentUTCMinutes - sleepUTCMinutes) <= 1) {
          notifications.push({
            user_id: user.user_id,
            title: "🌙 أذكار النوم",
            body: "حان وقت أذكار النوم - اذكر الله قبل النوم",
            tag: "sleep-azkar",
            notification_type: "azkar",
          });
        }
      }

      // === Wakeup Azkar ===
      if (user.azkar_wakeup_enabled) {
        const wakeupTime = user.azkar_wakeup_time || "05:00:00";
        const wakeupUTCMinutes = localTimeToUTCMinutes(wakeupTime.slice(0, 5), timezoneOffset);
        if (Math.abs(currentUTCMinutes - wakeupUTCMinutes) <= 1) {
          notifications.push({
            user_id: user.user_id,
            title: "🌅 أذكار الاستيقاظ",
            body: "حان وقت أذكار الاستيقاظ - الحمد لله الذي أحيانا",
            tag: "wakeup-azkar",
            notification_type: "azkar",
          });
        }
      }

      // === After Prayer Azkar ===
      if (user.azkar_prayer_enabled && user.latitude && user.longitude) {
        const prayerTimes = await getPrayerTimes(
          user.latitude,
          user.longitude,
          user.prayer_method || 4
        );

        if (prayerTimes) {
          const delayMinutes = user.azkar_prayer_delay_minutes || 10;
          
          for (const [prayer, info] of Object.entries(prayerNames)) {
            const prayerTime = prayerTimes[prayer];
            if (!prayerTime) continue;

            const prayerLocalMinutes = timeToMinutes(prayerTime);
            const azkarLocalMinutes = prayerLocalMinutes + delayMinutes;
            
            const azkarUTCMinutes = localTimeToUTCMinutes(
              `${Math.floor(azkarLocalMinutes / 60)}:${String(azkarLocalMinutes % 60).padStart(2, "0")}`,
              timezoneOffset
            );
            
            if (Math.abs(currentUTCMinutes - azkarUTCMinutes) <= 1) {
              console.log(`📿 After prayer azkar for ${prayer} matched for user ${user.user_id}`);
              notifications.push({
                user_id: user.user_id,
                title: `📿 أذكار بعد صلاة ${info.ar}`,
                body: `حان وقت أذكار ما بعد صلاة ${info.ar}`,
                tag: `prayer-azkar-${info.key}`,
                notification_type: "azkar",
              });
            }
          }
        }
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
            body: JSON.stringify({
              user_id: notification.user_id,
              title: notification.title,
              body: notification.body,
              tag: notification.tag,
              notification_type: notification.notification_type,
              data: notification.data,
            }),
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
