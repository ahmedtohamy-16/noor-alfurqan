import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { SITE_URL } from "@/components/PageSeo";

/** Per-route title/description/canonical for public pages without their own PageSeo; noindex for private pages. */
const PUBLIC: Record<string, [string, string]> = {
  "/mushaf": ["المصحف الشريف صفحة بصفحة — نور الفرقان", "تصفح المصحف الشريف بتخطيط الصفحات الأصلي مع شارات الجزء والحزب."],
  "/hadith": ["الأحاديث النبوية الشريفة — نور الفرقان", "ابحث في أحاديث البخاري ومسلم والسنن ورياض الصالحين مع الشرح وحديث اليوم."],
  "/azkar": ["أذكار الصباح والمساء — نور الفرقان", "أذكار الصباح والمساء والنوم والصلاة من الكتاب والسنة مع العداد."],
  "/tasbih": ["السبحة الإلكترونية — نور الفرقان", "سبحة إلكترونية لعدّ التسبيح والأذكار بسهولة مع حفظ التقدم."],
  "/prayer-times": ["مواقيت الصلاة اليوم حسب مدينتك — نور الفرقان", "مواقيت الصلاة الدقيقة لمدينتك مع عداد الصلاة القادمة وتنبيهات الأذان."],
  "/asma-ul-husna": ["أسماء الله الحسنى ومعانيها — نور الفرقان", "أسماء الله الحسنى التسعة والتسعون مع معانيها والاستماع إليها."],
  "/prophet-stories": ["قصص الأنبياء — نور الفرقان", "قصص الأنبياء الخمسة والعشرين المذكورين في القرآن الكريم."],
  "/ruqyah": ["الرقية الشرعية من القرآن والسنة — نور الفرقان", "آيات وأدعية الرقية الشرعية مع التشغيل المتكرر."],
  "/khatmah": ["ختمة القرآن الجماعية — نور الفرقان", "شارك في ختمة جماعية للقرآن الكريم وتابع التقدم."],
  "/lessons": ["دروس تعليمية إسلامية — نور الفرقان", "دروس في القرآن والعلوم الشرعية."],
  "/pro": ["نور الفرقان Pro — مزايا إضافية", "اشترك في نور الفرقان Pro للحصول على البحث القرآني الذكي ومزايا إضافية."],
  "/support": ["الدعم والمساعدة — نور الفرقان", "تواصل مع فريق دعم نور الفرقان."],
};
const OWN_SEO = (p: string) => p === "/" || p === "/quran" || p.startsWith("/surah/");
const PRIVATE = ["/auth", "/admin", "/user-management", "/profile", "/settings", "/notifications", "/hadith/bookmarks", "/welcome", "/memorization"];

export default function RouteSeo() {
  const { pathname } = useLocation();
  if (OWN_SEO(pathname)) return null;
  if (PRIVATE.some((p) => pathname === p || pathname.startsWith(p + "/")))
    return <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>;
  const entry = PUBLIC[pathname];
  if (!entry) return null;
  const [title, description] = entry;
  const url = `${SITE_URL}${pathname}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
