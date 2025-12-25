import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseStoryAudioOptions {
  onError?: (error: string) => void;
}

export const useStoryAudio = (options?: UseStoryAudioOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateAudio = useCallback(async (text: string, language: string, prophetId: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prophet-story-audio`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, language, prophetId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Create audio URL from base64
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      
      // Stop any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Create and play new audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        toast.error('فشل في تشغيل الصوت');
      };

      await audio.play();
      setIsPlaying(true);

    } catch (error) {
      console.error('Error generating audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`فشل في توليد الصوت: ${errorMessage}`);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [isPlaying]);

  return {
    isLoading,
    isPlaying,
    generateAudio,
    stopAudio,
    togglePlayPause,
  };
};
