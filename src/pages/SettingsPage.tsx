import { ArrowRight, Moon, Sun, LogOut, User, Clock, Shield, Bell, Sunrise, Type } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import ReciterSelector from "@/components/ReciterSelector";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useReadingSettings } from "@/hooks/useReadingSettings";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { firestoreQuery, COLLECTIONS } from "@/lib/firebase";
import { countryHasDST, isInDSTForCountry, getDSTStatusText } from "@/utils/dstUtils";

const fontOptions = [
  { id: "Amiri", name: "خط Amiri", arabicName: "أميري" },
  { id: "Scheherazade", name: "خط Scheherazade", arabicName: "شهرزاد" },
  { id: "Noto Naskh", name: "خط Noto Naskh", arabicName: "نسخ" },
  { id: "Uthmani", name: "الخط العثماني", arabicName: "عثماني" },
];

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { settings, updateSettings } = useUserSettings();
  const { settings: readingSettings, updateSettings: updateReadingSettings } = useReadingSettings();
  const { permission, requestPermission } = useNotifications();
  const navigate = useNavigate();
  const [wirdTime, setWirdTime] = useState("06:00");
  const [isAdmin, setIsAdmin] = useState(false);

  // Update wirdTime when settings are loaded
  useEffect(() => {
    if (settings.daily_wird_time) {
      setWirdTime(settings.daily_wird_time.slice(0, 5));
    }
  }, [settings.daily_wird_time]);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    try {
      // For now, check admin status in Firestore user_roles collection
      const roles = await firestoreQuery<any>(
        'user_roles',
        [
          { field: "user_id", op: "==", value: user.uid },
          { field: "role", op: "==", value: "admin" }
        ]
      );
      setIsAdmin(roles.length > 0);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/");
  };

  const handleWirdTimeChange = async (time: string) => {
    setWirdTime(time);
    await updateSettings({ daily_wird_time: time + ":00" });
    toast.success("تم تحديث وقت الورد");
  };

  const handleDailyWirdToggle = async () => {
    const next = !settings.daily_wird_enabled;

    if (next) {
      const ok = permission === "granted" ? true : await requestPermission();
      if (!ok) {
        toast.error("لا يمكن تفعيل تذكير الورد بدون السماح بالإشعارات");
        return;
      }

      await updateSettings({ daily_wird_enabled: true });
      toast.success("تم تفعيل تذكير الورد اليومي");
      return;
    }

    await updateSettings({ daily_wird_enabled: false });
    toast.success("تم إيقاف تذكير الورد اليومي");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-8 arabic-ui">
        {/* Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
        </div>

        <div className="max-w-lg mx-auto space-y-4">
          {/* Theme Toggle */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                <div>
                  <p className="font-medium text-foreground">الوضع الليلي</p>
                  <p className="text-sm text-muted-foreground">تفعيل المظهر الداكن للتطبيق</p>
                </div>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </Card>

          {/* Notification Settings Link */}
          <Card className="p-4">
            <Link to="/notification-settings" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">إعدادات التنبيهات</p>
                  <p className="text-sm text-muted-foreground">تنبيهات الأذكار والورد اليومي</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground rotate-180" />
            </Link>
          </Card>

          {/* DST (Daylight Saving Time) Settings */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Sunrise className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">التوقيت الصيفي (DST)</p>
                <p className="text-sm text-muted-foreground">
                  {settings.country_code 
                    ? getDSTStatusText(settings.country_code)
                    : "حدد موقعك أولاً لضبط التوقيت"}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">وضع التوقيت الصيفي</label>
                <Select
                  value={settings.dst_mode}
                  onValueChange={(val: 'auto' | 'manual') => {
                    updateSettings({ dst_mode: val });
                    toast.success(val === 'auto' ? "تم التبديل للوضع التلقائي" : "تم التبديل للوضع اليدوي");
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">تلقائي (حسب الدولة)</SelectItem>
                    <SelectItem value="manual">يدوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.dst_mode === 'manual' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">تفعيل التوقيت الصيفي (+1 ساعة)</span>
                  <Switch
                    checked={settings.dst_enabled}
                    onCheckedChange={(checked) => {
                      updateSettings({ dst_enabled: checked });
                      toast.success(checked ? "تم تفعيل التوقيت الصيفي" : "تم إلغاء التوقيت الصيفي");
                    }}
                  />
                </div>
              )}

              {settings.dst_mode === 'auto' && settings.country_code && (
                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  {countryHasDST(settings.country_code) 
                    ? `دولتك (${settings.country_code}) تطبق التوقيت الصيفي. ${isInDSTForCountry(settings.country_code) ? "حالياً: مُفعّل" : "حالياً: غير مُفعّل"}`
                    : `دولتك (${settings.country_code}) لا تطبق التوقيت الصيفي.`}
                </p>
              )}
            </div>
          </Card>

          {/* Daily Wird Settings */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">تذكير الورد اليومي</p>
                  <p className="text-sm text-muted-foreground">تذكير يومي لقراءة وردك من القرآن</p>
                </div>
              </div>
              <Switch checked={settings.daily_wird_enabled} onCheckedChange={handleDailyWirdToggle} />
            </div>

            {settings.daily_wird_enabled && (
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">وقت التذكير:</span>
                <Input type="time" value={wirdTime} onChange={(e) => handleWirdTimeChange(e.target.value)} className="w-32" />
              </div>
            )}
          </Card>

          {/* Font Settings */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">إعدادات الخطوط</p>
                <p className="text-sm text-muted-foreground">تخصيص نوع وحجم الخط للآيات والأحاديث</p>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-border">
              {/* Font Family */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">نوع الخط</label>
                <Select
                  value={readingSettings.fontFamily}
                  onValueChange={(val: "Amiri" | "Scheherazade" | "Noto Naskh" | "Uthmani") => {
                    updateReadingSettings({ fontFamily: val });
                    toast.success(`تم تغيير الخط إلى ${fontOptions.find(f => f.id === val)?.arabicName}`);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.id} value={font.id}>
                        <span className="flex items-center gap-2">
                          <span>{font.arabicName}</span>
                          <span className="text-xs text-muted-foreground">({font.id})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">حجم الخط</label>
                  <span className="text-sm text-muted-foreground">{readingSettings.fontSize}px</span>
                </div>
                <Slider
                  value={[readingSettings.fontSize]}
                  min={16}
                  max={48}
                  step={2}
                  onValueChange={([val]) => updateReadingSettings({ fontSize: val })}
                  className="w-full"
                />
              </div>

              {/* Line Height */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">ارتفاع السطر</label>
                  <span className="text-sm text-muted-foreground">{readingSettings.lineHeight}</span>
                </div>
                <Slider
                  value={[readingSettings.lineHeight]}
                  min={1.5}
                  max={3}
                  step={0.1}
                  onValueChange={([val]) => updateReadingSettings({ lineHeight: val })}
                  className="w-full"
                />
              </div>

              {/* Preview */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">معاينة:</p>
                <p 
                  className="text-foreground text-center"
                  style={{ 
                    fontFamily: readingSettings.fontFamily === "Noto Naskh" ? "'Noto Naskh Arabic', serif" 
                      : readingSettings.fontFamily === "Scheherazade" ? "'Scheherazade New', serif"
                      : readingSettings.fontFamily === "Uthmani" ? "'Amiri', serif"
                      : "'Amiri', serif",
                    fontSize: `${readingSettings.fontSize}px`,
                    lineHeight: readingSettings.lineHeight
                  }}
                >
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              </div>
            </div>
          </Card>

          {/* Reciter Selector */}
          <ReciterSelector />

          {/* User Account */}
          {user ? (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">الحساب</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 ml-2" />
                  خروج
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">تسجيل الدخول</p>
                    <p className="text-sm text-muted-foreground">سجل دخولك لحفظ المفضلة والختمات</p>
                  </div>
                </div>
                <Link to="/auth">
                  <Button size="sm">دخول</Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Admin Panel Link */}
          {isAdmin && (
            <Card className="p-4">
              <Link to="/admin" className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">لوحة الإدارة</p>
                    <p className="text-sm text-muted-foreground">إدارة المستخدمين والإعدادات</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground rotate-180" />
              </Link>
            </Card>
          )}

          {/* App Info */}
          <Card className="p-4">
            <div className="text-center">
              <p className="font-bold text-foreground text-lg">نور الفرقان</p>
              <p className="text-sm text-muted-foreground">الإصدار 1.0.0</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
