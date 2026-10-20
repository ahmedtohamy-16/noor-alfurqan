import {
  BookOpenCheck, Brain, Target, BellRing, Layers, BookMarked,
  CalendarClock, Mic, CloudUpload, RefreshCw, History, FileDown,
  Download, ListMusic, Repeat, Gauge, Moon, BarChart3, Trophy,
  Award, Users, HeartHandshake, Flag, Image as ImageIcon, MapPin,
  StickyNote, Notebook, Compass, Sparkles
} from "lucide-react";

export interface ProFeature {
  id: string;
  title: string;
  description: string;
  icon: any;
}

export const PRO_FEATURES: ProFeature[] = [
  { id: "quran_ai", title: "البحث القرآني الذكي", description: "اقتراح آيات مرتبطة بسؤالك أو موضوعك مع مراجع السور والآيات.", icon: Sparkles },
  { id: "memorization", title: "وضع الحافظ المتقدم", description: "اختبارات مراجعة، إخفاء كلمات، ومتابعة السور التي تحتاج للمراجعة.", icon: BookOpenCheck },
  { id: "smart_plans", title: "خطط الحفظ والختمة الذكية", description: "خطة تلقائية حسب هدفك، وتعديل ذكي عند التأخر أو التقدم.", icon: Target },
  { id: "weak_points", title: "متابعة نقاط الضعف", description: "تحليل لسجل المراجعة وعرض أكثر المناطق التي تحتاج تركيزًا.", icon: Brain },
  { id: "smart_reminders", title: "التذكيرات الذكية", description: "إشعارات تعتمد على نشاطك الفعلي، لا جداول ثابتة.", icon: BellRing },
  { id: "flashcards", title: "بطاقات الحفظ التعليمية", description: "بطاقات تفاعلية للكلمات والمعاني والمواضع المتشابهة.", icon: Layers },
  { id: "tap_meaning", title: "معنى الآية بلمسة واحدة", description: "الضغط مطولًا على الآية يعرض المعنى والكلمات الصعبة وتفسيرًا مبسطًا.", icon: BookMarked },
  { id: "adaptive_review", title: "جدول مراجعة تكيّفي", description: "يتغير تلقائيًا حسب أدائك في كل سورة.", icon: CalendarClock },
  { id: "recitation", title: "وضع التسميع", description: "سجّل تلاوتك، استمع لنفسك، وقارن التحسن مع الوقت.", icon: Mic },
  { id: "backup", title: "النسخ الاحتياطي الكامل", description: "حفظ سحابي لكل الختمات والحفظ والإحصائيات والملاحظات.", icon: CloudUpload },
  { id: "sync", title: "المزامنة بين الأجهزة", description: "وصول كامل من الهاتف واللوحي والويب بمزامنة فورية.", icon: RefreshCw },
  { id: "history", title: "استرجاع السجل القديم", description: "استعادة أي بيانات محفوظة سابقًا.", icon: History },
  { id: "export_pdf", title: "تصدير البيانات PDF", description: "تصدير الختمات والإحصائيات والحفظ بصيغة PDF.", icon: FileDown },
  { id: "download_audio", title: "تحميل التلاوات", description: "تنزيل التلاوات للاستماع بدون إنترنت.", icon: Download },
  { id: "playlists", title: "قوائم التشغيل الخاصة", description: "أنشئ قوائم مخصصة للسور أو القراء المفضلين.", icon: ListMusic },
  { id: "repeat_ayah", title: "تكرار الآيات للحفظ", description: "اختر آية أو مجموعة وكررها عددًا محددًا من المرات.", icon: Repeat },
  { id: "playback_speed", title: "التحكم في سرعة التلاوة", description: "من 0.5x حتى 2x لتناسب طريقة حفظك.", icon: Gauge },
  { id: "sleep_timer", title: "مؤقت النوم", description: "إيقاف التشغيل تلقائيًا بعد مدة تحددها.", icon: Moon },
  { id: "advanced_stats", title: "الإحصائيات المتقدمة", description: "عدد الختمات، الأيام المتتالية، خريطة النشاط، ومقارنات شهرية.", icon: BarChart3 },
  { id: "achievements", title: "نظام الإنجازات", description: "شارات لأول ختمة و30 يومًا متتالية و100 يوم ورد متواصل وغيرها.", icon: Trophy },
  { id: "supporter_badge", title: "شارة داعم المشروع", description: "تظهر بجانب اسمك داخل المجتمع.", icon: Award },
  { id: "private_groups", title: "المجموعات الخاصة", description: "أنشئ مجموعات حفظ ومتابعة خاصة بأصدقائك.", icon: Users },
  { id: "group_wird", title: "الورد الجماعي", description: "تنفيذ ورد جماعي مع متابعة تقدم كل عضو.", icon: HeartHandshake },
  { id: "group_khatmah", title: "تحدي الختمة الجماعية", description: "إنجاز ختمة جماعية بين أعضاء المجموعة.", icon: Flag },
  { id: "export_images", title: "تصدير الآيات والأحاديث صور", description: "خلفيات وألوان وأحجام جاهزة للمنشورات والقصص.", icon: ImageIcon },
  { id: "prayer_image", title: "تنزيل مواقيت الصلاة كصورة", description: "بطاقة يومية فيها المدينة والتاريخ وأوقات الصلوات.", icon: MapPin },
  { id: "notes", title: "الملاحظات والتدبر", description: "حفظ ملاحظات خاصة على الآيات والأحاديث والدروس.", icon: StickyNote },
  { id: "journal", title: "المذكرة الروحية", description: "يوميات خاصة لمتابعة رحلتك الإيمانية.", icon: Notebook },
  { id: "spiritual_journey", title: "الرحلة الروحية الشخصية", description: "خطة أسبوعية متكاملة وتقرير شهري شامل للتقدم.", icon: Compass },
];
