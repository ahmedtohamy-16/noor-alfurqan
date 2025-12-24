# توثيق المشروع الكامل - تطبيق القرآن الكريم

## نظرة عامة
تطبيق إسلامي شامل يتضمن قراءة القرآن الكريم، أوقات الصلاة، الأذكار، التسبيح، والختمات الجماعية.

---

## 📱 الصفحات الرئيسية

### 1. الصفحة الرئيسية (`/`)
- عرض آخر موضع قراءة
- بطاقة الورد اليومي
- إحصائيات القراءة
- الصلاة القادمة

### 2. صفحة القرآن (`/quran`)
- قائمة السور مع البحث
- عرض معلومات كل سورة (عدد الآيات، مكية/مدنية)

### 3. صفحة السورة (`/surah/:id`)
- عرض آيات السورة
- مشغل صوتي للقراء
- إضافة للمفضلة
- مشاركة الآيات بصور جميلة
- التفسير

### 4. صفحة المصحف (`/mushaf`)
- عرض صفحات المصحف كاملة
- التنقل بين الصفحات

### 5. صفحة أوقات الصلاة (`/prayer-times`)
- أوقات الصلاة اليومية
- التقويم الشهري مع التصدير
- إشعارات الصلاة
- صوت الأذان

### 6. صفحة الأذكار (`/azkar`)
- أذكار الصباح والمساء
- أذكار متنوعة
- عداد التكرار

### 7. صفحة التسبيح (`/tasbih`)
- عداد رقمي للتسبيح
- أنواع مختلفة من الذكر
- إحصائيات يومية

### 8. صفحة الختمة (`/khatmah`)
- إنشاء ختمة جماعية
- الانضمام بكود الدعوة
- توزيع الأجزاء تلقائياً

### 9. صفحة البحث (`/search`)
- البحث في القرآن الكريم

### 10. صفحة المفضلة (`/favorites`)
- الآيات المحفوظة

### 11. صفحة الإعدادات (`/settings`)
- إعدادات العرض
- إعدادات الإشعارات
- اختيار الموقع

### 12. صفحة الملف الشخصي (`/profile`)
- معلومات المستخدم
- الإحصائيات الشخصية

### 13. صفحة الإدارة (`/admin`)
- إدارة المستخدمين
- إرسال الرسائل
- إحصائيات الاستخدام

---

## 🔔 نظام الإشعارات وصوت الأذان

### الملفات المعنية:
- `src/hooks/usePrayerNotifications.tsx`
- `src/hooks/useNotifications.tsx`
- `src/components/PrayerNotificationSettings.tsx`

### الميزات:
```typescript
// جدولة إشعار قبل الصلاة
scheduleNotification(prayerKey, prayerTime, reminderMinutes)

// تشغيل صوت الأذان
playAdhan(isFajr: boolean)

// مسح جميع الإشعارات المجدولة
clearAllNotifications()
```

### أصوات الأذان:
- أذان عادي: `https://www.islamcan.com/audio/adhan/azan1.mp3`
- أذان الفجر: `https://www.islamcan.com/audio/adhan/azan8.mp3`

### إعدادات الإشعارات:
- تفعيل/إيقاف الإشعارات
- تفعيل/إيقاف صوت الأذان
- وقت التذكير (5-60 دقيقة قبل الصلاة)

---

## 📅 التقويم الشهري لأوقات الصلاة

### الملف: `src/components/MonthlyCalendar.tsx`

### الميزات:
- عرض أوقات الصلاة لشهر كامل
- التنقل بين الأشهر (السابق/التالي)
- تمييز اليوم الحالي
- تصدير إلى ملف CSV

