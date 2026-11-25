import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { AzkarHome, AzkarReader } from "@/components/azkar/AzkarViews";
import { ArrowRight, ChevronLeft, Check, Play, Pause, Volume2, VolumeX, Search, Download, Bell, BellOff, X, Share2, Shield, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import adhkarData from "@/data/adhkar.json";
import { separateDailyAzkar } from "@/lib/dailyAzkar";
import { toast } from "sonner";
import { useDownloadManager } from "@/components/DownloadManager";
import { useNotifications } from "@/hooks/useNotifications";
import { useSyncedState } from "@/hooks/useSyncedState";
import { useUserSettings } from "@/hooks/useUserSettings";
import { localDateAt, nextDate, zonedInstant } from "../../supabase/functions/_shared/prayerTimeRules";

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

const AzkarPage = () => {
  const [categories] = useState<AzkarCategory[]>(() => separateDailyAzkar(adhkarData));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AzkarCategory | null>(null);
  const today = new Date().toLocaleDateString("en-CA");
  const [progress, setProgress] = useSyncedState<UserProgress>("azkar_progress", today, {}, `azkar_progress_${today}`);
  const { settings: reminderSettings, updateSettings: updateReminderSettings } = useUserSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCategoryAudioPlaying, setIsCategoryAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const categoryAudioRef = useRef<HTMLAudioElement | null>(null);
  const { addTask, updateTask } = useDownloadManager();
  const { permission, requestPermission, sendNotification, isEnabled: notificationsEnabled } = useNotifications();
  const morningReminderEnabled = reminderSettings.azkar_morning_enabled;
  const eveningReminderEnabled = reminderSettings.azkar_evening_enabled;

  // Schedule reminders
  useEffect(() => {
    if (!notificationsEnabled) return;

    const scheduleReminder = (hour: number, minute: number, title: string, body: string, tag: string) => {
      const now = new Date();
      const zone = reminderSettings.timezone;
      const day = localDateAt(now, zone);
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const instant = zonedInstant(day, time, zone);
      const delay = (instant > now.getTime() ? instant : zonedInstant(nextDate(day), time, zone)) - now.getTime();
      
      return setTimeout(() => {
        sendNotification(title, { body, tag });
      }, delay);
    };

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    if (morningReminderEnabled) {
      // Morning reminder at 6:00 AM
      const [hour, minute] = reminderSettings.azkar_morning_time.split(':').map(Number);
      timeouts.push(scheduleReminder(hour, minute, "أذكار الصباح", "حان وقت أذكار الصباح", "morning-azkar"));
    }

    if (eveningReminderEnabled) {
      // Evening reminder at 5:00 PM
      const [hour, minute] = reminderSettings.azkar_evening_time.split(':').map(Number);
      timeouts.push(scheduleReminder(hour, minute, "أذكار المساء", "حان وقت أذكار المساء", "evening-azkar"));
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [morningReminderEnabled, eveningReminderEnabled, notificationsEnabled, sendNotification, reminderSettings.azkar_morning_time, reminderSettings.azkar_evening_time, reminderSettings.timezone]);

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
    await updateReminderSettings({ azkar_morning_enabled: newValue });
    toast.success(newValue ? "تم تفعيل تذكير أذكار الصباح" : "تم إيقاف تذكير أذكار الصباح");
  };

  const toggleEveningReminder = async () => {
    if (!notificationsEnabled && !eveningReminderEnabled) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    const newValue = !eveningReminderEnabled;
    await updateReminderSettings({ azkar_evening_enabled: newValue });
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
      const downloadable = categories.filter(category => category.audio);
      const total = downloadable.length;

      for (const category of downloadable) {
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
      toast.success("تم تحميل تسجيلات الأذكار المتاحة للاستخدام بدون إنترنت");
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
      navigator.vibrate(15);
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

  const openSection = (section: AzkarCategory, index = 0) => {
    setSelectedCategory(section);
    setCurrentIndex(index);
    window.scrollTo({ top: 0 });
  };

  if (!selectedCategory) {
    return (
      <AzkarHome
        sections={categories}
        progress={progress}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onOpen={openSection}
        morningReminderEnabled={morningReminderEnabled}
        onToggleReminder={toggleMorningReminder}
        onDownloadAll={downloadAllAzkar}
      />
    );
  }

  const nextSection = categories[categories.findIndex((c) => c.id === selectedCategory.id) + 1];
  return (
    <AzkarReader
      section={selectedCategory}
      index={currentIndex}
      progress={progress}
      isPlaying={isPlaying}
      onBack={handleBack}
      onIndex={(i) => {
        if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
        setCurrentIndex(i);
      }}
      onCount={incrementProgress}
      onToggleAudio={toggleDhikrAudio}
      onReset={() => setProgress((prev) => {
        const next = { ...prev };
        selectedCategory.array.forEach((d) => delete next[getProgressKey(selectedCategory.id, d.id)]);
        return next;
      })}
      nextSection={nextSection}
      onOpenSection={openSection}
    />
  );
};

export default AzkarPage;
