
# إعادة بناء صفحة الأحاديث النبوية الشريفة

## نظرة عامة

استبدال `src/pages/HadithPage.tsx` بالكامل بصفحة جديدة من الصفر بطابع راقٍ مستوحى من المصاحف الكلاسيكية، مع تدرجات ذهبية/زمردية، خط Amiri، ودعم كامل للوضع الليلي (نيلي داكن + لمسات ذهبية).

نُبقي طبقة البيانات الحالية (`useHadith` + IndexedDB + Edge Function) كما هي ونبني فوقها واجهة جديدة + مكوّنات جديدة + جدولًا واحدًا في الباك إند لتتبّع المشاركات.

## الهيكل العام للصفحة (من فوق لتحت)

```
┌─────────────────────────────────────────┐
│ Hero Header                             │
│  • أيقونة Bookmarks (يمين)              │
│  • "الأحاديث النبوية الشريفة" (Amiri)   │
│  • سطر المصادر: البخاري · مسلم · …      │
├─────────────────────────────────────────┤
│ كارت "حديث اليوم" (تدرّج ذهبي/زمردي)    │
│  • نص الحديث وسط، الراوي تحت            │
│  • زر "شارك حديث اليوم"                 │
│  • يتغيّر يوميًا (seed = تاريخ اليوم)    │
├─────────────────────────────────────────┤
│ شريط البحث الذكي (debounce 300ms)       │
│  • عدّاد النتائج + إبراز ذهبي للكلمة     │
│  • Empty state لطيف لو مفيش نتائج        │
├─────────────────────────────────────────┤
│ تابات أفقية scrollable (الكتب)          │
│  الكل · البخاري · مسلم · الترمذي …      │
│  التاب النشط: خط ذهبي تحت + bold        │
├─────────────────────────────────────────┤
│ Chips الموضوعات (multi-select)          │
│  الإيمان · الصلاة · الزكاة · …          │
├─────────────────────────────────────────┤
│ شريط أدوات: زر السورت (Dropdown)        │
│  افتراضي · الأكثر مشاركة · عشوائي · راوي│
├─────────────────────────────────────────┤
│ قائمة كروت الأحاديث (Stagger animation) │
│  • Skeleton أثناء التحميل                │
│  • Infinite scroll                       │
├─────────────────────────────────────────┤
│ زر "العودة للأعلى" يظهر بعد scroll       │
└─────────────────────────────────────────┘
```

## تصميم كارت الحديث

```
╭──────────────────────────────────────╮
│ صحيح البخاري · كتاب الإيمان   #1  🔖 │
│ ┌─[صحيح]  (Badge أخضر/أزرق/أحمر)     │
├──────────────────────────────────────┤
│ السند: حدثنا … عن … عن …  (رمادي صغير)│
│ عن أبي هريرة رضي الله عنه (ذهبي)      │
│                                       │
│ «نص الحديث بخط Amiri كبير ومريح،     │
│   مع إبراز كلمات البحث بلون ذهبي…»   │
│                                       │
│ [اقرأ المزيد] (لو > 4 سطور)           │
├──────────────────────────────────────┤
│  🔗 مشاركة   📋 نسخ   📖 شرح          │
╰──────────────────────────────────────╯
```

- نص الحديث: Amiri, 22px افتراضيًا
- السند بخط أصغر (14px) ولون باهت
- الراوي الرئيسي: لون `--gold` ذهبي بولد
- Badge الصحة يظهر **فقط** عند توفّر `hadith.grade`
- 4 أسطر افتراضية مع `line-clamp-4` + زر "اقرأ المزيد" يفتح البوتوم شيت

## البوتوم شيت (تفاصيل الحديث)

يُفتح من زر "شرح الحديث" أو "اقرأ المزيد":

1. **الحديث كاملاً** (بخط أكبر)
2. **شرح علمي** — من حقل `elaboration` (لو موجود) أو رسالة "جاري إعداد الشرح"
3. **الفوائد المستخلصة** — نقاط Bullet (إن وُجدت ضمن `elaboration` نعرضها، وإلا نخفي القسم)
4. **أحاديث مشابهة** — نتائج بحث سريع بأبرز كلمات الحديث (4–6 كلمات) في نفس الكتاب

## البحث الذكي

- يستخدم `normalizeArabic` (موجود في المشروع):
  - يشيل التشكيل `[\u064B-\u065F\u0670]`
  - يوحّد الهمزات `[إأآا] → ا`
  - يوحّد `ى → ي`، `ة → ه`
- يبحث بشكل متوازي في: `text` + `narrator` + اسم الكتاب + الموضوع (كلمات مفتاحية)
- Debounce 300ms (موجود في الصفحة الحالية)
- يبرز الكلمة بـ `<mark>` بخلفية ذهبية شفافة
- Empty state مع رسالة عربية لطيفة + اقتراح كلمات بديلة

## فلتر الموضوعات

نبني خريطة محلية من 12 موضوعًا → قائمة كلمات مفتاحية عربية لكل واحد:

```ts
TOPIC_KEYWORDS = {
  "الإيمان":  ["إيمان", "آمن", "يؤمن", "تصديق"],
  "الصلاة":   ["صلاة", "صلى", "ركع", "سجد", "وضوء"],
  "الزكاة":   ["زكاة", "صدقة", "أنفق"],
  "الصيام":   ["صوم", "صام", "أفطر", "رمضان"],
  "الحج":     ["حج", "عمرة", "طواف", "كعبة"],
  "الأخلاق":  ["خلق", "صدق", "أمانة", "حياء"],
  "الأذكار":  ["ذكر", "سبحان", "حمد", "لا إله"],
  "الدعاء":   ["دعاء", "اللهم", "استغفر"],
  // … إلخ
}
```

