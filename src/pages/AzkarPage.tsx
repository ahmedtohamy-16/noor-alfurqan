import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, Check, Play, Pause, Volume2, VolumeX, Search, Download, Bell, BellOff, X, Share2, Shield } from "lucide-react";
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
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />

        <main className="container mx-auto px-4 py-6 arabic-ui">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">الأذكار والأدعية</h1>
              <p className="text-muted-foreground text-sm">حصن المسلم - {categories.length} قسم</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في الأذكار..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Link to="/ruqyah">
              <Button variant="outline" size="sm" className="gap-2">
                <Shield className="w-4 h-4" />
                الرقية الشرعية
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="gap-2" onClick={downloadAllAzkar}>
              <Download className="w-4 h-4" />
              تحميل الكل
            </Button>
            <Button
              variant={morningReminderEnabled ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={toggleMorningReminder}
            >
              {morningReminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              تذكير الصباح
            </Button>
            <Button
              variant={eveningReminderEnabled ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={toggleEveningReminder}
            >
              {eveningReminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              تذكير المساء
            </Button>
          </div>

          {filteredCategories.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">لا توجد نتائج للبحث</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCategories.map((category) => {
                const categoryProgress = getCategoryProgress(category);
                return (
                  <Card
                    key={category.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] group"
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentIndex(0);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-sm truncate">{category.category}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {category.array.length} ذكر
                        </p>
                        {categoryProgress.total > 0 && (
                          <div className="mt-2">
                            <Progress value={categoryProgress.percentage} className="h-1" />
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={(e) => downloadCategoryAudio(category, e)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={(e) => toggleCategoryAudio(category, e)}
                      >
                        {isCategoryAudioPlaying ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </Button>
                      <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
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
