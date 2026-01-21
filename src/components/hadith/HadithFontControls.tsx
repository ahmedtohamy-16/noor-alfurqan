import { Type, Minus, Plus, AlignCenter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface HadithFontControlsProps {
  fontSize: number;
  fontFamily: string;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
}

const fontOptions = [
  { value: 'Amiri', label: 'الأميري', preview: "font-['Amiri',_serif]" },
  { value: 'Scheherazade', label: 'شهرزاد', preview: "font-['Scheherazade_New',_serif]" },
  { value: 'Noto Naskh', label: 'نسخ عربي', preview: "font-['Noto_Naskh_Arabic',_serif]" },
  { value: 'Uthmani', label: 'عثماني', preview: "font-['KFGQPC_Uthmanic_Script_HAFS',_serif]" },
];

const HadithFontControls = ({
  fontSize,
  fontFamily,
  onFontSizeChange,
  onFontFamilyChange,
}: HadithFontControlsProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Type className="w-4 h-4" />
          <span className="hidden sm:inline">تخصيص الخط</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-popover" align="end">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <AlignCenter className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-foreground">إعدادات الخط</h4>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">نوع الخط</Label>
            <Select value={fontFamily} onValueChange={onFontFamilyChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {fontOptions.map(font => (
                  <SelectItem key={font.value} value={font.value}>
                    <span className={cn(font.preview, "text-base")}>
                      {font.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">حجم الخط</Label>
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onFontSizeChange(Math.max(14, fontSize - 2))}
                disabled={fontSize <= 14}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Slider
                value={[fontSize]}
                min={14}
                max={36}
                step={2}
                onValueChange={([value]) => onFontSizeChange(value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onFontSizeChange(Math.min(36, fontSize + 2))}
                disabled={fontSize >= 36}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">معاينة</Label>
            <div 
              className={cn(
                "bg-muted/50 rounded-lg p-4 text-center border",
                fontOptions.find(f => f.value === fontFamily)?.preview
              )}
              style={{ fontSize: `${fontSize}px` }}
            >
              بسم الله الرحمن الرحيم
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HadithFontControls;
