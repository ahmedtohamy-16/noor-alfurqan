import { useState, useEffect } from "react";
import { ArrowRight, Bell, Clock, Moon, Sunrise, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useFCMNotifications } from "@/hooks/useFCMNotifications";
import { toast } from "sonner";

interface AzkarSettings {
  morning: { enabled: boolean; time: string };
  evening: { enabled: boolean; time: string };
  sleep: { enabled: boolean; time: string };
  wakeup: { enabled: boolean; time: string };
  prayer: { enabled: boolean; delayMinutes: number };
}

const NotificationSettingsPage = () => {
  const { settings, updateSettings } = useUserSettings();
  const { isEnabled, enableNotifications, disableNotifications } = useFCMNotifications();
  
  const [azkarOpen, setAzkarOpen] = useState(false);

  const [azkarSettings, setAzkarSettings] = useState<AzkarSettings>({
    morning: { enabled: true, time: "06:00" },
    evening: { enabled: true, time: "17:00" },
    sleep: { enabled: false, time: "22:00" },
    wakeup: { enabled: false, time: "05:00" },
    prayer: { enabled: false, delayMinutes: 10 },
  });

  // Load settings from database
  useEffect(() => {
    if (settings) {
      setAzkarSettings({
        morning: { 
          enabled: (settings as any).azkar_morning_enabled ?? true, 
          time: ((settings as any).azkar_morning_time || "06:00:00").slice(0, 5) 
        },
        evening: { 
          enabled: (settings as any).azkar_evening_enabled ?? true, 
          time: ((settings as any).azkar_evening_time || "17:00:00").slice(0, 5) 
        },
        sleep: { 
          enabled: (settings as any).azkar_sleep_enabled ?? false, 
          time: ((settings as any).azkar_sleep_time || "22:00:00").slice(0, 5) 
        },
        wakeup: { 
          enabled: (settings as any).azkar_wakeup_enabled ?? false, 
          time: ((settings as any).azkar_wakeup_time || "05:00:00").slice(0, 5) 
        },
        prayer: { 
          enabled: (settings as any).azkar_prayer_enabled ?? false,
          delayMinutes: (settings as any).azkar_prayer_delay_minutes || 10
        },
      });
    }
  }, [settings]);

  const handleMainToggle = async () => {
    if (!isEnabled) {
      const success = await enableNotifications();
      if (success) {
        toast.success("تم تفعيل الإشعارات");
      }
    } else {
      await disableNotifications();
      toast.success("تم إيقاف الإشعارات");
    }
  };

  const handleAzkarToggle = async (type: keyof AzkarSettings) => {
    if (type === "prayer") {
      const newValue = !azkarSettings.prayer.enabled;
      setAzkarSettings(prev => ({ ...prev, prayer: { ...prev.prayer, enabled: newValue } }));
      await updateSettings({ azkar_prayer_enabled: newValue } as any);
    } else {
      const newValue = !azkarSettings[type].enabled;
      setAzkarSettings(prev => ({
        ...prev,
        [type]: { ...prev[type], enabled: newValue }
      }));
      await updateSettings({ [`azkar_${type}_enabled`]: newValue } as any);
    }
  };

  const handlePrayerAzkarDelayChange = async (delayMinutes: number) => {
    setAzkarSettings(prev => ({ 
      ...prev, 
      prayer: { ...prev.prayer, delayMinutes } 
    }));
    await updateSettings({ azkar_prayer_delay_minutes: delayMinutes } as any);
    toast.success("تم تحديث وقت التنبيه");
  };

  const handleAzkarTimeChange = async (type: "morning" | "evening" | "sleep" | "wakeup", time: string) => {
    setAzkarSettings(prev => ({
      ...prev,
      [type]: { ...prev[type], time }
    }));
    await updateSettings({ [`azkar_${type}_time`]: time + ":00" } as any);
    toast.success("تم تحديث وقت التنبيه");
  };

  // Available time options for azkar
  const morningTimes = ["05:00", "05:30", "06:00", "06:30", "07:00", "07:30", "08:00"];
  const eveningTimes = ["15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"];
  const sleepTimes = ["20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"];
  const wakeupTimes = ["04:00", "04:30", "05:00", "05:30", "06:00", "06:30", "07:00"];

  const azkarItems = [
    { 
      key: "morning" as const, 
      nameAr: "أذكار الصباح", 
      description: "تذكير بأذكار الصباح",
      times: morningTimes,
      icon: Sunrise
    },
    { 
      key: "evening" as const, 
      nameAr: "أذكار المساء", 
      description: "تذكير بأذكار المساء",
      times: eveningTimes,
      icon: Moon
    },
    { 
      key: "sleep" as const, 
      nameAr: "أذكار النوم", 
      description: "تذكير بأذكار قبل النوم",
      times: sleepTimes,
      icon: Moon
    },
    { 
      key: "wakeup" as const, 
      nameAr: "أذكار الاستيقاظ", 
      description: "تذكير بأذكار الاستيقاظ",
      times: wakeupTimes,
      icon: Sunrise
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-8 arabic-ui">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">إعدادات التنبيهات</h1>
        </div>

        <div className="max-w-lg mx-auto space-y-4">
          {/* Main Toggle */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">تفعيل الإشعارات</p>
                  <p className="text-sm text-muted-foreground">
                    تفعيل جميع التنبيهات والإشعارات
                  </p>
                </div>
              </div>
              <Switch checked={isEnabled} onCheckedChange={handleMainToggle} />
            </div>
          </Card>

          {isEnabled && (
            <>
              {/* Azkar Notifications */}
              <Collapsible open={azkarOpen} onOpenChange={setAzkarOpen}>
                <Card className="p-4">
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <div className="text-right">
                          <p className="font-medium text-foreground">تنبيهات الأذكار</p>
                          <p className="text-sm text-muted-foreground">
                            تذكير بالأذكار والأدعية اليومية
                          </p>
                        </div>
                      </div>
                      {azkarOpen ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="pt-4 space-y-4">
                    <div className="space-y-4 border-t border-border pt-4">
                      {azkarItems.map((item) => (
                        <div key={item.key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <item.icon className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <span className="text-foreground block">{item.nameAr}</span>
                                <span className="text-xs text-muted-foreground">{item.description}</span>
                              </div>
                            </div>
                            <Switch
                              checked={azkarSettings[item.key].enabled}
                              onCheckedChange={() => handleAzkarToggle(item.key)}
                            />
                          </div>
                          
                          {azkarSettings[item.key].enabled && (
                            <div className="flex items-center gap-2 mr-6">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <Select 
                                value={azkarSettings[item.key].time}
                                onValueChange={(value) => handleAzkarTimeChange(item.key, value)}
                              >
                                <SelectTrigger className="w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {item.times.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Prayer Azkar */}
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <span className="text-foreground block">أذكار بعد الصلاة</span>
                              <span className="text-xs text-muted-foreground">تذكير بعد كل صلاة</span>
                            </div>
                          </div>
                          <Switch
                            checked={azkarSettings.prayer.enabled}
                            onCheckedChange={() => handleAzkarToggle("prayer")}
                          />
                        </div>
                        
                        {azkarSettings.prayer.enabled && (
                          <div className="flex items-center gap-2 mr-6">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">بعد</span>
                            <Select 
                              value={String(azkarSettings.prayer.delayMinutes)}
                              onValueChange={(value) => handlePrayerAzkarDelayChange(Number(value))}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">١٠ دقائق</SelectItem>
                                <SelectItem value="15">١٥ دقيقة</SelectItem>
                                <SelectItem value="20">٢٠ دقيقة</SelectItem>
                                <SelectItem value="30">٣٠ دقيقة</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Daily Wird Reminder */}
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">تذكير الورد اليومي</p>
                    <p className="text-sm text-muted-foreground">
                      يمكنك ضبط وقت تذكير الورد اليومي من صفحة الإعدادات
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default NotificationSettingsPage;