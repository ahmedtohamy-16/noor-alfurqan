# المرحلة 2: تطبيق الشكل المرسوم + إصلاحات أساسية

بناءً على الـ Mockup المرفق، عندنا 3 مهام رئيسية في هذا الرد:

---

## 1) إعادة تصميم الصفحة الرئيسية (Index) بنظام التابين

الهدف: تطبيق نفس شكل الموكاب — تبديل علوي بين **إسلامي / اجتماعي** في نفس الشاشة الرئيسية.

### Layout الجديد لـ `src/pages/Index.tsx`:

```text
┌─────────────────────────────┐
│  Header (نور الفرقان)        │
├─────────────────────────────┤
│  [ إسلامي ] [ اجتماعي ]      │  ← Toggle علوي (Pill switcher)
├─────────────────────────────┤
│                             │
│  ── وضع إسلامي ──            │
│  • NextPrayerWidget الكبير  │
│    (صورة المسجد + العداد)   │
│  • شبكة "الخدمات الإسلامية"  │
│    6 أيقونات: قرآن/صلاة/    │
│    أذكار/قبلة/سبحة/أحاديث   │
│  • "آية اليوم" Card          │
│  • LastReadCard              │
│                             │
│  ── وضع اجتماعي ──           │
│  • شريط Stories (دوائر)     │
│  • Feed: PostCard أول 3-5    │
│  • زر "عرض كل المنشورات"    │
│                             │
└─────────────────────────────┘
```

- Toggle يحفظ آخر اختيار في `localStorage` (`noor:home-mode`).
- تابع "اجتماعي" يستخدم `socialService` الموجود لجلب أحدث المنشورات.
- Stories تُعرض كـ placeholder أفقي قابل للتمرير حالياً (سنفعّلها في مرحلة لاحقة).

---

## 2) إخفاء الـ Bottom Navigation في صفحات المصادقة

المطلوب: عدم ظهور شريط التابات الـ 5 السفلي في صفحات تسجيل الدخول والتأهيل.

### التعديل في `src/components/BottomNavigation.tsx`:
إضافة قائمة مسارات مخفية:
```ts
const HIDDEN_ROUTES = ["/auth", "/welcome", "/splash", "/forgot-password", "/verification"];
if (HIDDEN_ROUTES.includes(location.pathname)) return null;
```

### تعديل CSS في `src/index.css`:
الـ `padding-bottom` العام (الذي يحجز مساحة للـ bottom nav) يُلغى على هذه المسارات عبر إضافة class `no-bottom-nav` للـ body عند الدخول لهذه الصفحات (داخل useEffect في كل صفحة، أو بـ hook موحّد في `App.tsx` يقرأ `useLocation`).

---

## 3) تتبع هوية الضيف + ترحيل البيانات عند التسجيل

المطلوب: المستخدم الذي يدخل كضيف يجب أن يكون له **معرّف ثابت** (Guest ID)، وعند التسجيل يتم نقل كل بياناته (المفضلة، آخر قراءة، الإعدادات، التسبيح…إلخ) إلى حسابه الجديد.

### الوضع الحالي:
- آلية الترحيل **موجودة بالفعل** في `src/services/guestDataService.ts` و `src/hooks/useGuestMigration.tsx`.
- البيانات تُحفظ في `localStorage` تحت مفاتيح ثابتة، وتنتقل لـ Firestore عند تسجيل الدخول.
- لكن **لا يوجد Guest ID ثابت** يمكن تتبعه أو عرضه.

### الإضافات المطلوبة:

**أ) إنشاء/جلب Guest ID:**
ملف جديد `src/services/guestIdentityService.ts`:
```ts
const GUEST_ID_KEY = "noor:guest-id";
const GUEST_NAME_KEY = "noor:guest-name";

export const getOrCreateGuestId = (): string => {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(GUEST_ID_KEY, id);
    localStorage.setItem(GUEST_NAME_KEY, `ضيف-${id.slice(-4)}`);
  }
  return id;
};

export const getGuestDisplayName = (): string =>
  localStorage.getItem(GUEST_NAME_KEY) || "زائر";
```

**ب) استخدامه في الـ Header:**
لما المستخدم مش مسجل، الـ Header يعرض اسم الضيف (مثل `ضيف-A4F2`) بدل "تسجيل الدخول" فقط.

**ج) تحسين الترحيل:**
داخل `migrateGuestDataToUser`، نضيف:
- نقل الـ Guest ID لحقل `previous_guest_id` في وثيقة المستخدم في Firestore (للأرشفة).
- تنظيف `GUEST_ID_KEY` و `GUEST_NAME_KEY` من localStorage بعد نجاح الترحيل (موجود ضمن `clearGuestData`).

**د) إضافة هذين المفتاحين لـ `GUEST_STORAGE_KEYS`** حتى يتم تنظيفهما تلقائياً.

---

## ملاحظات تقنية

- **التابات (Tabs)** في الصفحة الرئيسية: نستخدم مكوّن `Tabs` من `shadcn/ui` الموجود (`src/components/ui/tabs.tsx`).
- **Stories placeholder**: شبكة من 5 دوائر (Story + 4 وهمية) — البنية الحقيقية للـ Stories ستأتي في مرحلة لاحقة لأنها تحتاج Storage + جدول `stories`.
- **بيانات الـ Feed في الصفحة الرئيسية**: استدعاء بسيط لـ `getRecentPosts(5)` من `socialService`.
- لا تغييرات على الـ Backend أو DB في هذا الرد — كل العمل Frontend فقط.

---

## الملفات التي ستتعدّل
- `src/pages/Index.tsx` (إعادة بناء كامل)
- `src/components/BottomNavigation.tsx` (إخفاء على مسارات المصادقة)
- `src/components/Header.tsx` (عرض اسم الضيف)
- `src/services/guestDataService.ts` (إضافة مفاتيح + تنظيف Guest ID)
- `src/services/guestIdentityService.ts` (ملف جديد)
- `src/index.css` (تعديل بسيط للـ padding على مسارات المصادقة — اختياري)

## ما لن نعمله الآن (مراحل قادمة)
- شاشة Reels مستقلة + Storage للفيديوهات.
- شاشة Explore بالـ tabs (Trending / Users / Reels / Islamic Content).
- شاشة Notifications المنفصلة بشكل الموكاب.
- إعادة تصميم Profile بالكامل (Stats: Posts/Followers/Following/Likes + Tabs).
- تابات إضافية (Saved / متجر / Themes).

هل تعتمد الخطة لأبدأ التنفيذ؟
