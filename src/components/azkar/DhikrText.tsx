import { useReadingSettings } from "@/hooks/useReadingSettings";
import { cn } from "@/lib/utils";

export default function DhikrText({ text }: { text: string }) {
  const { settings } = useReadingSettings();
  const blocks = text.split(/(﴿[^﴾]*﴾)/g).filter(part => part.trim() && !/^[.\s]+$/.test(part));
  return (
    <div className="space-y-6 text-foreground" dir="rtl">
      {blocks.map((part, index) => (
        <p key={index}
          data-dhikr-text={part.startsWith("﴿") ? "quran" : "dhikr"}
          className={cn("quran-text whitespace-pre-line break-words",
            settings.fontFamily === "Amiri" && "font-amiri",
            settings.fontFamily === "Scheherazade" && "font-scheherazade",
            settings.fontFamily === "Noto Naskh" && "font-noto-naskh",
            settings.fontFamily === "Uthmani" && "font-uthmani")}
          style={{ fontSize: `${settings.fontSize}px`, lineHeight: Math.max(2.5, settings.lineHeight), letterSpacing: 0 }}>
          {part.replace(/^\.\s*/, "").replace(/\*/g, "  ").trim()}
        </p>
      ))}
    </div>
  );
}