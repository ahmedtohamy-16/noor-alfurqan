import { cn } from "@/lib/utils";

export interface ExportTheme {
  id: string;
  name: string;
  bgStart: string;
  bgEnd: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  headerBg?: string;
}

export const exportThemes: ExportTheme[] = [
  {
    id: "classic-white",
    name: "كلاسيكي أبيض",
    bgStart: "#ffffff",
    bgEnd: "#f8f9fa",
    textColor: "#1a1a1a",
    accentColor: "#059669",
    borderColor: "#10b981",
    headerBg: "linear-gradient(135deg, #059669, #10b981)",
  },
  {
    id: "luxury-night",
    name: "ليلي فاخر",
    bgStart: "#1a1a2e",
    bgEnd: "#0f0f1a",
    textColor: "#ffffff",
    accentColor: "#ffd700",
    borderColor: "#c9a961",
    headerBg: "linear-gradient(135deg, #2d1b4e, #1a1a2e)",
  },
  {
    id: "islamic-green",
    name: "أخضر إسلامي",
    bgStart: "#1a2f1a",
    bgEnd: "#0d1f0d",
    textColor: "#ffffff",
    accentColor: "#c9a961",
    borderColor: "#4a7c59",
    headerBg: "linear-gradient(135deg, #2d5a2d, #1a3f1a)",
  },
  {
    id: "golden-royal",
    name: "ذهبي ملكي",
    bgStart: "#3d2914",
    bgEnd: "#2a1a0a",
    textColor: "#f5e6d3",
    accentColor: "#ffd700",
    borderColor: "#c9a961",
    headerBg: "linear-gradient(135deg, #c9a961, #8b6914)",
  },
  {
    id: "ocean-blue",
    name: "أزرق محيطي",
    bgStart: "#0a2a4a",
    bgEnd: "#051525",
    textColor: "#e0f7fa",
    accentColor: "#4dd0e1",
    borderColor: "#00838f",
    headerBg: "linear-gradient(135deg, #006994, #003d5c)",
  },
  {
    id: "royal-purple",
    name: "بنفسجي ملكي",
    bgStart: "#2d1b4e",
    bgEnd: "#1a0a2e",
    textColor: "#e8daef",
    accentColor: "#bb8fce",
    borderColor: "#7d3c98",
    headerBg: "linear-gradient(135deg, #5b2c6f, #3c1953)",
  },
];

interface ExportThemeSelectorProps {
  selectedTheme: ExportTheme;
  onSelectTheme: (theme: ExportTheme) => void;
}

const ExportThemeSelector = ({ selectedTheme, onSelectTheme }: ExportThemeSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">اختر الثيم</label>
      <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
        {exportThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelectTheme(theme)}
            className={cn(
              "flex-shrink-0 w-12 h-12 rounded-xl border-2 transition-all shadow-md",
              selectedTheme.id === theme.id
                ? "border-primary scale-110 ring-2 ring-primary/30"
                : "border-transparent hover:border-muted"
            )}
            style={{
              background: `linear-gradient(135deg, ${theme.bgStart}, ${theme.bgEnd})`,
            }}
            title={theme.name}
          />
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">{selectedTheme.name}</p>
    </div>
  );
};

export default ExportThemeSelector;
