import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePro } from "@/hooks/usePro";

interface ProBadgeProps {
  /** Show only when current user is Pro. Default true. */
  onlyIfPro?: boolean;
  /** Visual variant */
  variant?: "chip" | "dot" | "label";
  className?: string;
}

/**
 * Pro feature marker (#0074fc). By default it renders only for Pro users
 * so they feel the luxury of their subscription next to advanced features.
 */
const ProBadge = ({ onlyIfPro = true, variant = "chip", className }: ProBadgeProps) => {
  const { isPro } = usePro();
  if (onlyIfPro && !isPro) return null;

  if (variant === "dot") {
    return (
      <span
        aria-label="ميزة Pro"
        className={cn("inline-block w-2 h-2 rounded-full shrink-0", className)}
        style={{ backgroundColor: "#0074fc", boxShadow: "0 0 8px #0074fc66" }}
      />
    );
  }

  if (variant === "label") {
    return (
      <span
        className={cn("inline-flex items-center gap-1 text-[10px] font-bold", className)}
        style={{ color: "#0074fc" }}
      >
        <Sparkles className="w-3 h-3" />
        PRO
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm",
        className
      )}
      style={{
        background: "linear-gradient(135deg, #0074fc 0%, #4ea3ff 100%)",
        boxShadow: "0 2px 8px rgba(0,116,252,0.35)",
      }}
    >
      <Sparkles className="w-3 h-3" />
      PRO
    </span>
  );
};

export default ProBadge;
