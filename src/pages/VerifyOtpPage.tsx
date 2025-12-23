import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, BookOpen, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

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
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      });

      if (error) throw error;

      toast.success("تم التحقق بنجاح! مرحباً بك");
      navigate("/");
    } catch (error: any) {
      console.error("OTP verification error:", error);
      if (error.message.includes("expired")) {
        toast.error("انتهت صلاحية الرمز. يرجى طلب رمز جديد");
      } else if (error.message.includes("invalid")) {
        toast.error("رمز التحقق غير صحيح");
      } else {
        toast.error(error.message || "حدث خطأ في التحقق");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) throw error;

      toast.success("تم إرسال رمز جديد إلى بريدك الإلكتروني");
      setResendCooldown(60);
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast.error(error.message || "حدث خطأ في إعادة الإرسال");
    } finally {
      setIsLoading(false);
    }
  };

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
              أدخل رمز التحقق المرسل إلى
            </p>
            <p className="text-primary font-medium mt-1" dir="ltr">
              {email}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
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
                className="text-primary"
              >
                {resendCooldown > 0
                  ? `إعادة الإرسال بعد ${resendCooldown} ثانية`
                  : "إعادة إرسال الرمز"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyOtpPage;
