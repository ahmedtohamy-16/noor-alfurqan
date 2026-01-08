import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowRight, KeyRound, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

type Step = "email" | "otp" | "password" | "success";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }

    setIsLoading(true);

    try {
      // Use Firebase's password reset email
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      
      toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
      setStep("success");
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      
      if (error.code === "auth/user-not-found") {
        toast.error("لا يوجد حساب مسجل بهذا البريد");
      } else if (error.code === "auth/invalid-email") {
        toast.error("البريد الإلكتروني غير صالح");
      } else {
        toast.error("حدث خطأ، حاول مرة أخرى");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/auth")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 arabic-ui">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {step === "success" ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <KeyRound className="w-8 h-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {step === "success" ? "تم الإرسال" : "نسيت كلمة المرور"}
            </CardTitle>
            <CardDescription>
              {step === "email" && "أدخل بريدك الإلكتروني لاستعادة كلمة المرور"}
              {step === "success" && "تحقق من بريدك الإلكتروني"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "email" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10 text-right"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
                </Button>
              </form>
            )}

            {step === "success" && (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  تم إرسال رابط إعادة تعيين كلمة المرور إلى:
                </p>
                <p className="font-medium text-primary">{email}</p>
                <p className="text-sm text-muted-foreground">
                  افتح بريدك الإلكتروني واضغط على الرابط لإعادة تعيين كلمة المرور
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/auth")}
                >
                  العودة لتسجيل الدخول
                </Button>
              </div>
            )}

            {/* Back to login */}
            {step !== "success" && (
              <div className="text-center mt-6">
                <Button
                  variant="link"
                  onClick={() => navigate("/auth")}
                  className="text-muted-foreground"
                >
                  العودة لتسجيل الدخول
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;