import { useEffect, useState, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * FirstVisitTextReveal
 * -----------------------------------------------------------
 * A reusable, premium text-reveal overlay that plays ONCE per
 * (pageKey, user) pair. State is persisted in localStorage so
 * it survives reloads and future sessions until data is cleared
 * or reset via `resetFirstVisitReveal(pageKey)`.
 *
 * Usage:
 *   <FirstVisitTextReveal pageKey="quran" text="القرآن الكريم" subtitle="ابدأ رحلتك" />
 *
 * Accessibility:
 *  - Respects prefers-reduced-motion (skips animation, still marks seen).
 *  - Uses role="status" + aria-live so screen readers announce it.
 *  - Overlay is dismissible and never blocks interaction after finish.
 */

const STORAGE_PREFIX = "noor:first-visit-reveal:";

const storageKey = (pageKey: string, userId?: string | null) =>
  `${STORAGE_PREFIX}${pageKey}${userId ? `:${userId}` : ""}`;

export const hasSeenFirstVisitReveal = (pageKey: string, userId?: string | null) => {
  try {
    return localStorage.getItem(storageKey(pageKey, userId)) === "1";
  } catch {
    return true; // fail-safe: don't repeatedly show if storage broken
  }
};

export const markFirstVisitRevealSeen = (pageKey: string, userId?: string | null) => {
  try {
    localStorage.setItem(storageKey(pageKey, userId), "1");
  } catch {
    /* ignore */
  }
};

export const resetFirstVisitReveal = (pageKey: string, userId?: string | null) => {
  try {
    localStorage.removeItem(storageKey(pageKey, userId));
  } catch {
    /* ignore */
  }
};

interface FirstVisitTextRevealProps {
  /** Unique key identifying the page (e.g. "quran", "hadith"). */
  pageKey: string;
  /** Main text to reveal. */
  text: string;
  /** Optional subtitle shown after the main text. */
  subtitle?: string;
  /** Optional user identifier so reveal is per-user. */
  userId?: string | null;
  /** Total animation duration in ms (default 2200). */
  durationMs?: number;
  /** Called when the reveal completes or is skipped. */
  onComplete?: () => void;
  /** Extra classes for the overlay container. */
  className?: string;
}

const FirstVisitTextReveal = ({
  pageKey,
  text,
  subtitle,
  userId,
  durationMs = 2200,
  onComplete,
  className,
}: FirstVisitTextRevealProps) => {
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // Decide once, synchronously, whether to render.
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !hasSeenFirstVisitReveal(pageKey, userId);
  });
  const [fadingOut, setFadingOut] = useState(false);
  const completedRef = useRef(false);

  const words = useMemo(() => text.split(" ").filter(Boolean), [text]);

  useEffect(() => {
    if (!visible) return;

    // Mark seen immediately so a mid-animation reload doesn't replay it.
    markFirstVisitRevealSeen(pageKey, userId);

    const total = prefersReducedMotion ? 400 : durationMs;
    const fadeStart = setTimeout(() => setFadingOut(true), total - 350);
    const done = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      setVisible(false);
      onComplete?.();
    }, total);

    return () => {
      clearTimeout(fadeStart);
      clearTimeout(done);
    };
  }, [visible, durationMs, prefersReducedMotion, pageKey, userId, onComplete]);

  if (!visible) return null;

  const perWordDelay = Math.max(
    60,
    Math.min(220, (durationMs - 600) / Math.max(words.length, 1))
  );

  const skip = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setVisible(false);
    onComplete?.();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={skip}
      className={cn(
        "fixed inset-0 z-[60] flex items-center justify-center",
        "bg-background/85 backdrop-blur-md cursor-pointer select-none",
        "transition-opacity duration-300",
        fadingOut ? "opacity-0" : "opacity-100",
        className
      )}
    >
      {/* Soft radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_65%)] pointer-events-none" />

      <div className="relative text-center px-6 max-w-3xl">
        <h2 className="font-arabic text-4xl md:text-6xl font-extrabold text-primary tracking-tight leading-tight flex flex-wrap justify-center gap-x-3 gap-y-2">
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="inline-block opacity-0"
              style={{
                animation: prefersReducedMotion
                  ? "fade-in 0.3s ease-out forwards"
                  : `fade-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                animationDelay: `${i * perWordDelay}ms`,
              }}
            >
              {word}
            </span>
          ))}
        </h2>

        {subtitle && (
          <p
            className="mt-6 text-base md:text-lg text-muted-foreground font-arabic opacity-0"
            style={{
              animation: "fade-in 0.6s ease-out forwards",
              animationDelay: `${words.length * perWordDelay + 150}ms`,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Accent line */}
        <div
          className="mx-auto mt-6 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent origin-center"
          style={{
            width: "min(320px, 70%)",
            transform: "scaleX(0)",
            animation: "reveal-line 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards",
            animationDelay: `${words.length * perWordDelay + 250}ms`,
          }}
        />
      </div>

      {/* Component-scoped keyframe for the accent line (fade-in is global). */}
      <style>{`
        @keyframes reveal-line {
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

export default FirstVisitTextReveal;
