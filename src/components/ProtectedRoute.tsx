import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/** Redirects signed-out visitors to /auth and returns them afterwards. */
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading, isBanned, signOut } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to={`/auth?mode=login&next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (isBanned) {
    return (
      <div dir="rtl" className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-2xl border border-destructive/30 bg-card p-6 text-center space-y-3">
          <h1 className="text-lg font-bold text-destructive">تم إيقاف حسابك مؤقتًا</h1>
          <p className="text-sm text-muted-foreground">
            لا يمكنك استخدام هذه الصفحة حاليًا. إن كنت ترى أن هذا خطأ، تواصل مع فريق الدعم.
          </p>
          <button onClick={() => signOut()} className="w-full rounded-xl bg-primary text-primary-foreground py-2 text-sm font-semibold">
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export default ProtectedRoute;
