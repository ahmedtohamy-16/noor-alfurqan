import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Plus, MessageCircle, AlertCircle, Settings as SettingsIcon, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import {
  createSupportTicket,
  getMyTickets,
  TicketCategory,
} from "@/services/socialService";
import { toast } from "sonner";

const categoryLabels: Record<TicketCategory, { label: string; icon: any }> = {
  technical: { label: "مشكلة تقنية", icon: SettingsIcon },
  report: { label: "إبلاغ عن محتوى", icon: AlertCircle },
  other: { label: "استفسار آخر", icon: HelpCircle },
};

const SupportPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [category, setCategory] = useState<TicketCategory>("technical");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const t = await getMyTickets(user.uid);
      setTickets(t);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await createSupportTicket(user.uid, { category, subject, description });
      toast.success("تم إرسال التذكرة، سنرد عليك قريباً");
      setSubject("");
      setDescription("");
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || "فشل الإرسال");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4 arabic-ui">الدعم الفني</h1>
          <Button onClick={() => navigate("/auth")}>سجّل الدخول للوصول</Button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>الدعم الفني - نور الفرقان</title>
      </Helmet>
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold arabic-ui">تذاكر الدعم</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" /> تذكرة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">تذكرة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="block mb-1 text-right">نوع المشكلة</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block mb-1 text-right">العنوان</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value.slice(0, 200))}
                    placeholder="عنوان مختصر"
                  />
                </div>
                <div>
                  <Label className="block mb-1 text-right">الوصف</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                    rows={5}
                    placeholder="اشرح المشكلة بالتفصيل..."
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !subject.trim() || !description.trim()}
                  className="w-full"
                >
                  إرسال
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground arabic-ui">لا توجد تذاكر بعد</p>
          </div>
        ) : (
          tickets.map((t) => {
            const cat = categoryLabels[t.category as TicketCategory] || categoryLabels.other;
            const Icon = cat.icon;
            return (
              <div key={t.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="font-semibold arabic-ui">{t.subject}</span>
                  </div>
                  <Badge variant={t.status === "open" ? "default" : "secondary"}>
                    {t.status === "open" ? "مفتوحة" : t.status === "in_progress" ? "قيد المعالجة" : "مغلقة"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground arabic-ui line-clamp-2">{t.description}</p>
              </div>
            );
          })
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default SupportPage;
