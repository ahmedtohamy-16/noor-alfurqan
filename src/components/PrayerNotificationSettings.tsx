import { useState, useEffect } from "react";
import { Bell, BellOff, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PrayerNotificationSettings = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useUserSettings();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(settings.prayer_reminder_minutes || 10);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    setNotificationsEnabled(settings.notifications_enabled || false);
    setReminderMinutes(settings.prayer_reminder_minutes || 10);
  }, [settings]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("الإشعارات غير مدعومة في هذا المتصفح");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // In a real FCM implementation, you would get the token here
        // For now, we'll use browser notifications as fallback
        toast.success("تم تفعيل الإشعارات");
        return true;
      } else {
        toast.error("تم رفض الإشعارات");
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("حدث خطأ في طلب الإشعارات");
      return false;
    }
  };

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        await updateSettings({ notifications_enabled: true });
        
        // Save FCM token if available
        if (user && fcmToken) {
          await supabase.from("push_subscriptions").upsert({
            user_id: user.id,
            fcm_token: fcmToken,
            device_info: { userAgent: navigator.userAgent },
          }, { onConflict: "user_id,fcm_token" });
        }
      }
    } else {
      setNotificationsEnabled(false);
      await updateSettings({ notifications_enabled: false });
      toast.success("تم إيقاف الإشعارات");
    }
  };

  const handleReminderChange = async (value: number[]) => {
    const minutes = value[0];
    setReminderMinutes(minutes);
    await updateSettings({ prayer_reminder_minutes: minutes });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {notificationsEnabled ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <p className="font-medium text-foreground">تنبيهات الصلاة</p>
            <p className="text-sm text-muted-foreground">
              تلقي تذكير قبل موعد كل صلاة
            </p>
          </div>
        </div>
        <Switch
          checked={notificationsEnabled}
          onCheckedChange={handleToggleNotifications}
        />
      </div>

      {notificationsEnabled && (
        <div className="pt-4 border-t border-border space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">وقت التذكير</p>
              <p className="text-sm text-muted-foreground">
                التذكير قبل {reminderMinutes} دقيقة من موعد الصلاة
              </p>
            </div>
          </div>
          
          <Slider
            value={[reminderMinutes]}
            onValueChange={handleReminderChange}
            min={5}
            max={60}
            step={5}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>٥ دقائق</span>
            <span>٣٠ دقيقة</span>
            <span>٦٠ دقيقة</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PrayerNotificationSettings;
