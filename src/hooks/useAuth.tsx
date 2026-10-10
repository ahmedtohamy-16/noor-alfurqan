import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/lib/firebase";
import { toast } from "sonner";

/**
 * Supabase Auth is the only account system.
 * `user` keeps the legacy shape (uid/email/displayName/photoURL/emailVerified)
 * so existing components keep working.
 */
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface AppProfile {
  uid: string;
  email: string | null;
  username: string | null;
  displayName: string | null;
  photoURL: string | null;
  isBanned: boolean;
  role: UserRole;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  userProfile: AppProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isBanned: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  /** Returns true when the account needs email confirmation before sign-in. */
  signUp: (email: string, password: string, username?: string, role?: UserRole) => Promise<{ needsConfirmation: boolean }>;
  signInWithGoogle: (role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkUserBanned: (email: string) => Promise<boolean>;
  resendConfirmation: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toAppUser = (u: User): AppUser => ({
  uid: u.id,
  email: u.email ?? null,
  displayName: (u.user_metadata?.display_name as string) || (u.user_metadata?.username as string) || null,
  photoURL: (u.user_metadata?.avatar_url as string) || null,
  emailVerified: !!u.email_confirmed_at,
});

/** Arabic messages for common Supabase auth errors. */
export const authErrorMessage = (err: any): string => {
  const msg = String(err?.message || "").toLowerCase();
  const code = String(err?.code || "");
  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) return "لم يتم تأكيد بريدك الإلكتروني بعد. افتح رسالة التأكيد أو أعد إرسالها";
  if (code === "user_already_exists" || msg.includes("already registered")) return "هذا البريد الإلكتروني مسجل مسبقاً";
  if (code === "weak_password" || msg.includes("password should")) return "كلمة المرور ضعيفة، استخدم 8 أحرف على الأقل مع أرقام";
  if (code === "over_email_send_rate_limit" || msg.includes("rate limit")) return "محاولات كثيرة، انتظر قليلاً ثم حاول مرة أخرى";
  if (code === "email_address_invalid" || msg.includes("invalid email") || msg.includes("is invalid")) return "البريد الإلكتروني غير صالح";
  if (code === "user_banned") return "حسابك محظور. تواصل مع الإدارة";
  if (code === "same_password") return "كلمة المرور الجديدة يجب أن تختلف عن القديمة";
  if (msg.includes("failed to fetch") || msg.includes("network")) return "تحقق من اتصالك بالإنترنت";
  if (code === "signup_disabled") return "إنشاء الحسابات متوقف حالياً";
  if (msg.includes("database error saving new user") || msg.includes("duplicate key") || code === "23505")
    return "اسم المستخدم محجوز، اختر اسماً آخر";
  return "حدث خطأ، حاول مرة أخرى";
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [userProfile, setUserProfile] = useState<AppProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  const loadUserData = useCallback(async (u: User) => {
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, username, display_name, avatar_url, email, is_blocked").eq("id", u.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", u.id),
    ]);
    const isAdmin = (roles || []).some((r) => r.role === "admin");
    const r: UserRole = isAdmin ? "admin" : "student";
    setRole(r);
    if (profile?.is_blocked) {
      setIsBanned(true);
      await supabase.auth.signOut();
      toast.error("حسابك محظور. تواصل مع الإدارة للمزيد من المعلومات");
      return;
    }
    setUserProfile({
      uid: u.id,
      email: profile?.email ?? u.email ?? null,
      username: profile?.username ?? null,
      displayName: profile?.display_name ?? toAppUser(u).displayName,
      photoURL: profile?.avatar_url ?? null,
      isBanned: false,
      role: r,
    });
  }, []);

  useEffect(() => {
    // Listener first, then restore the persisted session.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ? toAppUser(s.user) : null);
      setIsLoading(false);
      if (s?.user) {
        // Defer DB calls out of the auth callback.
        setTimeout(() => loadUserData(s.user), 0);
      } else {
        setRole(null);
        setUserProfile(null);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ? toAppUser(data.session.user) : null);
      setIsLoading(false);
      if (data.session?.user) loadUserData(data.session.user);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    setIsBanned(false);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, username?: string) => {
    const name = (username || email.split("@")[0]).trim();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username: name, display_name: name },
      },
    });
    if (error) throw error;
    // Supabase returns a user with no identities when the email already exists.
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      throw { code: "user_already_exists", message: "already registered" };
    }
    return { needsConfirmation: !data.session };
  };

  const signInWithGoogle = async () => {
    toast.error("تسجيل الدخول عبر Google غير متاح حالياً");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setUserProfile(null);
    setIsBanned(false);
  };

  const refreshProfile = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) await loadUserData(data.user);
  };

  // Ban status is enforced after sign-in via the user's own profile row.
  const checkUserBanned = async () => false;

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        role,
        isLoading,
        isAdmin: role === "admin",
        isTeacher: role === "teacher" || role === "admin",
        isBanned,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshProfile,
        checkUserBanned,
        resendConfirmation,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
