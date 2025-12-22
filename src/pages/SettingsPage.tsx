import { ArrowRight, Moon, Sun, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Header from "@/components/Header";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
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
