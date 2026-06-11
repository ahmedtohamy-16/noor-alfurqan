import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export const PRO_CONFIG_COLLECTION = "pro_config";
export const PRO_USERS_COLLECTION = "pro_users";
export const PRO_ADMINS_DOC = "admins";

export type ProSource = "admin" | "subscription" | "trial" | null;

interface ProState {
  isPro: boolean;
  isLoading: boolean;
  source: ProSource;
  expiresAt: Date | null;
  adminEmails: string[];
  adminUids: string[];
}

const ProContext = createContext<ProState>({
  isPro: false,
  isLoading: true,
  source: null,
  expiresAt: null,
  adminEmails: [],
  adminUids: [],
});

export const ProProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [adminUids, setAdminUids] = useState<string[]>([]);
  const [proDoc, setProDoc] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingPro, setLoadingPro] = useState(true);

  // Watch admin allowlist
  useEffect(() => {
    const db = getFirestoreDb();
    const ref = doc(db, PRO_CONFIG_COLLECTION, PRO_ADMINS_DOC);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.exists() ? snap.data() : {};
        setAdminEmails(((data.emails as string[]) || []).map((e) => e.toLowerCase()));
        setAdminUids((data.uids as string[]) || []);
        setLoadingConfig(false);
      },
      () => setLoadingConfig(false)
    );
    return () => unsub();
  }, []);

  // Watch per-user pro doc
  useEffect(() => {
    if (!user) {
      setProDoc(null);
      setLoadingPro(false);
      return;
    }
    setLoadingPro(true);
    const db = getFirestoreDb();
    const ref = doc(db, PRO_USERS_COLLECTION, user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setProDoc(snap.exists() ? snap.data() : null);
        setLoadingPro(false);
      },
      () => setLoadingPro(false)
    );
    return () => unsub();
  }, [user?.uid]);

  const emailLc = user?.email?.toLowerCase() || "";
  const isAdminBypass =
    !!user && (adminEmails.includes(emailLc) || adminUids.includes(user.uid));

  let isPro = isAdminBypass;
  let source: ProSource = isAdminBypass ? "admin" : null;
  let expiresAt: Date | null = null;

  if (!isAdminBypass && proDoc?.isPro) {
    if (proDoc.expiresAt?.toDate) {
      const exp = proDoc.expiresAt.toDate();
      if (exp.getTime() > Date.now()) {
        isPro = true;
        source = proDoc.source || "subscription";
        expiresAt = exp;
      }
    } else {
      isPro = true;
      source = proDoc.source || "subscription";
    }
  }

  return (
    <ProContext.Provider
      value={{
        isPro,
        isLoading: loadingConfig || loadingPro,
        source,
        expiresAt,
        adminEmails,
        adminUids,
      }}
    >
      {children}
    </ProContext.Provider>
  );
};

export const usePro = () => useContext(ProContext);
