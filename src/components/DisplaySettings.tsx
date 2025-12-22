import { Paintbrush, Type, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export interface DisplaySettings {
  fontSize: number;
  lineHeight: number;
  theme: "simple" | "decorated" | "classic" | "sepia";
  showTranslation: boolean;
}

interface DisplaySettingsProps {
  settings: DisplaySettings;
  onChange: (settings: DisplaySettings) => void;
}

const themes = [
  { id: "simple", name: "سادة", bg: "bg-background", border: "border-border" },
  { id: "decorated", name: "مزخرف", bg: "bg-gradient-to-br from-primary/5 to-accent/5", border: "border-primary/20" },
  { id: "classic", name: "كلاسيكي", bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-800" },
  { id: "sepia", name: "سيبيا", bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-200 dark:border-orange-800" },
];

const DisplaySettingsPanel = ({ settings, onChange }: DisplaySettingsProps) => {
  return (
    <Card className="p-4 space-y-4 arabic-ui">
      <div className="flex items-center gap-2 mb-2">
        <Paintbrush className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">تخصيص العرض</h3>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            حجم الخط
          </Label>
          <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
        </div>
        <Slider
          value={[settings.fontSize]}
          min={18}
          max={40}
          step={2}
          onValueChange={([v]) => onChange({ ...settings, fontSize: v })}
        />
      </div>

      {/* Line Height */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>المسافة بين الأسطر</Label>
          <span className="text-sm text-muted-foreground">{settings.lineHeight.toFixed(1)}</span>
        </div>
        <Slider
          value={[settings.lineHeight]}
          min={1.5}
          max={3}
          step={0.1}
          onValueChange={([v]) => onChange({ ...settings, lineHeight: v })}
        />
      </div>

      {/* Theme Selection */}
      <div className="space-y-2">
        <Label>نمط العرض</Label>
        <div className="grid grid-cols-2 gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onChange({ ...settings, theme: theme.id as DisplaySettings["theme"] })}
              className={`p-3 rounded-lg border-2 transition-all ${theme.bg} ${
                settings.theme === theme.id
                  ? "border-primary ring-2 ring-primary/20"
                  : `${theme.border} hover:border-primary/50`
              }`}
            >
              <p className="text-sm font-medium text-foreground">{theme.name}</p>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default DisplaySettingsPanel;

export const getThemeClasses = (theme: DisplaySettings["theme"]) => {
  switch (theme) {
    case "decorated":
      return "bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/10";
    case "classic":
      return "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50";
    case "sepia":
      return "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/50";
    default:
      return "bg-card border-border";
  }
};
