import { useState, useEffect } from "react";
import { ArrowRight, Bell, Volume2, Clock, Moon, Sun, Sunrise, BookOpen, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useFCMNotifications } from "@/hooks/useFCMNotifications";
import { adhanSounds, getAdhanSound } from "@/data/adhanSounds";
import { toast } from "sonner";

interface PrayerSettings {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

interface AzkarSettings {
  morning: { enabled: boolean; time: string };
  evening: { enabled: boolean; time: string };
  sleep: { enabled: boolean; time: string };
  wakeup: { enabled: boolean; time: string };
  prayer: { enabled: boolean };
}

const NotificationSettingsPage = () => {
  const { settings, updateSettings } = useUserSettings();
  const { isEnabled, enableNotifications, disableNotifications } = useFCMNotifications();
  
  const [prayerOpen, setPrayerOpen] = useState(false);
  const [azkarOpen, setAzkarOpen] = useState(false);
  const [adhanSound, setAdhanSound] = useState("makkah");
  const [isTestingAdhan, setIsTestingAdhan] = useState(false);
  
  const [prayerSettings, setPrayerSettings] = useState<PrayerSettings>({
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  });

  const [azkarSettings, setAzkarSettings] = useState<AzkarSettings>({
    morning: { enabled: true, time: "06:00" },
    evening: { enabled: true, time: "17:00" },
    sleep: { enabled: false, time: "22:00" },
    wakeup: { enabled: false, time: "05:00" },
    prayer: { enabled: false },
  });

  // Load settings from database
  useEffect(() => {
    if (settings) {
      setAdhanSound((settings as any).adhan_sound || "makkah");
      setPrayerSettings({
        fajr: (settings as any).prayer_fajr_enabled ?? true,
        dhuhr: (settings as any).prayer_dhuhr_enabled ?? true,
        asr: (settings as any).prayer_asr_enabled ?? true,
        maghrib: (settings as any).prayer_maghrib_enabled ?? true,
        isha: (settings as any).prayer_isha_enabled ?? true,
      });
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
        prayer: { enabled: (settings as any).azkar_prayer_enabled ?? false },
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

  const handleAdhanChange = async (value: string) => {
    setAdhanSound(value);
    await updateSettings({ adhan_sound: value } as any);
    toast.success("تم تحديث صوت الآذان");
  };

  const handlePrayerToggle = async (prayer: keyof PrayerSettings) => {
    const newValue = !prayerSettings[prayer];
    setPrayerSettings(prev => ({ ...prev, [prayer]: newValue }));
    await updateSettings({ [`prayer_${prayer}_enabled`]: newValue } as any);
  };

  const handleAzkarToggle = async (type: keyof AzkarSettings) => {
    if (type === "prayer") {
      const newValue = !azkarSettings.prayer.enabled;
      setAzkarSettings(prev => ({ ...prev, prayer: { enabled: newValue } }));
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

  const handleAzkarTimeChange = async (type: "morning" | "evening" | "sleep" | "wakeup", time: string) => {
    setAzkarSettings(prev => ({
      ...prev,
      [type]: { ...prev[type], time }
    }));
    await updateSettings({ [`azkar_${type}_time`]: time + ":00" } as any);
    toast.success("تم تحديث وقت التنبيه");
  };

  const testAdhan = () => {
    const sound = getAdhanSound(adhanSound);
    setIsTestingAdhan(true);
    const audio = new Audio(sound.url);
    audio.volume = 0.7;
    
    audio.play().catch((error) => {
      console.error("Could not play adhan:", error);
      toast.error("تعذر تشغيل صوت الآذان");
      setIsTestingAdhan(false);
    });

    audio.onended = () => setIsTestingAdhan(false);
    
    setTimeout(() => {
      audio.pause();
      setIsTestingAdhan(false);
    }, 15000);
  };

  const prayers = [
    { key: "fajr" as const, nameAr: "الفجر", icon: Sunrise },
    { key: "dhuhr" as const, nameAr: "الظهر", icon: Sun },
    { key: "asr" as const, nameAr: "العصر", icon: Sun },
    { key: "maghrib" as const, nameAr: "المغرب", icon: Moon },
    { key: "isha" as const, nameAr: "العشاء", icon: Moon },
  ];

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
              {/* Prayer Notifications */}
              <Collapsible open={prayerOpen} onOpenChange={setPrayerOpen}>
                <Card className="p-4">
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-primary" />
                        <div className="text-right">
                          <p className="font-medium text-foreground">تنبيهات الصلاة</p>
                          <p className="text-sm text-muted-foreground">
                            تنبيه لكل صلاة مع صوت الآذان
                          </p>
                        </div>
                      </div>
                      {prayerOpen ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="pt-4 space-y-4">
                    {/* Prayer Toggles */}
                    <div className="space-y-3 border-t border-border pt-4">
                      {prayers.map((prayer) => (
                        <div key={prayer.key} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <prayer.icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{prayer.nameAr}</span>
                          </div>
                          <Switch
                            checked={prayerSettings[prayer.key]}
                            onCheckedChange={() => handlePrayerToggle(prayer.key)}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Adhan Sound Selection */}
                    <div className="border-t border-border pt-4">
                      <Label className="text-foreground mb-2 block">صوت الآذان</Label>
                      <RadioGroup value={adhanSound} onValueChange={handleAdhanChange} className="space-y-2">
                        {adhanSounds.map((sound) => (
                          <div key={sound.id} className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value={sound.id} id={sound.id} />
                            <Label htmlFor={sound.id} className="cursor-pointer flex-1">
                              {sound.nameAr}
                            </Label>
                            {adhanSound === sound.id && (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        ))}
                      </RadioGroup>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testAdhan}
                        disabled={isTestingAdhan}
                        className="mt-3 w-full"
                      >
                        <Volume2 className="w-4 h-4 ml-2" />
                        {isTestingAdhan ? "جاري التشغيل..." : "اختبار صوت الآذان"}
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

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
                      <div className="flex items-center justify-between pt-2 border-t border-border">
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
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Daily Wird */}
              <Card className="p-4">
                <Link to="/settings" className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div className="text-right">
                      <p className="font-medium text-foreground">تذكير الورد اليومي</p>
                      <p className="text-sm text-muted-foreground">
                        {settings.daily_wird_enabled ? `مفعل - ${settings.daily_wird_time?.slice(0, 5)}` : "غير مفعل"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground rotate-180" />
                </Link>
              </Card>
            </>
          )}

          {/* Location Warning */}
          {isEnabled && !settings.latitude && (
            <Card className="p-4 border-amber-500/50 bg-amber-500/10">
              <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                يجب تحديد موقعك لتفعيل تنبيهات الصلاة بدقة
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default NotificationSettingsPage;
