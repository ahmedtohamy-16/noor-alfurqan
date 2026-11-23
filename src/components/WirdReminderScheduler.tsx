import { useEffect } from "react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { localDateKey, shouldFireWirdReminder } from "@/lib/wirdReminderRules";

const KEY = "wirdReminderLastFired";

/** Shows the daily wird notification while the app is open. */
const WirdReminderScheduler = () => {
  const { settings } = useUserSettings();
  useEffect(() => {
    if (!settings.daily_wird_enabled || typeof window === "undefined" || !("Notification" in window)) return;
    const check = async () => {
      const now = new Date();
      if (!shouldFireWirdReminder({
        enabled: settings.daily_wird_enabled,
        permission: Notification.permission,
        time: settings.daily_wird_time || "06:00",
        now,
        lastFiredDate: localStorage.getItem(KEY),
      })) return;
      localStorage.setItem(KEY, localDateKey(now));
      const title = "تذكير الورد اليومي";
      const options = { body: "حان وقت وردك من القرآن الكريم", icon: "/favicon.ico", tag: "daily-wird", data: { url: "/quran" } };
      try {
        const reg = await navigator.serviceWorker?.getRegistration();
        if (reg) await reg.showNotification(title, options);
        else new Notification(title, options);
      } catch {
        try { new Notification(title, options); } catch { /* unsupported */ }
      }
    };
    void check();
    const id = window.setInterval(check, 30_000);
    return () => window.clearInterval(id);
  }, [settings.daily_wird_enabled, settings.daily_wird_time]);
  return null;
};
export default WirdReminderScheduler;
