import { useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

// Adhan sound options
export const adhanSounds = {
  makkah: {
    name: "المسجد الحرام - مكة",
    url: "https://www.islamcan.com/audio/adhan/azan1.mp3",
    fajrUrl: "https://www.islamcan.com/audio/adhan/azan-fajr1.mp3",
  },
  madinah: {
    name: "المسجد النبوي - المدينة",
    url: "https://www.islamcan.com/audio/adhan/azan2.mp3",
  },
  mishary: {
    name: "مشاري راشد العفاسي",
    url: "https://www.islamcan.com/audio/adhan/azan3.mp3",
  },
  "abdul-basit": {
    name: "عبد الباسط عبد الصمد",
    url: "https://www.islamcan.com/audio/adhan/azan4.mp3",
  },
  egypt: {
    name: "أذان مصري",
    url: "https://www.islamcan.com/audio/adhan/azan5.mp3",
  },
};

export type AdhanSoundId = keyof typeof adhanSounds;

export const useAdhanAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAdhan();
    };
  }, []);

  // Listen for messages from service worker
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === "PLAY_ADHAN_REQUEST") {
        console.log("📩 Received Adhan playback request from SW");
        playAdhan(event.data.adhanUrl, event.data.prayerName);
      }
      
      if (event.data?.type === "ADHAN_PLAYING") {
        console.log("🔊 Adhan is playing:", event.data.prayerName);
        toast.info(`🕌 أذان صلاة ${event.data.prayerName}`, {
          action: {
            label: "إيقاف",
            onClick: () => stopAdhan(),
          },
          duration: 60000,
        });
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleServiceWorkerMessage);
    
    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, []);

  const playAdhan = useCallback(async (url: string, prayerName?: string) => {
    try {
      stopAdhan();

      console.log("🔊 Playing Adhan:", url);
      
      audioRef.current = new Audio(url);
      audioRef.current.volume = 0.9;
      audioRef.current.crossOrigin = "anonymous";
      
      isPlayingRef.current = true;

      await audioRef.current.play();
      
      toast.info(`🕌 أذان صلاة ${prayerName || "الصلاة"}`, {
        action: {
          label: "إيقاف",
          onClick: () => stopAdhan(),
        },
        duration: 60000,
      });

      audioRef.current.addEventListener("ended", () => {
        isPlayingRef.current = false;
        audioRef.current = null;
      });

    } catch (error) {
      console.error("❌ Adhan playback error:", error);
      isPlayingRef.current = false;
    }
  }, []);

  const stopAdhan = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    isPlayingRef.current = false;

    // Also tell service worker to stop
    if (navigator.serviceWorker?.controller) {
      const channel = new MessageChannel();
      navigator.serviceWorker.controller.postMessage(
        { type: "STOP_ADHAN" },
        [channel.port2]
      );
    }
  }, []);

  const previewAdhan = useCallback(async (soundId: AdhanSoundId) => {
    const sound = adhanSounds[soundId];
    if (!sound) return;

    try {
      stopAdhan();
      
      audioRef.current = new Audio(sound.url);
      audioRef.current.volume = 0.8;
      
      // Play only 10 seconds for preview
      await audioRef.current.play();
      
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      }, 10000);

      toast.info(`معاينة: ${sound.name}`, {
        action: {
          label: "إيقاف",
          onClick: () => stopAdhan(),
        },
        duration: 10000,
      });
      
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("تعذر تشغيل المعاينة");
    }
  }, [stopAdhan]);

  const getAdhanUrl = useCallback((soundId: AdhanSoundId, isFajr = false): string => {
    const sound = adhanSounds[soundId];
    if (!sound) return adhanSounds.makkah.url;
    
    if (isFajr && "fajrUrl" in sound) {
      return sound.fajrUrl!;
    }
    return sound.url;
  }, []);

  return {
    playAdhan,
    stopAdhan,
    previewAdhan,
    getAdhanUrl,
    adhanSounds,
    isPlaying: isPlayingRef.current,
  };
};
