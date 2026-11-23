import { useState, useEffect, useRef } from "react";
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
import { supabase } from "@/integrations/supabase/untypedClient";
import { validateUsername, sanitizeUsernameInput, friendlyUsernameError } from "@/lib/usernameRules";
import { arabicDigits } from "@/lib/displayFormat";
import { resolveAvatar, AVATAR_BUCKET, avatarFileAllowed } from "@/lib/profileAvatar";

interface ProfileData {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  username_change_count: number | null;
  displayname_change_count: number | null;
}

const PROFILE_COLUMNS = "id, username, display_name, avatar_url, created_at";

const getProfile = async (id: string): Promise<ProfileData | null> => {
  const { data, error } = await supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as ProfileData) ?? null;
};

const formatJoinDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }) : "غير معروف";

type UsernameStatus = "idle" | "invalid" | "checking" | "available" | "taken" | "error";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, userProfile, role, signOut, refreshProfile, resetPassword, isLoading: authLoading } = useAuth();
  const photoInput = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const uploadAvatar = async (file?: File) => {
    if (!user || !file) return;
    if (!avatarFileAllowed(file)) { toast.error("اختر صورة JPG أو PNG أو WebP لا تزيد عن ٢ ميجابايت"); return; }
    setUploading(true);
    const oldPath = profile?.avatar_url;
    const path = `${user.uid}/${crypto.randomUUID()}.${file.type.split('/')[1]}`;
    try {
      const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { error: profileError } = await supabase.from('profiles').update({ avatar_url: path }).eq('id', user.uid);
      if (profileError) { await supabase.storage.from(AVATAR_BUCKET).remove([path]); throw profileError; }
      setAvatar(await resolveAvatar(path));
      setProfile(previous => previous ? { ...previous, avatar_url: path } : previous);
      await refreshProfile();
      if (oldPath?.startsWith(`${user.uid}/`)) await supabase.storage.from(AVATAR_BUCKET).remove([oldPath]);
      toast.success("تم حفظ الصورة الشخصية");
    } catch { toast.error("تعذّر حفظ الصورة؛ حاول مرة أخرى"); }
    finally { setUploading(false); if (photoInput.current) photoInput.current.value = ''; }
  };
  
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
        setAvatar(await resolveAvatar(profileData?.avatar_url));
        setLoadError(false);
        
        if (profileData) {
          setNewUsername(profileData.username || "");
          setNewDisplayName(profileData.display_name || userProfile?.displayName || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [user, userProfile]);

  // Live availability check for the username editor (debounced).
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [usernameMessage, setUsernameMessage] = useState("");
  useEffect(() => {
    if (!isEditingUsername) return;
    const name = newUsername.trim();
    if (!name || name === profile?.username) { setUsernameStatus("idle"); setUsernameMessage(""); return; }
    const v = validateUsername(name);
    if (!v.valid) { setUsernameStatus("invalid"); setUsernameMessage(v.reason || "اسم المستخدم غير صالح"); return; }
    setUsernameStatus("checking"); setUsernameMessage("");
    let cancelled = false;
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc("check_username_available", { name });
      if (cancelled) return;
      if (error) { setUsernameStatus("error"); setUsernameMessage("تعذر التحقق من الاسم، حاول مرة أخرى"); }
      else if (data) { setUsernameStatus("available"); setUsernameMessage("اسم المستخدم متاح"); }
      else { setUsernameStatus("taken"); setUsernameMessage("اسم المستخدم هذا مستخدم سابقًا"); }
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [newUsername, isEditingUsername, profile?.username]);

  const handleSaveUsername = async () => {
    if (!user) return;
    const name = newUsername.trim();
    if (name === profile?.username) { setIsEditingUsername(false); return; }
    const v = validateUsername(name);
    if (!v.valid) { toast.error(v.reason || "اسم المستخدم غير صالح"); return; }

    setIsSaving(true);
    const { data: available, error: checkError } = await supabase.rpc("check_username_available", { name });
    if (checkError || !available) {
      toast.error(checkError ? "تعذر التحقق من الاسم، حاول مرة أخرى" : "اسم المستخدم هذا مستخدم سابقًا، اختر اسمًا آخر");
      setIsSaving(false);
      return;
    }
    const { error } = await supabase.from("profiles").update({ username: name }).eq("id", user.uid);
    if (!error) {
      toast.success("تم تحديث اسم المستخدم بنجاح");
      setIsEditingUsername(false);
      const updated = await getProfile(user.uid);
      if (updated) setProfile(updated);
      await refreshProfile();
    } else {
      toast.error(friendlyUsernameError(error));
    }
    setIsSaving(false);
  };

  const handleSaveDisplayName = async () => {
    const name = newDisplayName.trim();
    if (!user || !name) return;

    setIsSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: name.slice(0, 100) }).eq("id", user.uid);
    if (!error) {
      toast.success("تم تحديث الاسم بنجاح");
      setIsEditingDisplayName(false);
      const updated = await getProfile(user.uid);
      if (updated) setProfile(updated);
      await refreshProfile();
    } else {
      toast.error("تعذر حفظ الاسم، حاول مرة أخرى");
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
        return <Badge variant="outline" className="text-primary border-primary/20">مسؤول</Badge>;
      case "teacher":
        return <Badge variant="outline">معلم</Badge>;
      default:
        return <Badge variant="outline">عضو</Badge>;
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
        <div className="max-w-2xl mx-auto space-y-6 pb-28">
          <h1 className="text-2xl font-bold">الملف الشخصي</h1>
          {loadError && <p role="alert" className="text-destructive">تعذّر تحميل بيانات حسابك؛ أعد فتح الصفحة عند الاتصال.</p>}
          
          {/* Profile Header Card */}
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-l from-primary/20 via-primary/10 to-transparent" />
            <CardContent className="-mt-12 pb-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center overflow-hidden">
                    {avatar || userProfile?.photoURL ? (
                      <img 
                        src={avatar || userProfile?.photoURL || ""}
                        alt="الصورة الشخصية للمستخدم" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => void uploadAvatar(e.target.files?.[0])} />
                  <Button size="icon" aria-label="تغيير الصورة الشخصية" disabled={uploading}
                    className="absolute bottom-0 right-0 w-11 h-11 rounded-full shadow-lg"
                    onClick={() => photoInput.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
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
                      يمكنك التغيير بعد {arabicDigits(displayNameRestriction.daysRemaining)} يوم
                    </p>
                  )}
                </div>
                
                {/* Username */}
                <div className="mt-2 w-full max-w-xs">
                  {isEditingUsername ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newUsername}
                        onChange={(e) => setNewUsername(sanitizeUsernameInput(e.target.value))}
                        className={`text-center text-sm ${
                          usernameStatus === "available" ? "border-green-500 focus-visible:ring-green-500"
                          : usernameStatus === "taken" || usernameStatus === "invalid" ? "border-destructive focus-visible:ring-destructive" : ""
                        }`}
                        maxLength={20}
                        dir="ltr"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder="username"
                        aria-label="اسم المستخدم"
                        aria-describedby="profile-username-status"
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={handleSaveUsername}
                        disabled={isSaving || usernameStatus === "checking" || usernameStatus === "taken" || usernameStatus === "invalid"}
                        aria-label="حفظ اسم المستخدم"
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
                  
                  {isEditingUsername && usernameMessage && (
                    <p
                      id="profile-username-status"
                      role="status"
                      className={`text-xs mt-1 ${usernameStatus === "available" ? "text-green-500" : usernameStatus === "checking" ? "text-muted-foreground" : "text-destructive"}`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  {isEditingUsername && usernameStatus === "checking" && (
                    <p className="text-xs mt-1 text-muted-foreground" role="status">جارٍ التحقق…</p>
                  )}

                  {!usernameRestriction.allowed && (
                    <p className="text-xs text-amber-500 mt-1 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      يمكنك تغيير اليوزر نيم بعد {arabicDigits(usernameRestriction.daysRemaining)} يوم
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
                    <li>يمكن تغيير اسم المستخدم (Username) مرة كل ٣٠ يوماً</li>
                    <li>يمكن تغيير الاسم (Display Name) مرة كل ٧ أيام (بحد أقصى ٣ مرات أسبوعياً)</li>
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