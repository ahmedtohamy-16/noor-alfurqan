import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { translations, getTranslationsByLanguage } from "@/data/translations";

interface TranslationSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

const TranslationSelector = ({ value, onChange }: TranslationSelectorProps) => {
  const groupedTranslations = getTranslationsByLanguage();

  return (
    <div className="flex items-center gap-2">
      <Languages className="w-4 h-4 text-muted-foreground" />
      <Select value={value || "none"} onValueChange={(v) => onChange(v === "none" ? null : v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="اختر الترجمة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">بدون ترجمة</SelectItem>
          {Object.entries(groupedTranslations).map(([language, trans]) => (
            <SelectGroup key={language}>
              <SelectLabel className="text-primary font-semibold">
                {trans[0].languageArabic} ({language})
              </SelectLabel>
              {trans.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TranslationSelector;
