import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowRight, KeyRound, CheckCircle, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

type Step = "email" | "success";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Client-side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrorMessage("يرجى إدخال البريد الإلكتروني");
      return;
    }
    if (!emailRegex.test(email)) {
      setErrorMessage("البريد الإلكتروني غير صالح");
      return;
    }

    setIsLoading(true);

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth`,
        handleCodeInApp: false,
      });
      
      toast.success("تم إرسال رابط إعادة تعيين كلمة المرور");
      setStep("success");
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      
      if (error.code === "auth/user-not-found") {
        // Don't reveal if user exists for security
        toast.success("إذا كان البريد مسجلاً، سيتم إرسال رابط الاستعادة");
        setStep("success");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("البريد الإلكتروني غير صالح");
      } else if (error.code === "auth/too-many-requests") {
        setErrorMessage("تم إجراء محاولات كثيرة. حاول لاحقاً");
      } else {
        setErrorMessage("حدث خطأ، حاول مرة أخرى");
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
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              {step === "success" ? (
                <CheckCircle className="w-8 h-8 text-primary-foreground" />
              ) : (
                <KeyRound className="w-8 h-8 text-primary-foreground" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {step === "success" ? "تم الإرسال بنجاح" : "نسيت كلمة المرور؟"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {step === "email" && "أدخل بريدك الإلكتروني لاستعادة كلمة المرور"}
              {step === "success" && "تحقق من بريدك الإلكتروني"}
            </p>
          </div>

          {/* Form Card */}
          <Card className="border-border shadow-sm">
            <CardContent className="pt-6">
              {step === "email" && (
                <form onSubmit={handleSendResetEmail} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                  
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMessage("");
                      }}
                      className="pr-10 text-right"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
                  </Button>
                </form>
              )}

              {step === "success" && (
                <div className="text-center space-y-6">
                  <div className="p-4 bg-primary/10 rounded-xl">
                    <p className="text-muted-foreground mb-2">
                      تم إرسال رابط إعادة تعيين كلمة المرور إلى:
                    </p>
                    <p className="font-medium text-primary break-all">{email}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>✓ افتح بريدك الإلكتروني</p>
                    <p>✓ اضغط على الرابط الموجود في الرسالة</p>
                    <p>✓ أنشئ كلمة مرور جديدة</p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                    💡 لم تجد الرسالة؟ تحقق من مجلد الرسائل غير المرغوب فيها (Spam)
                  </div>
                  
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
                <div className="text-center mt-6 pt-6 border-t border-border">
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
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;