/** Returns true when the daily wird reminder should fire now. */
export const shouldFireWirdReminder = (opts: {
  enabled: boolean;
  permission: string;
  time: string; // "HH:MM" or "HH:MM:SS"
  now: Date;
  lastFiredDate: string | null; // YYYY-MM-DD local
}): boolean => {
  if (!opts.enabled || opts.permission !== "granted") return false;
  const [h, m] = opts.time.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return false;
  const today = localDateKey(opts.now);
  if (opts.lastFiredDate === today) return false;
  const minutes = opts.now.getHours() * 60 + opts.now.getMinutes();
  const target = h * 60 + m;
  // fire within a 30-minute window after the chosen time (tab may wake late)
  return minutes >= target && minutes < target + 30;
};

export const localDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
