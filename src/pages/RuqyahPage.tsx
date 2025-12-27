import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Pause, Download, ChevronLeft, Volume2, Copy, Check, RotateCcw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { ruqyahCategories, ruqyahAudioLinks, RuqyahCategory, RuqyahItem, getAyahAudioUrl } from "@/data/ruqyahData";
import { toast } from "sonner";
import { useDownloadManager } from "@/components/DownloadManager";

const RuqyahPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<RuqyahCategory | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullRuqyahPlaying, setIsFullRuqyahPlaying] = useState(false);
  const [repeatCount, setRepeatCount] = useState<{ [key: number]: number }>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fullAudioRef = useRef<HTMLAudioElement | null>(null);
  const { addTask, updateTask } = useDownloadManager();

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (fullAudioRef.current) {
        fullAudioRef.current.pause();
      }
    };
  }, []);

  const playItemAudio = async (item: RuqyahItem, category: RuqyahCategory) => {
    if (fullAudioRef.current) {
      fullAudioRef.current.pause();
      setIsFullRuqyahPlaying(false);
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    let audioUrl: string | null = null;

    // Get audio URL based on item's Quran reference
    if (item.surahNumber) {
      if (item.ayahNumber) {
        // Single ayah
        audioUrl = getAyahAudioUrl(item.surahNumber, item.ayahNumber);
      } else if (item.ayahStart) {
        // First ayah of a range
        audioUrl = getAyahAudioUrl(item.surahNumber, item.ayahStart);
      }
    }

    if (!audioUrl) {
      toast.error("لا يتوفر صوت لهذا الذكر");
      return;
    }

    audioRef.current = new Audio(audioUrl);
    audioRef.current.onplay = () => setIsPlaying(true);
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.onpause = () => setIsPlaying(false);
    audioRef.current.onerror = () => {
      setIsPlaying(false);
      toast.error("حدث خطأ في تحميل الصوت");
    };

    audioRef.current.play().catch(() => {
      setIsPlaying(false);
      toast.error("حدث خطأ في تشغيل الصوت");
    });
  };

  const toggleItemAudio = (item: RuqyahItem, category: RuqyahCategory) => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
    } else {
      playItemAudio(item, category);
    }
  };

  const playFullRuqyah = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    if (fullAudioRef.current) {
      fullAudioRef.current.pause();
    }

    fullAudioRef.current = new Audio(ruqyahAudioLinks.full);
    fullAudioRef.current.onplay = () => setIsFullRuqyahPlaying(true);
    fullAudioRef.current.onended = () => setIsFullRuqyahPlaying(false);
    fullAudioRef.current.onpause = () => setIsFullRuqyahPlaying(false);
    fullAudioRef.current.onerror = () => {
      setIsFullRuqyahPlaying(false);
      toast.error("حدث خطأ في تحميل الرقية الكاملة");
    };

    fullAudioRef.current.play().catch(() => {
      setIsFullRuqyahPlaying(false);
      toast.error("حدث خطأ في تشغيل الرقية الكاملة");
    });
  };

  const toggleFullRuqyah = () => {
    if (isFullRuqyahPlaying && fullAudioRef.current) {
      fullAudioRef.current.pause();
    } else {
      playFullRuqyah();
    }
  };

  const downloadFullRuqyah = async () => {
    const taskId = addTask({
      name: "الرقية الشرعية الكاملة",
      type: "reciter",
    });

    try {
      updateTask(taskId, { status: "downloading", progress: 10 });

      const response = await fetch(ruqyahAudioLinks.full);
      const blob = await response.blob();
      
      updateTask(taskId, { progress: 80 });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ruqyah-shariah.mp3";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      updateTask(taskId, { status: "completed", progress: 100 });
      toast.success("تم تحميل الرقية الشرعية بنجاح");
    } catch (error) {
      updateTask(taskId, { status: "error", error: "فشل التحميل" });
      toast.error("حدث خطأ في التحميل");
    }
  };

  const incrementRepeat = (itemId: number, maxCount: number) => {
    const current = repeatCount[itemId] || 0;
    if (current < maxCount) {
      setRepeatCount(prev => ({ ...prev, [itemId]: current + 1 }));
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const resetRepeat = (itemId: number) => {
    setRepeatCount(prev => ({ ...prev, [itemId]: 0 }));
  };

  const copyText = (text: string, itemId: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(itemId);
      toast.success("تم نسخ النص");
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const shareItem = async (item: RuqyahItem) => {
    const shareText = `${item.title}\n\n${item.text}\n\n${item.source ? `المصدر: ${item.source}` : ""}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: shareText,
        });
      } catch (error) {
        // User cancelled or error
        if ((error as Error).name !== "AbortError") {
          copyToClipboardAndNotify(shareText);
        }
      }
    } else {
      copyToClipboardAndNotify(shareText);
    }
  };

  const copyToClipboardAndNotify = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("تم نسخ النص للمشاركة");
    });
  };

  const currentItem = selectedCategory?.items[currentIndex];

  // Category list view
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
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">الرقية الشرعية</h1>
              <p className="text-muted-foreground text-sm">آيات وأدعية للاستشفاء بالقرآن والسنة</p>
            </div>
          </div>

          {/* Full Ruqyah Card */}
          <Card className="p-4 mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-foreground">الرقية الشرعية الكاملة</h3>
                <p className="text-sm text-muted-foreground">استمع للرقية كاملة بصوت الشيخ</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullRuqyah}
                >
                  {isFullRuqyahPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={downloadFullRuqyah}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ruqyahCategories.map((category) => (
              <Card
                key={category.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentIndex(0);
                  setRepeatCount({});
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {category.items.length} {category.items.length === 1 ? "عنصر" : "عناصر"}
                    </Badge>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Item detail view
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container mx-auto px-4 py-6 arabic-ui">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              setSelectedCategory(null);
              setCurrentIndex(0);
              setIsPlaying(false);
            }}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground truncate">{selectedCategory.name}</h1>
            <p className="text-muted-foreground text-sm">
              {currentIndex + 1} من {selectedCategory.items.length}
            </p>
          </div>
        </div>

        {currentItem && (
          <div className="max-w-2xl mx-auto">
            {/* Progress for repeat */}
            {currentItem.repeatCount && currentItem.repeatCount > 1 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">عدد التكرار</span>
                  <span className="font-medium text-primary">
                    {repeatCount[currentItem.id] || 0}/{currentItem.repeatCount}
                  </span>
                </div>
                <Progress 
                  value={((repeatCount[currentItem.id] || 0) / currentItem.repeatCount) * 100} 
                  className="h-2"
                />
              </div>
            )}

            {/* Main Card */}
            <Card
              className={`p-6 text-center transition-all min-h-[250px] flex flex-col justify-center ${
                currentItem.repeatCount && (repeatCount[currentItem.id] || 0) >= currentItem.repeatCount
                  ? "bg-green-500/10 border-green-500/30"
                  : ""
              }`}
              onClick={() => currentItem.repeatCount && incrementRepeat(currentItem.id, currentItem.repeatCount)}
            >
              <h3 className="text-lg font-bold text-primary mb-4">{currentItem.title}</h3>
              
              <p className="text-xl font-quran leading-loose text-foreground mb-4">
                {currentItem.text}
              </p>

              {currentItem.source && (
                <p className="text-sm text-muted-foreground mt-2">
                  المصدر: {currentItem.source}
                </p>
              )}

              {currentItem.repeatCount && currentItem.repeatCount > 1 && (
                <p className="text-primary text-sm mt-4">
                  {(repeatCount[currentItem.id] || 0) >= currentItem.repeatCount 
                    ? "✓ تم الإكمال" 
                    : `اضغط للتكرار • ${currentItem.repeatCount - (repeatCount[currentItem.id] || 0)} متبقي`}
                </p>
              )}
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => toggleItemAudio(currentItem, selectedCategory)}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "إيقاف" : "تشغيل"}
              </Button>
              
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => copyText(currentItem.text, currentItem.id)}
              >
                {copiedId === currentItem.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                نسخ
              </Button>

              <Button
                variant="outline"
                className="gap-2"
                onClick={() => shareItem(currentItem)}
              >
                <Share2 className="w-4 h-4" />
                مشاركة
              </Button>

              {currentItem.repeatCount && currentItem.repeatCount > 1 && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => resetRepeat(currentItem.id)}
                >
                  <RotateCcw className="w-4 h-4" />
                  إعادة
                </Button>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex(currentIndex - 1);
                    if (audioRef.current) {
                      audioRef.current.pause();
                      setIsPlaying(false);
                    }
                  }
                }}
                disabled={currentIndex === 0}
              >
                السابق
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>

              <div className="flex gap-1">
                {selectedCategory.items.map((_, i) => (
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
                        : repeatCount[selectedCategory.items[i].id] >= (selectedCategory.items[i].repeatCount || 1)
                        ? "bg-green-500"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  if (currentIndex < selectedCategory.items.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                    if (audioRef.current) {
                      audioRef.current.pause();
                      setIsPlaying(false);
                    }
                  }
                }}
                disabled={currentIndex === selectedCategory.items.length - 1}
              >
                <ArrowRight className="w-4 h-4 rotate-180 ml-2" />
                التالي
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RuqyahPage;
