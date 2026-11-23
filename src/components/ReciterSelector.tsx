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
  value?: string;
  onValueChange?: (id: string) => void;
}

const ReciterSelector = ({ compact = false, value, onValueChange }: ReciterSelectorProps) => {
  const { selectedReciter } = useGlobalAudio();
  const selectedId = value || selectedReciter.id;
  const selected = getReciterById(selectedId) || selectedReciter;
  const handleReciterChange = (id: string) => onValueChange?.(id);
  const isPlaying = false;

  const verifiedReciters = getVerifiedReciters();

  if (compact) {
    return (
      <Select value={selectedId} onValueChange={handleReciterChange} disabled={isPlaying}>
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
            {selected.nameArabic}
          </p>
        </div>
      </div>

      <Select value={selectedId} onValueChange={handleReciterChange} disabled={isPlaying}>
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
