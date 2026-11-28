import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Legacy Firestore paths still used by old admin/redeem screens; they no longer grant Pro.
export const PRO_CONFIG_COLLECTION = "pro_config";
export const PRO_USERS_COLLECTION = "pro_users";
export const PRO_ADMINS_DOC = "admins";

export type ProSource = "admin" | "subscription" | "trial" | null;

interface ProState {
  isPro: boolean;
  isLoading: boolean;
  source: ProSource;
  expiresAt: Date | null;
}

const ProContext = createContext<ProState>({ isPro: false, isLoading: true, source: null, expiresAt: null });

const NOT_PRO: Omit<ProState, "isLoading"> = { isPro: false, source: null, expiresAt: null };

/**
 * Pro access comes only from server-side records: the signed-in user's own
 * pro_entitlements row or an admin role in user_roles. Neither can be written
 * by the user, so an unverified email or client flag can never unlock Pro.
 */
export const ProProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [state, setState] = useState<Omit<ProState, "isLoading">>(NOT_PRO);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setState(NOT_PRO);
      setIsLoading(false);
      return;
    }
    let current = true;
    const refresh = async () => {
      const [roleRes, entRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.uid).eq("role", "admin").maybeSingle(),
        supabase.from("pro_entitlements").select("is_pro,plan,expires_at").eq("user_id", user.uid).maybeSingle(),
      ]);
      if (!current) return;
      let next = NOT_PRO;
      if (!roleRes.error && roleRes.data) {
        next = { isPro: true, source: "admin", expiresAt: null };
      } else if (!entRes.error && entRes.data?.is_pro) {
        const exp = entRes.data.expires_at ? new Date(entRes.data.expires_at) : null;
        if (!exp || exp.getTime() > Date.now()) {
          next = { isPro: true, source: entRes.data.plan === "trial" ? "trial" : "subscription", expiresAt: exp };
        }
      }
      setState(next);
      setIsLoading(false);
    };
    setIsLoading(true);
    void refresh();
    window.addEventListener("focus", refresh);
    return () => { current = false; window.removeEventListener("focus", refresh); };
  }, [user?.uid]);

  return <ProContext.Provider value={{ ...state, isLoading }}>{children}</ProContext.Provider>;
};

export const usePro = () => useContext(ProContext);
