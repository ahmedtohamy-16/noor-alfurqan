import { ArrowRight, Moon, Sun, LogOut, User, Clock, Shield, Bell, Sunrise, Type, Headphones, Palette, Info, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
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
  { id: "Amiri", name: "خط Amiri", arabicName: "أميري", preview: "font-amiri" },
  { id: "Scheherazade", name: "خط Scheherazade", arabicName: "شهرزاد", preview: "font-scheherazade" },
  { id: "Noto Naskh", name: "خط Noto Naskh", arabicName: "نسخ", preview: "font-noto-naskh" },
  { id: "Uthmani", name: "الخط العثماني", arabicName: "عثماني", preview: "font-uthmani" },
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

  const getFontClass = (fontFamily: string) => {
    const font = fontOptions.find(f => f.id === fontFamily);
    return font?.preview || "font-amiri";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="container mx-auto px-4 py-8 arabic-ui">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
            <p className="text-sm text-muted-foreground">تخصيص تجربة استخدامك</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">

          {/* ====== Pro CTA ====== */}
          <Link to="/pro" className="block group">
            <Card
              className="p-5 text-white relative overflow-hidden border-0 group-hover:scale-[1.01] transition-transform"
              style={{ background: "linear-gradient(135deg, #0074fc 0%, #4ea3ff 60%, #0a4ea8 100%)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-right">
                  <p className="font-bold text-lg flex items-center gap-2 justify-end">
                    نور الفرقان Pro
                  </p>
                  <p className="text-sm text-white/85">افتح المزايا المتقدمة وادعم استمرار المشروع</p>
                </div>
                <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur text-sm font-bold whitespace-nowrap">
                  ابدأ الآن
                </div>
              </div>
            </Card>
          </Link>

          
          {/* ====== المظهر والعرض ====== */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">المظهر والعرض</h2>
            </div>
            
            <div className="space-y-3">
              {/* Theme Toggle */}
              <Card className="p-4 hover:shadow-md transition-shadow">
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

              {/* Font Settings Card */}
              <Card className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <Type className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">إعدادات الخطوط</p>
                    <p className="text-sm text-muted-foreground">تخصيص نوع وحجم الخط للآيات والأحاديث</p>
                  </div>
                </div>

                <div className="space-y-5">
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
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        {fontOptions.map((font) => (
                          <SelectItem key={font.id} value={font.id}>
                            <span className="flex items-center gap-3">
                              <span className={`${font.preview} text-lg`}>بسم الله</span>
                              <span className="text-muted-foreground">({font.arabicName})</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">حجم الخط</label>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{readingSettings.fontSize}px</span>
                    </div>
                    <Slider
                      value={[readingSettings.fontSize]}
                      min={16}
                      max={48}
                      step={2}
                      onValueChange={([val]) => updateReadingSettings({ fontSize: val })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>صغير</span>
                      <span>كبير</span>
                    </div>
                  </div>

                  {/* Line Height */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">ارتفاع السطر</label>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{readingSettings.lineHeight.toFixed(1)}</span>
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
                  <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground mb-3">معاينة مباشرة:</p>
                    <p 
                      className={`text-foreground text-center leading-relaxed ${getFontClass(readingSettings.fontFamily)}`}
                      style={{ 
                        fontSize: `${readingSettings.fontSize}px`,
                        lineHeight: readingSettings.lineHeight
                      }}
                    >
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <Separator />

          {/* ====== الصوتيات ====== */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Headphones className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">الصوتيات</h2>
            </div>
            
            <ReciterSelector />
          </section>

          <Separator />

          {/* ====== التنبيهات والتذكيرات ====== */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">التنبيهات والتذكيرات</h2>
            </div>
            
            <div className="space-y-3">
              {/* Notification Settings Link */}
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
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

              {/* Daily Wird Settings */}
              <Card className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
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
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">وقت التذكير:</span>
                    <Input type="time" value={wirdTime} onChange={(e) => handleWirdTimeChange(e.target.value)} className="w-32" />
                  </div>
                )}
              </Card>
            </div>
          </section>

          <Separator />

          {/* ====== التوقيت ====== */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sunrise className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">التوقيت</h2>
            </div>
            
            <Card className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
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

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">وضع التوقيت الصيفي</label>
                  <Select
                    value={settings.dst_mode}
                    onValueChange={(val: 'auto' | 'manual') => {
                      updateSettings({ dst_mode: val });
                      toast.success(val === 'auto' ? "تم التبديل للوضع التلقائي" : "تم التبديل للوضع اليدوي");
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="auto">تلقائي (حسب الدولة)</SelectItem>
                      <SelectItem value="manual">يدوي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.dst_mode === 'manual' && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
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
                  <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {countryHasDST(settings.country_code) 
                      ? `دولتك (${settings.country_code}) تطبق التوقيت الصيفي. ${isInDSTForCountry(settings.country_code) ? "حالياً: مُفعّل ✓" : "حالياً: غير مُفعّل"}`
                      : `دولتك (${settings.country_code}) لا تطبق التوقيت الصيفي.`}
                  </p>
                )}
              </div>
            </Card>
          </section>

          <Separator />

          {/* ====== الحساب ====== */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">الحساب</h2>
            </div>
            
            <div className="space-y-3">
              {user ? (
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">مرحباً بك</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                      <LogOut className="w-4 h-4" />
                      خروج
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
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
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-primary/20 bg-primary/5">
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
            </div>
          </section>

          <Separator />

          {/* ====== معلومات التطبيق ====== */}
          <section>
            <Card className="p-6 text-center bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Info className="w-8 h-8 text-primary-foreground" />
              </div>
              <p className="font-bold text-foreground text-xl">نور الفرقان</p>
              <p className="text-sm text-muted-foreground mt-1">الإصدار 1.0.0</p>
              <p className="text-xs text-muted-foreground mt-3">
                تطبيق إسلامي شامل للقرآن الكريم والأحاديث والأذكار
              </p>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;