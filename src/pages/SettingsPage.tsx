import { ArrowRight, Moon, Sun, LogOut, User, Bell, BellOff, Clock, Headphones, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import ReciterSelector from "@/components/ReciterSelector";
import PrayerNotificationSettings from "@/components/PrayerNotificationSettings";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useUserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { settings, updateSettings } = useUserSettings();
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
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();
    setIsAdmin(!!data);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/");
  };

  const handleWirdTimeChange = async (time: string) => {
    setWirdTime(time);
    await updateSettings({ daily_wird_time: time + ":00" });
    toast.success("تم تحديث وقت التذكير بالورد");
  };

  const handleDailyWirdToggle = async () => {
    await updateSettings({ daily_wird_enabled: !settings.daily_wird_enabled });
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
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                <div>
                  <p className="font-medium text-foreground">الوضع الليلي</p>
                  <p className="text-sm text-muted-foreground">
                    تفعيل المظهر الداكن للتطبيق
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
          </Card>

          {/* Prayer Notifications */}
          <PrayerNotificationSettings />

          {/* Daily Wird Settings */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">تذكير الورد اليومي</p>
                  <p className="text-sm text-muted-foreground">
                    تذكير يومي لقراءة وردك من القرآن
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.daily_wird_enabled}
                onCheckedChange={handleDailyWirdToggle}
              />
            </div>
            
            {settings.daily_wird_enabled && (
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">وقت التذكير:</span>
                <Input
                  type="time"
                  value={wirdTime}
                  onChange={(e) => handleWirdTimeChange(e.target.value)}
                  className="w-32"
                />
              </div>
            )}
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
                    <p className="text-sm text-muted-foreground">
                      سجل دخولك لحفظ المفضلة والختمات
                    </p>
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
                    <p className="text-sm text-muted-foreground">
                      إدارة المستخدمين والإعدادات
                    </p>
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
