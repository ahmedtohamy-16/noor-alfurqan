import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageSeo from "@/components/PageSeo";

type Kind = "terms" | "privacy";

const CONTENT: Record<Kind, { title: string; description: string; sections: { h: string; p: string }[] }> = {
  terms: {
    title: "شروط الاستخدام",
    description: "شروط استخدام تطبيق نور الفرقان.",
    sections: [
      { h: "قبول الشروط", p: "باستخدامك تطبيق نور الفرقان أو إنشاء حساب فيه فإنك توافق على هذه الشروط. إذا لم توافق عليها فلا تستخدم الحساب، ويمكنك متابعة القراءة كضيف." },
      { h: "الحساب", p: "أنت مسؤول عن صحة بياناتك والحفاظ على سرية كلمة المرور. يجب أن يكون اسم المستخدم لائقًا ولا ينتحل شخصية أحد. يحق لنا إيقاف الحسابات التي تسيء الاستخدام." },
      { h: "المحتوى", p: "نصوص القرآن الكريم والأحاديث والتفاسير مأخوذة من مصادر موثوقة ومنسوبة إليها. الاقتراحات الآلية في الميزات المدفوعة مساعدة للبحث وليست فتوى." },
      { h: "الاشتراك المدفوع (Pro)", p: "بعض الميزات متاحة لمشتركي Pro فقط. تُعرض الأسعار ومدة الاشتراك بوضوح قبل الدفع." },
      { h: "إخلاء المسؤولية", p: "نبذل جهدنا لدقة المواقيت والمحتوى، لكن يُقدَّم التطبيق كما هو. راجع الجهات المحلية في مواقيت الصلاة عند الحاجة." },
      { h: "التعديلات", p: "قد نحدّث هذه الشروط، وسنوضح تاريخ آخر تحديث في هذه الصفحة." },
    ],
  },
  privacy: {
    title: "سياسة الخصوصية",
    description: "كيف يتعامل نور الفرقان مع بياناتك.",
    sections: [
      { h: "البيانات التي نجمعها", p: "عند إنشاء حساب: البريد الإلكتروني واسم المستخدم والاسم المعروض. وأثناء الاستخدام: المفضلات وتقدم القراءة والإعدادات لحفظها على أجهزتك." },
      { h: "الموقع", p: "يُستخدم موقعك أو المدينة التي تختارها لحساب مواقيت الصلاة فقط، ويُحفظ على جهازك." },
      { h: "الاستخدام كضيف", p: "يمكنك استخدام التطبيق دون حساب، وتُحفظ بياناتك على جهازك. عند التسجيل تُنقل إلى حسابك." },
      { h: "ما لا نفعله", p: "لا نعرض إعلانات ولا نبيع بياناتك لأي جهة." },
      { h: "حذف البيانات", p: "يمكنك طلب حذف حسابك وبياناتك من صفحة الدعم في التطبيق." },
    ],
  },
};

const LegalPage = ({ kind }: { kind: Kind }) => {
  const c = CONTENT[kind];
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <PageSeo title={`${c.title} | نور الفرقان`} description={c.description} path={`/${kind}`} />
      <main className="container mx-auto max-w-3xl px-4 py-6 arabic-ui">
        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={() => navigate(-1)} aria-label="رجوع" className="p-2 rounded-full hover:bg-muted">
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">{c.title}</h1>
        </div>
        <div className="space-y-5">
          {c.sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-bold text-lg mb-1">{s.h}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.p}</p>
            </section>
          ))}
        </div>
        <p className="mt-8 text-sm">
          <Link to={kind === "terms" ? "/privacy" : "/terms"} className="text-primary underline">
            {kind === "terms" ? "سياسة الخصوصية" : "شروط الاستخدام"}
          </Link>
        </p>
      </main>
    </div>
  );
};

export default LegalPage;
