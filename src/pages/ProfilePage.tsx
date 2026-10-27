import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Settings, 
  LogIn, 
  Camera, 
  Edit2, 
  Check, 
  X, 
  Calendar,
  Shield,
  Clock,
  History,
  AlertCircle,
  LogOut
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { 
  getProfile, 
  updateUsername, 
  updateDisplayName,
  canChangeUsername,
  canChangeDisplayName,
  formatJoinDate,
  ProfileData
} from "@/services/profileService";
import { Timestamp } from "@/lib/firebase";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, userProfile, role, signOut, isLoading: authLoading } = useAuth();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit states
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Restrictions info
  const [usernameRestriction, setUsernameRestriction] = useState({ allowed: true, daysRemaining: 0 });
  const [displayNameRestriction, setDisplayNameRestriction] = useState({ allowed: true, daysRemaining: 0, changesThisWeek: 0 });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const profileData = await getProfile(user.uid);
        setProfile(profileData);
        
        if (profileData) {
          setNewUsername(profileData.username || "");
          setNewDisplayName(profileData.display_name || userProfile?.displayName || "");
          setUsernameRestriction(canChangeUsername(profileData));
          setDisplayNameRestriction(canChangeDisplayName(profileData));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [user, userProfile]);

  const handleSaveUsername = async () => {
    if (!user || !newUsername.trim()) return;
    
    setIsSaving(true);
    const result = await updateUsername(user.uid, newUsername.trim());
    
    if (result.success) {
      toast.success("تم تحديث اسم المستخدم بنجاح");
      setProfile(prev => prev ? { ...prev, username: newUsername.trim() } : null);
      setIsEditingUsername(false);
      // Refresh restrictions
      const updated = await getProfile(user.uid);
      if (updated) setUsernameRestriction(canChangeUsername(updated));
    } else {
      toast.error(result.error || "حدث خطأ");
    }
    setIsSaving(false);
  };

  const handleSaveDisplayName = async () => {
    if (!user || !newDisplayName.trim()) return;
    
    setIsSaving(true);
    const result = await updateDisplayName(user.uid, newDisplayName.trim());
    
    if (result.success) {
      toast.success("تم تحديث الاسم بنجاح");
      setProfile(prev => prev ? { ...prev, display_name: newDisplayName.trim() } : null);
      setIsEditingDisplayName(false);
      // Refresh restrictions
      const updated = await getProfile(user.uid);
      if (updated) setDisplayNameRestriction(canChangeDisplayName(updated));
    } else {
      toast.error(result.error || "حدث خطأ");
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("تم تسجيل الخروج بنجاح");
      navigate("/");
    } catch (error) {
      toast.error("حدث خطأ في تسجيل الخروج");
    }
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">مسؤول</Badge>;
      case "teacher":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">معلم</Badge>;
      default:
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">طالب</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-muted rounded-2xl" />
              <div className="h-48 bg-muted rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 arabic-ui">
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
            <Button size="lg" className="gap-2" onClick={() => navigate("/auth")}>
              <LogIn className="w-5 h-5" />
              تسجيل الدخول
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 arabic-ui">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Profile Header Card */}
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-l from-primary/20 via-primary/10 to-transparent" />
            <CardContent className="-mt-12 pb-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url || userProfile?.photoURL ? (
                      <img 
                        src={profile?.avatar_url || userProfile?.photoURL || ""} 
                        alt="الصورة الشخصية للمستخدم" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <button 
                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                    onClick={() => toast.info("ميزة رفع الصور قيد التطوير")}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Display Name */}
                <div className="mt-4 w-full max-w-xs">
                  {isEditingDisplayName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                        className="text-center"
                        maxLength={100}
                        autoFocus
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={handleSaveDisplayName}
                        disabled={isSaving}
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => {
                          setIsEditingDisplayName(false);
                          setNewDisplayName(profile?.display_name || userProfile?.displayName || "");
                        }}
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-xl font-bold text-foreground">
                        {profile?.display_name || userProfile?.displayName || "مستخدم"}
                      </h2>
                      {displayNameRestriction.allowed && (
                        <button 
                          onClick={() => setIsEditingDisplayName(true)}
                          className="p-1 hover:bg-muted rounded-full transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  )}
                  
                  {!displayNameRestriction.allowed && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      يمكنك التغيير بعد {displayNameRestriction.daysRemaining} يوم
                    </p>
                  )}
                </div>
                
                {/* Username */}
                <div className="mt-2 w-full max-w-xs">
                  {isEditingUsername ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="text-center text-sm"
                        maxLength={50}
                        placeholder="اسم المستخدم"
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={handleSaveUsername}
                        disabled={isSaving}
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => {
                          setIsEditingUsername(false);
                          setNewUsername(profile?.username || "");
                        }}
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        @{profile?.username || "username"}
                      </p>
                      {usernameRestriction.allowed && (
                        <button 
                          onClick={() => setIsEditingUsername(true)}
                          className="p-1 hover:bg-muted rounded-full transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  )}
                  
                  {!usernameRestriction.allowed && (
                    <p className="text-xs text-amber-500 mt-1 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      يمكنك تغيير اليوزر نيم بعد {usernameRestriction.daysRemaining} يوم
                    </p>
                  )}
                </div>
                
                {/* Email & Role */}
                <div className="mt-4 flex items-center gap-3">
                  {getRoleBadge(role)}
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-right">
                <Shield className="w-5 h-5" />
                معلومات الحساب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  تاريخ الانضمام
                </span>
                <span className="font-medium">
                  {formatJoinDate(profile?.created_at)}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground flex items-center gap-2">
                  <History className="w-4 h-4" />
                  تغييرات اسم المستخدم
                </span>
                <span className="font-medium">
                  {profile?.username_change_count || 0} مرات
                </span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground flex items-center gap-2">
                  <History className="w-4 h-4" />
                  تغييرات الاسم (هذا الأسبوع)
                </span>
                <span className="font-medium">
                  {profile?.displayname_change_count || 0} / 3
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => navigate("/settings")}
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  الإعدادات
                </span>
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full justify-between"
                onClick={handleSignOut}
              >
                <span className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </span>
              </Button>
            </CardContent>
          </Card>
          
          {/* Change Restrictions Info */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 text-right">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-1">قيود التغيير</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>يمكن تغيير اسم المستخدم (Username) مرة كل 30 يوماً</li>
                    <li>يمكن تغيير الاسم (Display Name) مرة كل 7 أيام (بحد أقصى 3 مرات أسبوعياً)</li>
                    <li>جميع التغييرات يتم تسجيلها للأمان</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;