اختيار شريحة = تطبيق بحث داخلي بالكلمات المفتاحية. اختيار متعدد = OR بين الكلمات. لا حاجة لـ migration.

## المحفوظات (Hybrid)

- **للضيوف**: تخزين محلي في `localStorage` تحت مفتاح `hadith_bookmarks`
- **للمسجّلين**: مزامنة لـ Firestore في كولكشن `hadith_bookmarks/{uid}/items/{hadithKey}`
- عند تسجيل الدخول، نُدمج المحلي → Firestore (نفس نمط `useGuestMigration`)
- صفحة منفصلة `/hadith/bookmarks` تعرض المحفوظات مجمّعة حسب الكتاب، مع Swipe-to-delete (نستخدم touch handlers بسيطة)

## ترتيب "الأكثر مشاركة" — يتطلب Migration

جدول جديد `hadith_shares` لتتبّع المشاركات:

```sql
CREATE TABLE public.hadith_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id text NOT NULL,
  hadith_number int NOT NULL,
  share_count int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(book_id, hadith_number)
);
GRANT SELECT ON public.hadith_shares TO anon, authenticated;
GRANT ALL    ON public.hadith_shares TO service_role;
ALTER TABLE public.hadith_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.hadith_shares
  FOR SELECT USING (true);
```

+ دالة `increment_hadith_share(book_id, hadith_number)` بصلاحية `SECURITY DEFINER` تُستدعى عند الضغط على "مشاركة".

عند اختيار سورت "الأكثر مشاركة" نقرأ أعلى 50 (book_id, hadith_number) ثم نطابقها مع الأحاديث المحمّلة محليًا.

## المكوّنات الجديدة

```
src/pages/HadithPage.tsx              ← إعادة كتابة كاملة
src/pages/HadithBookmarksPage.tsx     ← جديد (route: /hadith/bookmarks)

src/components/hadith/
  HadithPageHeader.tsx           ← هيدر + Bookmark icon
  HadithOfTheDayCard.tsx         ← كارت اليوم بتدرّج ذهبي
  HadithSearchBar.tsx            ← بحث ذكي + counter
  HadithBookTabs.tsx             ← تابات كتب أفقية
  HadithTopicChips.tsx           ← شرائح موضوعات multi-select
  HadithSortMenu.tsx             ← Dropdown السورت
  HadithCardV2.tsx               ← كارت الحديث الجديد
  HadithDetailsSheet.tsx         ← Bottom Sheet (Sheet من shadcn)
  HadithBackToTop.tsx            ← زر العودة للأعلى
  HadithSkeleton.tsx             ← Loading skeleton
  HadithHighlightedText.tsx      ← إبراز كلمات البحث

src/hooks/
  useHadithBookmarks.tsx         ← Hybrid bookmarks (localStorage + Firestore)
  useHadithOfTheDay.tsx          ← اختيار حديث اليوم
  useHadithShareCount.tsx        ← قراءة/زيادة عدّاد المشاركة

src/data/
  hadithTopics.ts                ← خريطة الموضوعات → كلمات مفتاحية

src/lib/
  arabicNormalize.ts             ← (نستخدم الموجود) أو نعيد التصدير
```

نحتفظ بـ `useHadith.tsx` كما هو (طبقة البيانات / IndexedDB / Edge Function لم تتغير).

## تفاصيل تقنية مهمة

- **التايبوغرافي**: Amiri افتراضي، Scheherazade كخيار (موجود في `HadithFontControls`)
- **الألوان (Design Tokens في `index.css`)**:
  - `--hadith-gold: 38 70% 50%` (ذهبي للهايلايت والراوي)
  - `--hadith-gold-soft: 38 70% 90%` (خلفية الهايلايت)
  - Dark: خلفية `220 40% 8%` نيلي داكن، نصوص `40 30% 92%`
- **Animations**: `animate-fade-in` للكروت بـ `style={{ animationDelay: \`${i * 50}ms\` }}`
- **RTL**: `dir="rtl"` على الجذر، كل الـ flex/grid يحترم الاتجاه
- **Routes**: نضيف `<Route path="/hadith/bookmarks" element={<HadithBookmarksPage />} />` في `App.tsx`

## ترتيب التنفيذ

1. **Migration**: إنشاء `hadith_shares` + دالة `increment_hadith_share`
2. **Tokens + خط**: إضافة ألوان ذهبية في `index.css`، التأكد من تحميل Amiri
3. **Data**: إنشاء `hadithTopics.ts`
4. **Hooks**: `useHadithBookmarks`, `useHadithOfTheDay`, `useHadithShareCount`
5. **Components**: بناء كل المكوّنات الفرعية بالترتيب من الأعلى للأسفل
6. **Page**: تجميع `HadithPage.tsx` الجديدة
7. **Bookmarks Page**: بناء صفحة المحفوظات + إضافة الـ route
8. **تنظيف**: حذف المكوّنات القديمة غير المستخدمة (`HadithHeroSection`, `HadithFeaturedCard`, `HadithBookSelector`, `HadithItemCard`, `HadithInfiniteList`, `HadithLibraryCard`, `RandomHadithSection`, `HadithDetailsModal`)

## ما هو خارج النطاق (لاحقًا)

- المكتبة وإدارة التنزيلات (تُبقى متاحة عبر التاب الحالي أو نُخفيها مؤقتًا — سأنقلها لزر صغير في الهيدر يفتح Sheet للتنزيل)
- "الفوائد المستخلصة" الذكية من AI — نعرضها فقط لو موجودة ضمن `elaboration` نصًا
