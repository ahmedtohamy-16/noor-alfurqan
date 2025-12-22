import { Paintbrush, Type } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface DisplaySettings {
  fontSize: number;
  lineHeight: number;
  theme: "simple" | "decorated" | "classic" | "sepia" | "night" | "nature" | "ocean" | "royal";
  fontFamily: "Amiri" | "Scheherazade" | "Noto Naskh" | "Uthmani";
  showTranslation: boolean;
}

interface DisplaySettingsProps {
  settings: DisplaySettings;
  onChange: (settings: DisplaySettings) => void;
}

const themes = [
  { id: "simple", name: "سادة", preview: "bg-card" },
  { id: "decorated", name: "مزخرف", preview: "bg-gradient-to-br from-primary/10 to-accent/10" },
  { id: "classic", name: "كلاسيكي", preview: "bg-amber-100 dark:bg-amber-900/30" },
  { id: "sepia", name: "سيبيا", preview: "bg-orange-100 dark:bg-orange-900/30" },
  { id: "night", name: "ليلي", preview: "bg-slate-900" },
  { id: "nature", name: "طبيعي", preview: "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30" },
  { id: "ocean", name: "المحيط", preview: "bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30" },
  { id: "royal", name: "ملكي", preview: "bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30" },
];

const fonts = [
  { id: "Amiri", name: "أميري" },
  { id: "Scheherazade", name: "شهرزاد" },
  { id: "Noto Naskh", name: "نوتو نسخ" },
  { id: "Uthmani", name: "عثماني" },
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

      {/* Font Family */}
      <div className="space-y-2">
        <Label>نوع الخط</Label>
        <Select value={settings.fontFamily} onValueChange={(v) => onChange({ ...settings, fontFamily: v as DisplaySettings["fontFamily"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((font) => (
              <SelectItem key={font.id} value={font.id}>{font.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Theme Selection */}
      <div className="space-y-2">
        <Label>نمط العرض</Label>
        <div className="grid grid-cols-4 gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onChange({ ...settings, theme: theme.id as DisplaySettings["theme"] })}
              className={`p-2 rounded-lg border-2 transition-all ${theme.preview} ${
                settings.theme === theme.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <p className="text-xs font-medium">{theme.name}</p>
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
    case "night":
      return "bg-slate-900 text-slate-100 border-slate-700";
    case "nature":
      return "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800/50";
    case "ocean":
      return "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800/50";
    case "royal":
      return "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200 dark:border-purple-800/50";
    default:
      return "bg-card border-border";
  }
};
