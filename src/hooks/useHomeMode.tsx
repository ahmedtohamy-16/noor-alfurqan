import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type HomeMode = "islamic" | "social";
const KEY = "noor:home-mode";

interface Ctx {
  mode: HomeMode;
  setMode: (m: HomeMode) => void;
}

const HomeModeContext = createContext<Ctx>({ mode: "islamic", setMode: () => {} });

export const HomeModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<HomeMode>(
    () => (typeof window !== "undefined" && (localStorage.getItem(KEY) as HomeMode)) || "islamic"
  );

  const setMode = (m: HomeMode) => {
    setModeState(m);
    try {
      localStorage.setItem(KEY, m);
      window.dispatchEvent(new CustomEvent("noor:home-mode-changed", { detail: m }));
    } catch {}
  };

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as HomeMode;
      if (detail && detail !== mode) setModeState(detail);
    };
    window.addEventListener("noor:home-mode-changed", onChange);
    return () => window.removeEventListener("noor:home-mode-changed", onChange);
  }, [mode]);

  return <HomeModeContext.Provider value={{ mode, setMode }}>{children}</HomeModeContext.Provider>;
};

export const useHomeMode = () => useContext(HomeModeContext);
