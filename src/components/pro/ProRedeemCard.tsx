import { useState } from "react";
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { PRO_USERS_COLLECTION } from "@/hooks/usePro";

const PRO_COLOR = "#0074fc";

/**
 * TEMPORARY redeem-code activation for testing only.
 * The admin sets a long random code in pro_config/redeem; users enter it
 * here to unlock Pro for 365 days. Remove this card and the matching
 * Firestore rule branch before public launch.
 */
const ProRedeemCard = () => {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const redeem = async () => {
    if (!user) {
      toast.error("سجّل الدخول أولاً");
      return;
    }
    const trimmed = code.trim();
    if (trimmed.length < 12) {
      toast.error("الكود غير صحيح");
      return;
    }
    setLoading(true);
    try {
      const db = getFirestoreDb();
      // Verify code exists (read is allowed for authed users)
      const cfg = await getDoc(doc(db, "pro_config", "redeem"));
      if (!cfg.exists() || cfg.data().code !== trimmed) {
        toast.error("الكود غير صحيح أو منتهي");
        setLoading(false);
        return;
      }
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      await setDoc(
        doc(db, PRO_USERS_COLLECTION, user.uid),
        {
          isPro: true,
          source: "trial",
          redeemCode: trimmed,
          expiresAt: Timestamp.fromDate(expires),
          activatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      toast.success("تم تفعيل Pro — استمتع بالمزايا 🎉");
      setCode("");
    } catch (e: any) {
      console.error(e);
      toast.error("فشل التفعيل — تأكد من الكود");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 space-y-3" dir="rtl">
      <div className="flex items-center gap-2 justify-end">
        <h4 className="font-bold">تفعيل بكود تجريبي</h4>
        <KeyRound className="w-5 h-5" style={{ color: PRO_COLOR }} />
      </div>
      <p className="text-xs text-muted-foreground text-right leading-relaxed">
        أدخل الكود السري للحصول على Pro لمدة سنة (وضع الاختبار فقط).
      </p>
      <div className="flex gap-2">
        <Input
          dir="ltr"
          placeholder="XXXX-XXXX-XXXX-XXXX"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="font-mono"
        />
        <Button
          onClick={redeem}
          disabled={loading}
          className="text-white"
          style={{ background: PRO_COLOR }}
        >
          <Sparkles className="w-4 h-4 ml-1" /> تفعيل
        </Button>
      </div>
    </Card>
  );
};

export default ProRedeemCard;
