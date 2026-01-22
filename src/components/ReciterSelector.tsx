import { useState, useEffect } from "react";
import { Headphones } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getReciterById, getVerifiedReciters } from "@/data/reciters";
import { useAuth } from "@/hooks/useAuth";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";
import { firestoreGet, firestoreSet, COLLECTIONS } from "@/lib/firebase";

interface ReciterSelectorProps {
  compact?: boolean;
}

const ReciterSelector = ({ compact = false }: ReciterSelectorProps) => {
  const { user } = useAuth();
  const { selectedReciter, setReciter, isPlaying } = useGlobalAudio();
  const [isLoading, setIsLoading] = useState(true);

  // Sync from Firestore on mount (for logged-in users)
  useEffect(() => {
    const loadReciter = async () => {
      if (user) {
        const data = await firestoreGet<any>(COLLECTIONS.USER_READING_SETTINGS, user.uid);
        if (data?.selected_reciter && data.selected_reciter !== selectedReciter.id) {
          const reciter = getVerifiedReciters().find(r => r.id === data.selected_reciter);
          if (reciter) {
            setReciter(reciter);
          }
        }
      }
      setIsLoading(false);
    };

    loadReciter();
  }, [user]);

  const handleReciterChange = async (value: string) => {
    const reciter = getVerifiedReciters().find(r => r.id === value);
    if (!reciter) return;
    
    // Update global audio state (this will be the source of truth)
    setReciter(reciter);
    
    // Persist to localStorage (for offline/guest users)
    localStorage.setItem("selectedReciter", value);

    // Persist to Firestore (for logged-in users)
    if (user) {
      await firestoreSet(COLLECTIONS.USER_READING_SETTINGS, user.uid, {
        user_id: user.uid,
        selected_reciter: value,
      });
    }
  };

  const verifiedReciters = getVerifiedReciters();

  if (compact) {
    return (
      <Select value={selectedReciter.id} onValueChange={handleReciterChange} disabled={isPlaying}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="اختر القارئ" />
        </SelectTrigger>
        <SelectContent className="arabic-ui max-h-80 bg-popover z-50">
          {verifiedReciters.map((reciter) => (
            <SelectItem key={reciter.id} value={reciter.id}>
              {reciter.nameArabic}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Headphones className="w-5 h-5 text-primary" />
        <div>
          <p className="font-medium text-foreground">القارئ</p>
          <p className="text-sm text-muted-foreground">
            {selectedReciter.nameArabic}
          </p>
        </div>
      </div>

      <Select value={selectedReciter.id} onValueChange={handleReciterChange} disabled={isPlaying}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="اختر القارئ" />
        </SelectTrigger>
        <SelectContent className="arabic-ui max-h-80 bg-popover z-50">
          {verifiedReciters.map((reciter) => (
            <SelectItem key={reciter.id} value={reciter.id}>
              <div className="flex flex-col items-start">
                <span className="font-medium">{reciter.nameArabic}</span>
                <span className="text-xs text-muted-foreground">{reciter.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {isPlaying && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          أوقف التشغيل لتغيير القارئ
        </p>
      )}
    </Card>
  );
};

export default ReciterSelector;