### API المستخدم:
```typescript
const API_URL = `https://api.aladhan.com/v1/calendar/${year}/${month}`;
// مع تحديد latitude, longitude, method
```

### تصدير CSV:
```typescript
const exportToCSV = () => {
  // إنشاء ملف CSV بأوقات الصلاة
  // الأعمدة: التاريخ، الفجر، الشروق، الظهر، العصر، المغرب، العشاء
}
```

---

## 👤 نظام المستخدمين والمصادقة

### الملفات:
- `src/hooks/useAuth.tsx`
- `src/pages/AuthPage.tsx`
- `src/pages/VerifyOtpPage.tsx`

### جداول قاعدة البيانات:
- `profiles` - معلومات المستخدم
- `user_settings` - إعدادات المستخدم
- `user_roles` - صلاحيات المستخدم

---

## ⚙️ إعدادات المستخدم

### الملف: `src/hooks/useUserSettings.tsx`

### الإعدادات المتاحة:
```typescript
interface UserSettings {
  notifications_enabled: boolean;
  dark_mode: boolean;
  latitude: number | null;
  longitude: number | null;
  city_name: string | null;
  prayer_method: number;
  daily_wird_enabled: boolean;
  daily_wird_time: string;
  prayer_reminder_minutes: number;
}
```

---

## 📖 إعدادات القراءة

### الملف: `src/hooks/useReadingSettings.tsx`

### الإعدادات:
```typescript
interface ReadingSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  showTranslation: boolean;
  selectedTranslation: string;
  selectedReciter: string;
  theme: string;
}
```

---

## ⭐ نظام المفضلة

### الملف: `src/hooks/useFavorites.tsx`

### الوظائف:
- `addFavorite(surahNumber, ayahNumber, surahName, ayahText)`
- `removeFavorite(surahNumber, ayahNumber)`
- `isFavorite(surahNumber, ayahNumber)`

---

## 📊 إحصائيات القراءة

### الملفات:
- `src/hooks/useReadingStats.tsx`
- `src/hooks/useReadingProgress.tsx`
- `src/components/ReadingStatsCard.tsx`

### الجداول:
- `reading_progress` - تقدم القراءة
- `reading_sessions` - جلسات القراءة

---

## 📿 نظام التسبيح

### الملفات:
- `src/hooks/useTasbih.tsx`
- `src/pages/TasbihPage.tsx`
- `src/components/TasbihCounter.tsx`

### الجدول: `tasbih_stats`

---

## 📖 الورد اليومي

### الملفات:
- `src/hooks/useDailyWird.tsx`
- `src/pages/DailyWirdPage.tsx`
- `src/components/DailyWirdCard.tsx`

### الجدول: `daily_wird`

---

## 🤝 نظام الختمات الجماعية

### الملف: `src/pages/KhatmahPage.tsx`

### الجداول:
- `khatmahs` - الختمات
- `khatmah_participants` - المشاركين

### الوظائف:
- إنشاء ختمة جديدة
- إنشاء كود دعوة فريد
- الانضمام بكود الدعوة
- توزيع الأجزاء (1-30) تلقائياً
- تتبع التقدم

---

## 🔊 مشغل الصوت

### الملف: `src/components/AudioPlayer.tsx`

### الميزات:
- تشغيل تلاوة الآيات
- اختيار القارئ
- التحكم في التشغيل

---

## 🎨 مشاركة الآيات

### الملفات:
- `src/components/ShareAyahDialog.tsx`
- `src/components/ShareAyahWithThemes.tsx`

### الميزات:
- إنشاء صورة جميلة للآية
- اختيار الثيم (خلفيات متعددة)
- تحميل الصورة

---

## 📚 التفسير

### الملف: `src/components/TafsirDialog.tsx`

---

## 🗄️ جداول قاعدة البيانات

### المستخدمين:
- `profiles` - الملفات الشخصية
- `user_settings` - الإعدادات
- `user_reading_settings` - إعدادات القراءة
- `user_roles` - الصلاحيات
- `blocked_users` - المستخدمين المحظورين

### القراءة:
- `reading_progress` - تقدم القراءة
- `reading_sessions` - جلسات القراءة
- `favorites` - المفضلة
- `daily_wird` - الورد اليومي

### الأذكار:
- `azkar` - الأذكار
- `azkar_categories` - تصنيفات الأذكار
- `user_azkar_progress` - تقدم الأذكار
- `tasbih_stats` - إحصائيات التسبيح

### الختمات:
- `khatmahs` - الختمات
- `khatmah_participants` - المشاركين

### الإشعارات:
- `push_subscriptions` - اشتراكات الإشعارات

### الإدارة:
- `admin_users` - المسؤولين
- `admin_messages` - رسائل المسؤولين
- `app_settings` - إعدادات التطبيق

### المواقع:
- `countries` - الدول
- `cities` - المدن

---

## 🔒 سياسات الأمان (RLS)

جميع الجداول محمية بسياسات Row Level Security:
- المستخدمون يرون بياناتهم فقط
- المسؤولون لهم صلاحيات إضافية
- البيانات العامة (الأذكار، المدن) متاحة للجميع

---

## 📁 هيكل الملفات

```
src/
├── components/
│   ├── ui/                    # مكونات shadcn/ui
│   ├── AudioPlayer.tsx
│   ├── AyahOptionsMenu.tsx
│   ├── BottomNavigation.tsx
│   ├── DailyWirdCard.tsx
│   ├── DisplaySettings.tsx
│   ├── Header.tsx
│   ├── HeroSection.tsx
│   ├── LastReadCard.tsx
│   ├── LocationPicker.tsx
│   ├── LocationPickerDialog.tsx
│   ├── LocationSettings.tsx
│   ├── MonthlyCalendar.tsx
│   ├── NavLink.tsx
│   ├── NextPrayerWidget.tsx
│   ├── PrayerNotificationSettings.tsx
│   ├── PrayerTimes.tsx
│   ├── PrayerTimesCompact.tsx
│   ├── ReadingStatsCard.tsx
│   ├── ReciterSelector.tsx
│   ├── ShareAyahDialog.tsx
│   ├── ShareAyahWithThemes.tsx
│   ├── SurahCard.tsx
│   ├── TafsirDialog.tsx
│   ├── TasbihCounter.tsx
│   ├── ThemeToggle.tsx
│   └── TranslationSelector.tsx
├── data/
│   ├── quranPages.ts
│   ├── reciters.ts
│   ├── surahs.ts
│   └── translations.ts
├── hooks/
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   ├── useAuth.tsx
│   ├── useDailyWird.tsx
│   ├── useFavorites.tsx
│   ├── useNotifications.tsx
│   ├── usePrayerNotifications.tsx
│   ├── useReadingProgress.tsx
│   ├── useReadingSettings.tsx
│   ├── useReadingStats.tsx
│   ├── useTasbih.tsx
│   ├── useTheme.tsx
│   └── useUserSettings.tsx
├── integrations/
│   └── supabase/
│       ├── client.ts
│       └── types.ts
├── pages/
│   ├── AdminPage.tsx
│   ├── AuthPage.tsx
│   ├── AzkarPage.tsx
│   ├── DailyWirdPage.tsx
│   ├── FavoritesPage.tsx
│   ├── Index.tsx
│   ├── KhatmahPage.tsx
│   ├── MushafPage.tsx
│   ├── NotFound.tsx
│   ├── PrayerTimesPage.tsx
│   ├── ProfilePage.tsx
│   ├── QuranPage.tsx
│   ├── ReadingStatsPage.tsx
│   ├── SearchPage.tsx
│   ├── SettingsPage.tsx
│   ├── SurahPage.tsx
│   ├── TasbihPage.tsx
│   └── VerifyOtpPage.tsx
└── lib/
    └── utils.ts
```

---

## 🛠️ التقنيات المستخدمة

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React Query (TanStack Query)
- **Backend:** Supabase (Database + Auth + RLS)
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **Charts:** Recharts
- **Date Handling:** date-fns

---

## 🔗 APIs الخارجية

### أوقات الصلاة:
```
https://api.aladhan.com/v1/timings/{timestamp}
https://api.aladhan.com/v1/calendar/{year}/{month}
```

### القرآن الكريم:
```
https://api.alquran.cloud/v1/surah/{surahNumber}
https://api.alquran.cloud/v1/ayah/{surahNumber}:{ayahNumber}/editions/{editions}
```

### صوت الأذان:
```
https://www.islamcan.com/audio/adhan/azan1.mp3
https://www.islamcan.com/audio/adhan/azan8.mp3
```

---

## 📝 ملاحظات التطوير

1. جميع الجداول تستخدم UUID كمعرف أساسي
2. سياسات RLS مفعلة على جميع الجداول
3. التطبيق يدعم الوضع المظلم والفاتح
4. الإشعارات تعمل عبر Web Notifications API
5. التطبيق متجاوب مع جميع الأجهزة (responsive)
