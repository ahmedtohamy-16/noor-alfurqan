import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import { asmaUlHusna, AsmaName } from "@/data/asmaUlHusna";
import { cn } from "@/lib/utils";

const toArabicNum = (n: number) =>
  n.toString().split("").map((d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)] ?? d).join("");

const AsmaUlHusnaPage = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AsmaName | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return asmaUlHusna;
    const q = search.trim();
    return asmaUlHusna.filter(
      (n) =>
        n.name.includes(q) ||
        n.transliteration.toLowerCase().includes(q.toLowerCase()) ||
        n.meaning.includes(q),
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 arabic-ui pb-28">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">أسماء الله الحسنى</h1>
            <p className="text-sm text-muted-foreground">
              ولله الأسماء الحسنى فادعوه بها
            </p>
          </div>
        </div>

        {/* Hero */}
        <Card className="relative overflow-hidden p-6 mb-6 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 border-primary/20 text-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0,transparent_60%)]" />
          <div className="relative">
            <div className="text-5xl md:text-6xl font-quran text-primary mb-2">
              ٩٩
            </div>
            <p className="text-foreground/80">اسماً من أسماء الله الحسنى</p>
          </div>
        </Card>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث باسم أو معنى..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            لا يوجد نتائج
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map((n) => (
              <button
                key={n.number}
                onClick={() => setSelected(n)}
                className={cn(
                  "relative p-4 rounded-2xl text-center transition-all active:scale-95",
                  "bg-gradient-to-br from-card to-muted/40",
                  "border border-border hover:border-primary/40",
                  "hover:shadow-md",
                )}
              >
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                  {toArabicNum(n.number)}
                </div>
                <div className="text-2xl font-quran text-primary mt-3">
                  {n.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {n.transliteration}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Details Dialog */}
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="arabic-ui max-w-md">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-center">
                    <div className="text-xs text-muted-foreground mb-2">
                      الاسم رقم {toArabicNum(selected.number)} من ٩٩
                    </div>
                    <div className="text-4xl font-quran text-primary py-3">
                      {selected.name}
                    </div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {selected.transliteration}
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-border">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm font-medium">المعنى</span>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    {selected.meaning}
                  </p>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AsmaUlHusnaPage;
