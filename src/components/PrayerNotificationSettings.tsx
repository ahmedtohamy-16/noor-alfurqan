import { useState, useEffect } from "react";
import { Bell, BellOff, Clock, Volume2, VolumeX, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useFCMNotifications } from "@/hooks/useFCMNotifications";
import { toast } from "sonner";

// Adhan audio for testing
const ADHAN_AUDIO_URL = "https://www.islamcan.com/audio/adhan/azan1.mp3";

const PrayerNotificationSettings = () => {
  const { settings, updateSettings } = useUserSettings();
  const { 
    isEnabled, 
    isLoading, 
    isSupported, 
    enableNotifications, 
    disableNotifications,
    sendLocalNotification 
  } = useFCMNotifications();
  
  const [reminderMinutes, setReminderMinutes] = useState(settings.prayer_reminder_minutes || 15);
  const [adhanEnabled, setAdhanEnabled] = useState(true);
  const [isTestingAdhan, setIsTestingAdhan] = useState(false);

  useEffect(() => {
    setReminderMinutes(settings.prayer_reminder_minutes || 15);
  }, [settings]);

  const handleToggleNotifications = async () => {
    if (!isEnabled) {
      await enableNotifications();
    } else {
      await disableNotifications();
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
      sendLocalNotification("اختبار إشعار الصلاة 🕌", "هذا اختبار لإشعارات أوقات الصلاة");
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
          {isEnabled ? (
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
          checked={isEnabled}
          disabled={isLoading}
          onCheckedChange={handleToggleNotifications}
        />
      </div>

      {isEnabled && (
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
