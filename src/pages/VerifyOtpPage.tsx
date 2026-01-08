import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Mail, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();
  
  const email = location.state?.email || "";
  const type = location.state?.type || "signup";

  useEffect(() => {
    if (!email) {
      navigate("/auth");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("يرجى إدخال رمز التحقق المكون من 6 أرقام");
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP via edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-otp?action=verify`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ email, otp }),
        }
      );
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "فشل في التحقق من الرمز");
      }

      if (!data?.valid) {
        toast.error(data?.error || "رمز التحقق غير صحيح");
        if (data?.remainingAttempts !== undefined) {
          toast.info(`المحاولات المتبقية: ${data.remainingAttempts}`);
        }
        return;
      }

      // OTP verified successfully
      setIsVerified(true);

      // If this is a signup verification, complete the registration
      if (type === "signup") {
        const pendingSignup = sessionStorage.getItem("pendingSignup");
        if (pendingSignup) {
          const { email: signupEmail, password, username, role } = JSON.parse(pendingSignup);
          
          await signUp(signupEmail, password, username, role);
          sessionStorage.removeItem("pendingSignup");
          
          toast.success("تم إنشاء حسابك بنجاح! مرحباً بك في نور الفرقان");
          
          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
      } else {
        toast.success("تم التحقق بنجاح!");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "حدث خطأ في التحقق");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    try {
      // Request new OTP via edge function (generate action)
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-otp?action=generate`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ email, type }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل في إعادة إرسال الرمز");
      }

      toast.success("تم إرسال رمز جديد إلى بريدك الإلكتروني");
      setResendCooldown(60);
      setOtp("");
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast.error(error.message || "حدث خطأ في إعادة الإرسال");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">تم التحقق بنجاح!</h1>
          <p className="text-muted-foreground">جاري تحويلك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/auth")}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 arabic-ui">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              تحقق من بريدك
            </h1>
            <p className="text-muted-foreground">
              أرسلنا رمز تحقق مكون من 6 أرقام إلى
            </p>
            <p className="text-primary font-medium mt-1" dir="ltr">
              {email}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                أدخل الرمز المرسل من <span className="font-bold text-foreground">نور الفرقان</span>
              </p>
            </div>

            <div className="flex justify-center mb-6" dir="ltr">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerify}
              className="w-full"
              size="lg"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "جاري التحقق..." : "تأكيد"}
            </Button>

            <div className="text-center mt-6 pt-6 border-t border-border">
              <p className="text-muted-foreground text-sm mb-2">
                لم يصلك الرمز؟
              </p>
              <Button
                variant="ghost"
                onClick={handleResendOtp}
                disabled={isLoading || resendCooldown > 0}
                className="text-primary gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {resendCooldown > 0
                  ? `إعادة الإرسال بعد ${resendCooldown} ثانية`
                  : "إعادة إرسال الرمز"}
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              الرمز صالح لمدة 10 دقائق فقط
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyOtpPage;
