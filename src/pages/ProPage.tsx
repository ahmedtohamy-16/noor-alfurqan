import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Sparkles, ShieldCheck, Crown, Gift, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePro } from "@/hooks/usePro";
import { useAuth } from "@/hooks/useAuth";
import { PRO_FEATURES } from "@/data/proFeatures";
import { toast } from "sonner";
import ProBadge from "@/components/pro/ProBadge";
import ProRedeemCard from "@/components/pro/ProRedeemCard";

const PRO_COLOR = "#0074fc";

const comparison: { name: string; free: boolean; pro: boolean }[] = [
  { name: "القرآن الكريم", free: true, pro: true },
  { name: "الأذكار", free: true, pro: true },
  { name: "مواقيت الصلاة", free: true, pro: true },
  { name: "الختمات الأساسية", free: true, pro: true },
  { name: "المفضلة", free: true, pro: true },
  { name: "الحفظ والمراجعة الذكية", free: false, pro: true },
  { name: "وضع الحافظ المتقدم", free: false, pro: true },
  { name: "المزامنة المتقدمة", free: false, pro: true },
  { name: "النسخ الاحتياطي الكامل", free: false, pro: true },
  { name: "المجموعات الخاصة", free: false, pro: true },
  { name: "التحديات الجماعية", free: false, pro: true },
  { name: "الإحصائيات المتقدمة", free: false, pro: true },
  { name: "تصدير الصور الاحترافي", free: false, pro: true },
  { name: "الرحلة الروحية الشخصية", free: false, pro: true },
];

const ProPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro, source, expiresAt } = usePro();
  const [showAll, setShowAll] = useState(false);
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");

  const visibleFeatures = useMemo(
    () => (showAll ? PRO_FEATURES : PRO_FEATURES.slice(0, 6)),
    [showAll]
  );

  const handleSubscribe = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    toast.info("بوابة الدفع قيد التحضير — تواصل معنا حاليًا للترقية.");
  };

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg flex items-center gap-2">
            <Crown className="w-5 h-5" style={{ color: PRO_COLOR }} />
            نور الفرقان Pro
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-8 arabic-ui">
        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-3xl p-6 md:p-10 text-white"
          style={{
            background: `linear-gradient(135deg, ${PRO_COLOR} 0%, #4ea3ff 60%, #0a4ea8 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 20% 10%, white 0, transparent 40%)" }} />
          <div className="relative space-y-3">
            <Badge className="bg-white/20 text-white border-0 backdrop-blur">
              <Sparkles className="w-3 h-3 ml-1" /> اشتراك Pro
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              ارتقِ برحلتك مع القرآن
            </h2>
            <p className="text-white/90 leading-relaxed max-w-2xl">
              نحرص في نور الفرقان على إبقاء الميزات الأساسية مجانية للجميع. واشتراك Pro
              يدعم استمرار المشروع ويفتح لك أدوات متقدمة للحفظ والمراجعة والتحليل.
            </p>
            {isPro && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  أنت مشترك Pro {source === "admin" ? "(وصول مشرف)" : ""}
                  {expiresAt ? ` — حتى ${expiresAt.toLocaleDateString("ar-EG")}` : ""}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Pricing */}
        {!isPro && (
          <section className="grid md:grid-cols-2 gap-4">
            <Card
              className={`p-6 cursor-pointer transition-all ${plan === "monthly" ? "ring-2" : ""}`}
              style={plan === "monthly" ? { boxShadow: `0 0 0 2px ${PRO_COLOR}` } : {}}
              onClick={() => setPlan("monthly")}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">شهري</h3>
                <Badge variant="secondary">مرن</Badge>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold">150</span>
                <span className="text-muted-foreground">ج.م / شهر</span>
              </div>
              <p className="text-sm text-muted-foreground">≈ 3$ شهريًا</p>
            </Card>

            <Card
              className="p-6 cursor-pointer transition-all relative overflow-hidden"
              style={{ boxShadow: plan === "yearly" ? `0 0 0 2px ${PRO_COLOR}` : undefined }}
              onClick={() => setPlan("yearly")}
            >
              <div className="absolute top-0 left-0 px-3 py-1 text-xs font-bold text-white rounded-br-xl"
                style={{ background: PRO_COLOR }}>
                الأكثر توفيرًا
              </div>
              <div className="flex items-center justify-between mb-3 mt-4">
                <h3 className="font-bold text-lg">سنوي</h3>
                <Badge style={{ background: PRO_COLOR, color: "white" }}>خصم 16.7%</Badge>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold">1500</span>
                <span className="text-muted-foreground">ج.م / سنة</span>
              </div>
              <p className="text-sm text-muted-foreground">
                ≈ 30$ سنويًا · بدلاً من 1800 ج.م
              </p>
            </Card>
          </section>
        )}

        {!isPro && (
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full text-white font-bold text-lg h-14 rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${PRO_COLOR}, #4ea3ff)` }}
              onClick={handleSubscribe}
            >
              <Sparkles className="w-5 h-5 ml-2" />
              ابدأ الآن — {plan === "yearly" ? "1500 ج.م/سنة" : "150 ج.م/شهر"}
            </Button>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Gift className="w-4 h-4" style={{ color: PRO_COLOR }} />
              3 أيام تجربة مجانية للمستخدمين داخل الدول العربية — يمكن الإلغاء في أي وقت
            </div>
            <ProRedeemCard />
          </div>
        )}

        {/* Comparison */}
        <section>
          <h3 className="text-xl font-bold mb-3 text-right">مقارنة بين المجاني و Pro</h3>
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1fr_70px_70px] text-sm">
              <div className="bg-muted/60 p-3 font-bold text-right">الميزة</div>
              <div className="bg-muted/60 p-3 font-bold text-center">مجاني</div>
              <div className="bg-muted/60 p-3 font-bold text-center" style={{ color: PRO_COLOR }}>Pro</div>
              {comparison.map((row, i) => (
                <div key={i} className="contents">
                  <div className="p-3 text-right border-t border-border/60">{row.name}</div>
                  <div className="p-3 text-center border-t border-border/60">
                    {row.free ? <Check className="w-4 h-4 mx-auto text-emerald-500" /> : <span className="text-muted-foreground">—</span>}
                  </div>
                  <div className="p-3 text-center border-t border-border/60">
                    {row.pro ? <Check className="w-4 h-4 mx-auto" style={{ color: PRO_COLOR }} /> : <span className="text-muted-foreground">—</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Features list */}
        <section className="space-y-3">
          <h3 className="text-xl font-bold text-right">مزايا Pro بالتفصيل</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {visibleFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.id} className="p-4 flex gap-3 items-start hover:shadow-md transition-shadow">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${PRO_COLOR}15`, color: PRO_COLOR }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <ProBadge variant="dot" />
                      <h4 className="font-bold text-sm">{f.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? (<><ChevronUp className="w-4 h-4 ml-2" /> عرض أقل</>) : (<><ChevronDown className="w-4 h-4 ml-2" /> عرض المزيد ({PRO_FEATURES.length - 6} ميزة إضافية)</>)}
          </Button>
        </section>

        {!isPro && (
          <div className="text-center pt-4">
            <Button
              size="lg"
              className="text-white font-bold px-10 h-12 rounded-2xl"
              style={{ background: PRO_COLOR }}
              onClick={handleSubscribe}
            >
              الترقية إلى Pro
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProPage;
