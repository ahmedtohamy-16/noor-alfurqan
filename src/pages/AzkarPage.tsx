import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, Check, Play, Pause, Volume2, VolumeX, Search, Download, Bell, BellOff, X, Share2, Shield, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import adhkarData from "@/data/adhkar.json";
import { toast } from "sonner";
import { useDownloadManager } from "@/components/DownloadManager";
import { useNotifications } from "@/hooks/useNotifications";

const AUDIO_BASE_URL = "https://raw.githubusercontent.com/rn0x/Adhkar-json/main";
import mosqueBg from "@/assets/mosque-night-hero.jpg";

interface DhikrItem {
  id: number;
  text: string;
  count: number;
  audio: string;
  filename: string;
}

interface AzkarCategory {
  id: number;
  category: string;
  audio: string;
  filename: string;
  array: DhikrItem[];
}

interface UserProgress {
  [key: string]: number;
}

// Morning and Evening category IDs
const MORNING_CATEGORY_ID = 1; // أذكار الصباح
const EVENING_CATEGORY_ID = 2; // أذكار المساء

const AzkarPage = () => {
  const [categories] = useState<AzkarCategory[]>(adhkarData as AzkarCategory[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AzkarCategory | null>(null);
  const [progress, setProgress] = useState<UserProgress>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCategoryAudioPlaying, setIsCategoryAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const categoryAudioRef = useRef<HTMLAudioElement | null>(null);
  const { addTask, updateTask } = useDownloadManager();
  const { permission, requestPermission, sendNotification, isEnabled: notificationsEnabled } = useNotifications();
  const [morningReminderEnabled, setMorningReminderEnabled] = useState(false);
  const [eveningReminderEnabled, setEveningReminderEnabled] = useState(false);

  // Load reminder settings
  useEffect(() => {
    const morningEnabled = localStorage.getItem("azkar_morning_reminder") === "true";
    const eveningEnabled = localStorage.getItem("azkar_evening_reminder") === "true";
    setMorningReminderEnabled(morningEnabled);
    setEveningReminderEnabled(eveningEnabled);
  }, []);

  // Schedule reminders
  useEffect(() => {
    if (!notificationsEnabled) return;

    const scheduleReminder = (hour: number, minute: number, title: string, body: string, tag: string) => {
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(hour, minute, 0, 0);
      
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const delay = reminderTime.getTime() - now.getTime();
      
      return setTimeout(() => {
        sendNotification(title, { body, tag });
      }, delay);
    };

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    if (morningReminderEnabled) {
      // Morning reminder at 6:00 AM
      timeouts.push(scheduleReminder(6, 0, "أذكار الصباح 🌅", "حان وقت أذكار الصباح", "morning-azkar"));
    }

    if (eveningReminderEnabled) {
      // Evening reminder at 5:00 PM
      timeouts.push(scheduleReminder(17, 0, "أذكار المساء 🌙", "حان وقت أذكار المساء", "evening-azkar"));
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [morningReminderEnabled, eveningReminderEnabled, notificationsEnabled, sendNotification]);

  // Search and filter categories
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    const query = searchQuery.toLowerCase();
    return categories.filter(category => {
      // Search in category name
      if (category.category.toLowerCase().includes(query)) return true;
      // Search in dhikr texts
      return category.array.some(dhikr => dhikr.text.toLowerCase().includes(query));
    });
  }, [categories, searchQuery]);

  // Search results within a category
  const getFilteredDhikrs = (category: AzkarCategory) => {
    if (!searchQuery.trim()) return category.array;
    const query = searchQuery.toLowerCase();
    return category.array.filter(dhikr => dhikr.text.toLowerCase().includes(query));
  };

  const toggleMorningReminder = async () => {
    if (!notificationsEnabled && !morningReminderEnabled) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    const newValue = !morningReminderEnabled;
    setMorningReminderEnabled(newValue);
    localStorage.setItem("azkar_morning_reminder", String(newValue));
    toast.success(newValue ? "تم تفعيل تذكير أذكار الصباح" : "تم إيقاف تذكير أذكار الصباح");
  };

  const toggleEveningReminder = async () => {
    if (!notificationsEnabled && !eveningReminderEnabled) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    const newValue = !eveningReminderEnabled;
    setEveningReminderEnabled(newValue);
    localStorage.setItem("azkar_evening_reminder", String(newValue));
    toast.success(newValue ? "تم تفعيل تذكير أذكار المساء" : "تم إيقاف تذكير أذكار المساء");
  };

  const downloadCategoryAudio = async (category: AzkarCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const taskId = addTask({
      name: `تحميل ${category.category}`,
      type: "reciter",
    });

    try {
      updateTask(taskId, { status: "downloading", progress: 10 });
      
      const audioUrl = `${AUDIO_BASE_URL}${category.audio}`;
      const response = await fetch(audioUrl);
      
      if (!response.ok) throw new Error("فشل التحميل");
      
      updateTask(taskId, { progress: 50 });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${category.filename || category.category}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Save to IndexedDB for offline use
      try {
        const db = await openAzkarDB();
        const tx = db.transaction("audio", "readwrite");
        const store = tx.objectStore("audio");
        await store.put({ id: category.id, blob, name: category.category });
      } catch (dbError) {
        console.log("IndexedDB not available, file downloaded only");
      }

      updateTask(taskId, { status: "completed", progress: 100 });
      toast.success("تم التحميل بنجاح");
    } catch (error) {
      updateTask(taskId, { status: "error", error: "فشل التحميل" });
      toast.error("حدث خطأ في التحميل");
    }
  };

  const downloadAllAzkar = async () => {
    const taskId = addTask({
      name: "تحميل جميع الأذكار",
      type: "reciter",
    });

    try {
      updateTask(taskId, { status: "downloading", progress: 0 });
      
      let completed = 0;
      const total = categories.length;

      for (const category of categories) {
        try {
          const audioUrl = `${AUDIO_BASE_URL}${category.audio}`;
          const response = await fetch(audioUrl);
          if (response.ok) {
            const blob = await response.blob();
            
            // Save to IndexedDB
            try {
              const db = await openAzkarDB();
              const tx = db.transaction("audio", "readwrite");
              const store = tx.objectStore("audio");
              await store.put({ id: category.id, blob, name: category.category });
            } catch (dbError) {
              console.log("IndexedDB error for category", category.id);
            }
          }
        } catch (err) {
          console.error("Error downloading category", category.id);
        }
        
        completed++;
        updateTask(taskId, { progress: (completed / total) * 100 });
      }

      updateTask(taskId, { status: "completed", progress: 100 });
      toast.success("تم تحميل جميع الأذكار للاستخدام بدون إنترنت");
    } catch (error) {
      updateTask(taskId, { status: "error", error: "فشل التحميل" });
      toast.error("حدث خطأ في التحميل");
    }
  };

  // IndexedDB helper
  const openAzkarDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("azkar-offline", 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("audio")) {
          db.createObjectStore("audio", { keyPath: "id" });
        }
      };
    });
  };

  // Load progress from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const savedProgress = localStorage.getItem(`azkar_progress_${today}`);
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`azkar_progress_${today}`, JSON.stringify(progress));
  }, [progress]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (categoryAudioRef.current) {
        categoryAudioRef.current.pause();
        categoryAudioRef.current = null;
      }
    };
  }, []);

  const getProgressKey = (categoryId: number, dhikrId: number) => {
    return `${categoryId}_${dhikrId}`;
  };

  const incrementProgress = (dhikr: DhikrItem) => {
    if (!selectedCategory) return;
    
    const key = getProgressKey(selectedCategory.id, dhikr.id);
    const currentCount = progress[key] || 0;
    if (currentCount >= dhikr.count) return;

    const newCount = currentCount + 1;
    setProgress((prev) => ({ ...prev, [key]: newCount }));

    // Vibrate for feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const playDhikrAudio = (dhikr: DhikrItem) => {
    // Stop category audio if playing
    if (categoryAudioRef.current) {
      categoryAudioRef.current.pause();
      setIsCategoryAudioPlaying(false);
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audioUrl = `${AUDIO_BASE_URL}${dhikr.audio}`;
    audioRef.current = new Audio(audioUrl);
    
    audioRef.current.onplay = () => setIsPlaying(true);
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.onpause = () => setIsPlaying(false);
    audioRef.current.onerror = () => {
      setIsPlaying(false);
      console.error("Error loading audio:", audioUrl);
    };

    audioRef.current.play().catch((err) => {
      console.error("Error playing audio:", err);
      setIsPlaying(false);
    });
  };

  const toggleDhikrAudio = (dhikr: DhikrItem) => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playDhikrAudio(dhikr);
    }
  };

  const playCategoryAudio = (category: AzkarCategory) => {
    // Stop dhikr audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    if (categoryAudioRef.current) {
      categoryAudioRef.current.pause();
    }

    const audioUrl = `${AUDIO_BASE_URL}${category.audio}`;
    categoryAudioRef.current = new Audio(audioUrl);
    
    categoryAudioRef.current.onplay = () => setIsCategoryAudioPlaying(true);
    categoryAudioRef.current.onended = () => setIsCategoryAudioPlaying(false);
    categoryAudioRef.current.onpause = () => setIsCategoryAudioPlaying(false);
    categoryAudioRef.current.onerror = () => {
      setIsCategoryAudioPlaying(false);
      console.error("Error loading category audio:", audioUrl);
    };

    categoryAudioRef.current.play().catch((err) => {
      console.error("Error playing category audio:", err);
      setIsCategoryAudioPlaying(false);
    });
  };

  const toggleCategoryAudio = (category: AzkarCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCategoryAudioPlaying && categoryAudioRef.current) {
      categoryAudioRef.current.pause();
      setIsCategoryAudioPlaying(false);
    } else {
      playCategoryAudio(category);
    }
  };

  const getCategoryProgress = (category: AzkarCategory) => {
    let completed = 0;
    let total = 0;
    
    category.array.forEach((dhikr) => {
      const key = getProgressKey(category.id, dhikr.id);
      total += dhikr.count;
      completed += progress[key] || 0;
    });

    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  const currentDhikr = selectedCategory?.array[currentIndex];
  const currentProgressKey = selectedCategory && currentDhikr 
    ? getProgressKey(selectedCategory.id, currentDhikr.id) 
    : "";
  const currentCount = currentProgressKey ? (progress[currentProgressKey] || 0) : 0;
  const isCurrentCompleted = currentDhikr && currentCount >= currentDhikr.count;

  const goToNext = () => {
    if (selectedCategory && currentIndex < selectedCategory.array.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // Stop current audio when navigating
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Stop current audio when navigating
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleBack = () => {
    // Stop all audio when going back
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    if (categoryAudioRef.current) {
      categoryAudioRef.current.pause();
      setIsCategoryAudioPlaying(false);
    }
    setSelectedCategory(null);
    setCurrentIndex(0);
  };

  // Category List View
  if (!selectedCategory) {
    const totalAdhkar = categories.reduce((s, c) => s + c.array.length, 0);
    const completedKeys = Object.values(progress).filter((v, i) => v > 0).length;
    const overallPct = Math.min(100, Math.round((completedKeys / Math.max(1, totalAdhkar)) * 100));
    const featured = categories.slice(0, 10);
    const arabic = (n: number) => n.toString().split("").map((d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)] ?? d).join("");

    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${mosqueBg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/95 via-primary/85 to-primary" />
          <div className="relative px-4 pt-6 pb-20 arabic-ui" dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={toggleMorningReminder}
                className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white"
                aria-label="تذكير"
              >
                {morningReminderEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </button>
              <div className="text-center text-white">
                <h1 className="text-3xl font-bold">الأذكار</h1>
                <p className="text-sm opacity-90 mt-1">ذكر الله يطمئن القلب</p>
              </div>
              <Link
                to="/notification-settings"
                className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>

            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في الأذكار والأدعية والآداب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 h-12 bg-white text-foreground rounded-2xl border-0 shadow-lg"
              />
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 -mt-12 relative z-10 arabic-ui" dir="rtl">
          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {[
              { id: "fav", label: "المفضلة", icon: "⭐" },
              { id: "recent", label: "الأخير", icon: "🕐" },
              { id: "today", label: "اليوم", icon: "📅", active: true },
              { id: "groups", label: "المجموعات", icon: "▥" },
              { id: "advanced", label: "بحث متقدم", icon: "≡" },
            ].map((c) => (
              <button
                key={c.id}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-all",
                  c.active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-foreground"
                )}
              >
                <span className="ml-1">{c.label}</span>
                <span className="opacity-70">{c.icon}</span>
              </button>
            ))}
          </div>

          {/* Progress card */}
          <Card className="mt-3 p-5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="text-right flex-1">
                <p className="text-xs text-muted-foreground mb-1">الذكر التالي</p>
                <h3 className="text-xl font-bold text-foreground">أذكار الصباح</h3>
                <p className="text-xs text-muted-foreground mt-1">من {arabic(categories[0]?.array.length || 0)} ذكر</p>
                <Button
                  size="sm"
                  className="mt-3 rounded-full gap-1"
                  onClick={() => {
                    setSelectedCategory(categories[0]);
                    setCurrentIndex(0);
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  متابعة
                </Button>
              </div>
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
                  <circle
                    cx="40" cy="40" r="34"
                    stroke="hsl(var(--primary))"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(overallPct / 100) * 213.6} 213.6`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-bold text-primary">{arabic(overallPct)}%</span>
                  <span className="text-[9px] text-muted-foreground">اليوم</span>
                </div>
              </div>
              <div className="text-left">
                <p className="font-quran text-base text-foreground leading-snug">فَاذْكُرُونِي أَذْكُرْكُمْ</p>
                <p className="text-xs text-muted-foreground mt-1">البقرة: ١٥٢</p>
              </div>
            </div>
          </Card>

          {/* Categories grid header */}
          <div className="flex items-center justify-between mt-6 mb-3">
            <h3 className="font-bold text-foreground">أقسام الأذكار الرئيسية</h3>
            <button className="text-xs text-primary">عرض الكل ›</button>
          </div>

          {filteredCategories.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">لا توجد نتائج للبحث</p>
            </Card>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {featured.map((category, i) => {
                const colors = [
                  "bg-amber-100 dark:bg-amber-950/40 text-amber-600",
                  "bg-blue-100 dark:bg-blue-950/40 text-blue-600",
                  "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600",
                  "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600",
                  "bg-rose-100 dark:bg-rose-950/40 text-rose-600",
                  "bg-green-100 dark:bg-green-950/40 text-green-600",
                  "bg-sky-100 dark:bg-sky-950/40 text-sky-600",
                  "bg-pink-100 dark:bg-pink-950/40 text-pink-600",
                  "bg-orange-100 dark:bg-orange-950/40 text-orange-600",
                  "bg-purple-100 dark:bg-purple-950/40 text-purple-600",
                ];
                return (
                  <Card
                    key={category.id}
                    className="p-3 cursor-pointer hover:shadow-lg transition-all rounded-2xl"
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentIndex(0);
                    }}
                  >
                    <div className={cn("w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center", colors[i % colors.length])}>
                      <Bell className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-foreground text-xs text-center leading-tight line-clamp-2 min-h-[2rem]">
                      {category.category}
                    </h3>
                    <p className="text-[10px] text-muted-foreground text-center mt-1">
                      {arabic(category.array.length)} ذكر
                    </p>
                  </Card>
                );
              })}
            </div>
          )}

          {/* All categories list */}
          <Card className="mt-6 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <button className="text-xs text-primary">عرض جميع الأقسام</button>
              <h4 className="font-bold text-sm text-foreground">كل الأقسام ({arabic(categories.length)})</h4>
            </div>
            <div className="space-y-1">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat); setCurrentIndex(0); }}
                  className="w-full flex items-center justify-between py-2.5 px-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{arabic(cat.array.length)}</span>
                  <span className="flex-1 text-right text-sm font-medium text-foreground mr-3">{cat.category}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Bottom actions */}
          <div className="grid grid-cols-5 gap-2 mt-5">
            {[
              { icon: Download, label: "تنزيل الأذكار", action: downloadAllAzkar },
              { icon: Share2, label: "مشاركة تطبيق", action: () => navigator.share?.({ url: window.location.origin }) },
              { icon: Volume2, label: "أذكار الصوت", action: () => {} },
              { icon: ChevronLeft, label: "عداد التسبيح", action: () => {} },
              { icon: Bell, label: "ذكر عشوائي", action: () => {} },
            ].map((b, i) => (
              <button
                key={i}
                onClick={b.action}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border hover:bg-muted/50 transition-colors"
              >
                <b.icon className="w-5 h-5 text-primary" />
                <span className="text-[10px] text-foreground text-center leading-tight">{b.label}</span>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Dhikr Detail View
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 arabic-ui">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground truncate">{selectedCategory.category}</h1>
            <p className="text-muted-foreground text-sm">
              {currentIndex + 1} من {selectedCategory.array.length}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => toggleCategoryAudio(selectedCategory, e)}
          >
            {isCategoryAudioPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        </div>

        {currentDhikr ? (
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">التقدم في هذا الذكر</span>
                <span className="font-medium text-primary">
                  {currentCount}/{currentDhikr.count}
                </span>
              </div>
              <Progress 
                value={(currentCount / currentDhikr.count) * 100} 
                className="h-2"
              />
            </div>

            {/* Dhikr Card */}
            <Card
              className={`p-6 text-center cursor-pointer transition-all min-h-[200px] flex flex-col justify-center ${
                isCurrentCompleted
                  ? "bg-green-500/10 border-green-500/30"
                  : "hover:bg-primary/5"
              }`}
              onClick={() => incrementProgress(currentDhikr)}
            >
              {isCurrentCompleted && (
                <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                  <Check className="w-6 h-6" />
                  <span className="font-medium">تم الإكمال</span>
                </div>
              )}

              <p className="text-xl font-quran leading-loose text-foreground mb-4">
                {currentDhikr.text}
              </p>

              {!isCurrentCompleted && (
                <p className="text-primary text-sm mt-4">
                  اضغط للتسبيح • {currentDhikr.count - currentCount} متبقي
                </p>
              )}
            </Card>

            {/* Audio Control */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => toggleDhikrAudio(currentDhikr)}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    إيقاف
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    تشغيل
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => {
                  const shareText = `${currentDhikr.text}\n\nعدد التكرار: ${currentDhikr.count}`;
                  if (navigator.share) {
                    navigator.share({ title: selectedCategory.category, text: shareText });
                  } else {
                    navigator.clipboard.writeText(shareText);
                    toast.success("تم نسخ النص للمشاركة");
                  }
                }}
              >
                <Share2 className="w-5 h-5" />
                مشاركة
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={goToPrev}
                disabled={currentIndex === 0}
                className="gap-2"
              >
                السابق
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="flex gap-1 flex-wrap justify-center max-w-[200px]">
                {selectedCategory.array.slice(0, 20).map((_, i) => {
                  const key = getProgressKey(selectedCategory.id, selectedCategory.array[i].id);
                  const dhikrProgress = progress[key] || 0;
                  const dhikrCount = selectedCategory.array[i].count;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentIndex(i);
                        if (audioRef.current) {
                          audioRef.current.pause();
                          setIsPlaying(false);
                        }
                      }}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === currentIndex
                          ? "bg-primary"
                          : dhikrProgress >= dhikrCount
                          ? "bg-green-500"
                          : "bg-muted"
                      }`}
                    />
                  );
                })}
                {selectedCategory.array.length > 20 && (
                  <span className="text-xs text-muted-foreground">...</span>
                )}
              </div>

              <Button
                variant="outline"
                onClick={goToNext}
                disabled={currentIndex === selectedCategory.array.length - 1}
                className="gap-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                التالي
              </Button>
            </div>

            {/* Quick Stats */}
            <Card className="p-4 mt-6 bg-muted/50">
              <div className="flex items-center justify-around text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {selectedCategory.array.filter((a) => {
                      const key = getProgressKey(selectedCategory.id, a.id);
                      return (progress[key] || 0) >= a.count;
                    }).length}
                  </p>
                  <p className="text-sm text-muted-foreground">مكتمل</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{selectedCategory.array.length}</p>
                  <p className="text-sm text-muted-foreground">إجمالي</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <p className="text-2xl font-bold text-muted-foreground">
                    {selectedCategory.array.filter((a) => {
                      const key = getProgressKey(selectedCategory.id, a.id);
                      return (progress[key] || 0) < a.count;
                    }).length}
                  </p>
                  <p className="text-sm text-muted-foreground">متبقي</p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            لا توجد أذكار في هذا القسم
          </p>
        )}
      </main>
    </div>
  );
};

export default AzkarPage;
