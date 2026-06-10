import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HadithBackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="العودة للأعلى"
      size="icon"
      className={cn(
        "fixed bottom-24 left-4 z-40 w-12 h-12 rounded-full shadow-lg transition-all",
        "bg-gradient-to-br from-[hsl(var(--gold-gradient-start))] to-[hsl(var(--gold-gradient-end))] text-white hover:opacity-90",
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
      )}
    >
      <ArrowUp className="w-5 h-5" />
    </Button>
  );
};

export default HadithBackToTop;
