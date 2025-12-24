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
import { reciters, getReciterById } from "@/data/reciters";
import { useReadingSettings } from "@/hooks/useReadingSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ReciterSelectorProps {
  compact?: boolean;
}

const ReciterSelector = ({ compact = false }: ReciterSelectorProps) => {
  const { user } = useAuth();
  const [selectedReciter, setSelectedReciter] = useState("ar.alafasy");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReciter = async () => {
      if (user) {
        const { data } = await supabase
          .from("user_reading_settings")
          .select("selected_reciter")
          .eq("user_id", user.id)
          .single();
        
        if (data?.selected_reciter) {
          setSelectedReciter(data.selected_reciter);
        }
      } else {
        const stored = localStorage.getItem("selectedReciter");
        if (stored) {
          setSelectedReciter(stored);
        }
      }
      setIsLoading(false);
    };

    loadReciter();
  }, [user]);

  const handleReciterChange = async (value: string) => {
    setSelectedReciter(value);
    localStorage.setItem("selectedReciter", value);

    if (user) {
      await supabase
        .from("user_reading_settings")
        .upsert({
          user_id: user.id,
          selected_reciter: value,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
    }
  };

  const currentReciter = getReciterById(selectedReciter);

  if (compact) {
    return (
      <Select value={selectedReciter} onValueChange={handleReciterChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="اختر القارئ" />
        </SelectTrigger>
        <SelectContent className="arabic-ui max-h-80">
          {reciters.map((reciter) => (
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
            {currentReciter?.nameArabic || "مشاري راشد العفاسي"}
          </p>
        </div>
      </div>

      <Select value={selectedReciter} onValueChange={handleReciterChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="اختر القارئ" />
        </SelectTrigger>
        <SelectContent className="arabic-ui max-h-80">
          {reciters.map((reciter) => (
            <SelectItem key={reciter.id} value={reciter.id}>
              <div className="flex flex-col items-start">
                <span className="font-medium">{reciter.nameArabic}</span>
                <span className="text-xs text-muted-foreground">{reciter.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Card>
  );
};

export default ReciterSelector;
