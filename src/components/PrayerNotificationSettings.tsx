import { useState, useEffect } from "react";
import { Bell, BellOff, Clock, Volume2, VolumeX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Adhan audio for testing
const ADHAN_AUDIO_URL = "https://www.islamcan.com/audio/adhan/azan1.mp3";

const PrayerNotificationSettings = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useUserSettings();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(settings.prayer_reminder_minutes || 15);
  const [adhanEnabled, setAdhanEnabled] = useState(true);
  const [isTestingAdhan, setIsTestingAdhan] = useState(false);

  useEffect(() => {
    setNotificationsEnabled(settings.notifications_enabled || false);
    setReminderMinutes(settings.prayer_reminder_minutes || 15);
  }, [settings]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("الإشعارات غير مدعومة في هذا المتصفح");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast.success("تم تفعيل الإشعارات بنجاح");
        return true;
      } else {
        toast.error("تم رفض الإشعارات. يرجى تفعيلها من إعدادات المتصفح");
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
        
        // Save subscription info if user is logged in
        if (user) {
          await supabase.from("push_subscriptions").upsert({
            user_id: user.id,
            fcm_token: `browser-${Date.now()}`,
            device_info: { 
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              language: navigator.language,
            },
          }, { onConflict: "user_id" });
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

  const testAdhan = () => {
    setIsTestingAdhan(true);
    const audio = new Audio(ADHAN_AUDIO_URL);
    audio.volume = 0.7;
    
    audio.play().catch((error) => {
      console.error("Could not play adhan:", error);
      toast.error("تعذر تشغيل صوت الأذان");
      setIsTestingAdhan(false);
    });

    audio.onended = () => setIsTestingAdhan(false);
    
    // Auto stop after 10 seconds for testing
    setTimeout(() => {
      audio.pause();
      setIsTestingAdhan(false);
    }, 10000);
  };

  const testNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("اختبار إشعار الصلاة 🕌", {
        body: "هذا اختبار لإشعارات أوقات الصلاة",
        icon: "/favicon.ico",
        dir: "rtl",
        lang: "ar",
      });
      toast.success("تم إرسال إشعار تجريبي");
    } else {
      toast.error("يجب تفعيل الإشعارات أولاً");
    }
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Main Toggle */}
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
              تلقي تذكير قبل موعد كل صلاة مع صوت الأذان
            </p>
          </div>
        </div>
        <Switch
          checked={notificationsEnabled}
          onCheckedChange={handleToggleNotifications}
        />
      </div>

      {notificationsEnabled && (
        <div className="pt-4 border-t border-border space-y-6">
          {/* Reminder Time */}
          <div className="space-y-4">
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

          {/* Adhan Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {adhanEnabled ? (
                <Volume2 className="w-5 h-5 text-primary" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">صوت الأذان</p>
                <p className="text-sm text-muted-foreground">
                  تشغيل صوت الأذان عند دخول وقت الصلاة
                </p>
              </div>
            </div>
            <Switch
              checked={adhanEnabled}
              onCheckedChange={setAdhanEnabled}
            />
          </div>

          {/* Test Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testNotification}
              className="flex-1"
            >
              <Bell className="w-4 h-4 ml-2" />
              اختبار الإشعار
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={testAdhan}
              disabled={isTestingAdhan || !adhanEnabled}
              className="flex-1"
            >
              <Volume2 className="w-4 h-4 ml-2" />
              {isTestingAdhan ? "جاري التشغيل..." : "اختبار الأذان"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PrayerNotificationSettings;
