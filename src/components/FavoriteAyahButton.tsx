import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { arabicDigits } from "@/lib/displayFormat";
import { cn } from "@/lib/utils";

export default function FavoriteAyahButton({ active, ayah, onToggle }: { active: boolean; ayah: number; onToggle: () => Promise<unknown> }) {
  const [busy, setBusy] = useState(false);
  const label = `${active ? "إزالة" : "إضافة"} الآية ${arabicDigits(ayah)} ${active ? "من" : "إلى"} المفضلة`;
  return <Tooltip>
    <TooltipTrigger asChild>
      <Button type="button" variant="ghost" size="icon" aria-label={label} aria-pressed={active} disabled={busy}
        className={cn("inline-flex h-11 w-11 align-middle rounded-full text-muted-foreground", active && "text-primary")}
        onClick={async event => { event.stopPropagation(); setBusy(true); try { await onToggle(); } finally { setBusy(false); } }}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={cn("h-4 w-4", active && "fill-current")} />}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>;
}