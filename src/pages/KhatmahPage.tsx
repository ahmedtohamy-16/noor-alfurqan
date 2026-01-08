import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Plus,
  Copy,
  Check,
  ArrowRight,
  BookOpen,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { 
  COLLECTIONS, 
  firestoreQuery, 
  firestoreAdd, 
  firestoreSet,
  firestoreGet,
  firestoreUpdate
} from "@/lib/firebase";

interface Khatmah {
  id: string;
  name: string;
  invite_code: string;
  is_completed: boolean;
  created_by: string;
  created_at: string;
}

interface Participant {
  id: string;
  user_id: string;
  khatmah_id: string;
  assigned_juz: number;
  is_completed: boolean;
  profiles?: {
    username: string | null;
  };
}

const generateInviteCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const KhatmahPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [newKhatmahName, setNewKhatmahName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch user's khatmahs
  const { data: khatmahs, isLoading } = useQuery({
    queryKey: ["khatmahs", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      
      // Get khatmahs created by user
      const createdKhatmahs = await firestoreQuery<Khatmah>(
        COLLECTIONS.KHATMAHS,
        [{ field: "created_by", op: "==", value: user.uid }],
        "created_at",
        "desc"
      );
      
      // Get khatmahs user is participating in
      const participations = await firestoreQuery<Participant>(
        COLLECTIONS.KHATMAH_PARTICIPANTS,
        [{ field: "user_id", op: "==", value: user.uid }]
      );
      
      const participatedKhatmahIds = participations.map(p => p.khatmah_id);
      
      // Fetch participated khatmahs
      const participatedKhatmahs: Khatmah[] = [];
      for (const khatmahId of participatedKhatmahIds) {
        const khatmah = await firestoreGet<Khatmah>(COLLECTIONS.KHATMAHS, khatmahId);
        if (khatmah && !createdKhatmahs.find(k => k.id === khatmah.id)) {
          participatedKhatmahs.push(khatmah);
        }
      }
      
      return [...createdKhatmahs, ...participatedKhatmahs];
    },
    enabled: !!user,
  });

  // Create khatmah mutation
  const createKhatmah = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const inviteCode = generateInviteCode();
      
      const khatmahId = await firestoreAdd(COLLECTIONS.KHATMAHS, {
        name,
        invite_code: inviteCode,
        created_by: user.uid,
        is_completed: false,
        created_at: new Date().toISOString(),
      });

      // Add creator as first participant with juz 1
      await firestoreAdd(COLLECTIONS.KHATMAH_PARTICIPANTS, {
        khatmah_id: khatmahId,
        user_id: user.uid,
        assigned_juz: 1,
        is_completed: false,
      });

      return { id: khatmahId, invite_code: inviteCode };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["khatmahs"] });
      setIsCreateOpen(false);
      setNewKhatmahName("");
      toast.success("تم إنشاء الختمة بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في إنشاء الختمة");
      console.error(error);
    },
  });

  // Join khatmah mutation
  const joinKhatmah = useMutation({
    mutationFn: async (code: string) => {
      if (!user) throw new Error("User not authenticated");
      
      // Find khatmah by invite code
      const khatmahs = await firestoreQuery<Khatmah>(
        COLLECTIONS.KHATMAHS,
        [{ field: "invite_code", op: "==", value: code.toUpperCase() }]
      );
      
      if (khatmahs.length === 0) {
        throw new Error("كود الدعوة غير صحيح");
      }
      
      const khatmah = khatmahs[0];
      
      // Check if already a participant
      const existingParticipation = await firestoreQuery<Participant>(
        COLLECTIONS.KHATMAH_PARTICIPANTS,
        [
          { field: "khatmah_id", op: "==", value: khatmah.id },
          { field: "user_id", op: "==", value: user.uid }
        ]
      );
      
      if (existingParticipation.length > 0) {
        throw new Error("أنت مشارك بالفعل في هذه الختمة");
      }
      
      // Get current participants to find next available juz
      const participants = await firestoreQuery<Participant>(
        COLLECTIONS.KHATMAH_PARTICIPANTS,
        [{ field: "khatmah_id", op: "==", value: khatmah.id }]
      );
      
      const assignedJuzs = participants.map(p => p.assigned_juz);
      let availableJuz = 1;
      for (let i = 1; i <= 30; i++) {
        if (!assignedJuzs.includes(i)) {
          availableJuz = i;
          break;
        }
      }
      
      if (participants.length >= 30) {
        throw new Error("الختمة مكتملة");
      }
      
      await firestoreAdd(COLLECTIONS.KHATMAH_PARTICIPANTS, {
        khatmah_id: khatmah.id,
        user_id: user.uid,
        assigned_juz: availableJuz,
        is_completed: false,
      });

      return { khatmah_id: khatmah.id, assigned_juz: availableJuz };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["khatmahs"] });
      setIsJoinOpen(false);
      setJoinCode("");
      toast.success("تم الانضمام للختمة بنجاح");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("تم نسخ الكود");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num
      .toString()
      .split("")
      .map((digit) => arabicNumbers[parseInt(digit)])
      .join("");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-4 animate-pulse border border-border"
              >
                <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center arabic-ui">
          <div className="max-w-md mx-auto">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-2xl font-bold mb-4">الختمة الجماعية</h2>
            <p className="text-muted-foreground mb-8">
              سجل دخولك للمشاركة في ختمات جماعية مع أصدقائك وعائلتك
            </p>
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                <LogIn className="w-5 h-5" />
                تسجيل الدخول
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 arabic-ui">
        {/* Back Button & Title */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">الختمة الجماعية</h1>
            <p className="text-muted-foreground text-sm">
              شارك في قراءة القرآن مع الآخرين
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 gap-2">
                <Plus className="w-5 h-5" />
                إنشاء ختمة
              </Button>
            </DialogTrigger>
            <DialogContent className="arabic-ui">
              <DialogHeader>
                <DialogTitle>إنشاء ختمة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="اسم الختمة (مثال: ختمة رمضان)"
                  value={newKhatmahName}
                  onChange={(e) => setNewKhatmahName(e.target.value)}
                  className="text-right"
                />
                <Button
                  onClick={() => createKhatmah.mutate(newKhatmahName)}
                  disabled={!newKhatmahName.trim() || createKhatmah.isPending}
                  className="w-full"
                >
                  {createKhatmah.isPending ? "جاري الإنشاء..." : "إنشاء"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2">
                <Users className="w-5 h-5" />
                انضمام بكود
              </Button>
            </DialogTrigger>
            <DialogContent className="arabic-ui">
              <DialogHeader>
                <DialogTitle>الانضمام لختمة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="أدخل كود الدعوة"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="text-center font-mono text-lg tracking-widest"
                  maxLength={6}
                />
                <Button
                  onClick={() => joinKhatmah.mutate(joinCode)}
                  disabled={joinCode.length !== 6 || joinKhatmah.isPending}
                  className="w-full"
                >
                  {joinKhatmah.isPending ? "جاري الانضمام..." : "انضمام"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Khatmahs List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-4 animate-pulse border border-border"
              >
                <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : khatmahs && khatmahs.length > 0 ? (
          <div className="space-y-4">
            {khatmahs.map((khatmah) => (
              <KhatmahCard
                key={khatmah.id}
                khatmah={khatmah}
                userId={user.uid}
                onCopyCode={copyCode}
                copiedCode={copiedCode}
                convertToArabicNumber={convertToArabicNumber}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              لم تنضم لأي ختمة بعد
            </p>
            <p className="text-sm text-muted-foreground">
              أنشئ ختمة جديدة أو انضم لختمة موجودة بكود الدعوة
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

// Khatmah Card Component
const KhatmahCard = ({
  khatmah,
  userId,
  onCopyCode,
  copiedCode,
  convertToArabicNumber,
}: {
  khatmah: Khatmah;
  userId: string;
  onCopyCode: (code: string) => void;
  copiedCode: string | null;
  convertToArabicNumber: (num: number) => string;
}) => {
  const queryClient = useQueryClient();

  const { data: participants } = useQuery({
    queryKey: ["khatmah-participants", khatmah.id],
    queryFn: async () => {
      const data = await firestoreQuery<Participant>(
        COLLECTIONS.KHATMAH_PARTICIPANTS,
        [{ field: "khatmah_id", op: "==", value: khatmah.id }],
        "assigned_juz",
        "asc"
      );
      return data;
    },
  });

  const toggleComplete = useMutation({
    mutationFn: async () => {
      const myParticipation = participants?.find((p) => p.user_id === userId);
      if (!myParticipation) return;

      await firestoreUpdate(COLLECTIONS.KHATMAH_PARTICIPANTS, myParticipation.id, {
        is_completed: !myParticipation.is_completed,
        completed_at: !myParticipation.is_completed ? new Date().toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["khatmah-participants", khatmah.id] });
      toast.success("تم تحديث التقدم");
    },
  });

  const completedCount = participants?.filter((p) => p.is_completed).length || 0;
  const totalParticipants = participants?.length || 0;
  const myParticipation = participants?.find((p) => p.user_id === userId);
  const progress = totalParticipants > 0 ? (completedCount / 30) * 100 : 0;

  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg">{khatmah.name}</h3>
          <p className="text-sm text-muted-foreground">
            {convertToArabicNumber(totalParticipants)} مشارك • {convertToArabicNumber(completedCount)} أتموا القراءة
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => onCopyCode(khatmah.invite_code)}
        >
          {copiedCode === khatmah.invite_code ? (
            <Check className="w-4 h-4 text-primary" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {khatmah.invite_code}
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          {convertToArabicNumber(Math.round(progress))}% مكتمل
        </p>
      </div>

      {/* My Juz */}
      {myParticipation && (
        <div
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
            myParticipation.is_completed
              ? "bg-primary/10 border border-primary/20"
              : "bg-muted/50"
          }`}
          onClick={() => toggleComplete.mutate()}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                myParticipation.is_completed
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted-foreground/20"
              }`}
            >
              {myParticipation.is_completed ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-bold">
                  {convertToArabicNumber(myParticipation.assigned_juz)}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium">
                الجزء {convertToArabicNumber(myParticipation.assigned_juz)}
              </p>
              <p className="text-sm text-muted-foreground">جزئك المخصص</p>
            </div>
          </div>
          <span
            className={`text-sm ${
              myParticipation.is_completed ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {myParticipation.is_completed ? "مكتمل ✓" : "اضغط عند الإتمام"}
          </span>
        </div>
      )}

      {/* Participants Preview */}
      {participants && participants.length > 1 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">المشاركون:</p>
          <div className="flex flex-wrap gap-2">
            {participants
              .filter((p) => p.user_id !== userId)
              .slice(0, 5)
              .map((p) => (
                <span
                  key={p.id}
                  className={`text-xs px-2 py-1 rounded-full ${
                    p.is_completed
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  ج{convertToArabicNumber(p.assigned_juz)}
                  {p.is_completed && " ✓"}
                </span>
              ))}
            {participants.length > 6 && (
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                +{convertToArabicNumber(participants.length - 6)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KhatmahPage;