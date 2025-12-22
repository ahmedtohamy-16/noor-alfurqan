import { User, Settings, LogIn } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  // Mock user state - would come from auth
  const isLoggedIn = false;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 arabic-ui">
        <h1 className="text-3xl font-bold text-foreground text-center mb-8">
          حسابي
        </h1>

        {!isLoggedIn ? (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              مرحباً بك
            </h2>
            <p className="text-muted-foreground mb-6">
              سجل دخولك لحفظ تقدمك ومزامنة آياتك المفضلة
            </p>
            <Button size="lg" className="gap-2">
              <LogIn className="w-5 h-5" />
              تسجيل الدخول
            </Button>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            {/* Profile Card */}
            <div className="bg-card border border-border rounded-2xl p-6 text-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">اسم المستخدم</h2>
              <p className="text-muted-foreground text-sm">user@email.com</p>
            </div>

            {/* Settings */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <button className="w-full flex items-center gap-4 p-4 hover:bg-muted transition-colors">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-right text-foreground">الإعدادات</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
