export const arabicDigits = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);

export const westernDigits = (value: string) =>
  value.replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

export const ayahCountLabel = (count: number) =>
  `${arabicDigits(count)} ${count >= 3 && count <= 10 ? "آيات" : "آية"}`;

const FAJR_KEY = "todayFajrTime";
const toMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + (m || 0); };

/** Save today's Fajr time ("HH:MM") so the greeting switches to morning at Fajr, not a fixed hour. */
export const rememberFajrTime = (fajr: string | undefined, date = new Date()) => {
  if (!fajr) return;
  try { localStorage.setItem(FAJR_KEY, JSON.stringify({ day: date.toDateString(), fajr: fajr.split(" ")[0] })); } catch { /* ignore */ }
};

const storedFajrMinutes = (date: Date): number | null => {
  try {
    const v = JSON.parse(localStorage.getItem(FAJR_KEY) || "null");
    return v?.fajr ? toMinutes(v.fajr) : null; // Fajr shifts only ~1 min/day, so yesterday's value is fine
  } catch { return null; }
};

/** Morning starts at Fajr (fallback 5:00 when unknown). */
export const greetingForTime = (date = new Date(), fajrMinutes: number | null = storedFajrMinutes(date)) => {
  const mins = date.getHours() * 60 + date.getMinutes();
  const fajr = fajrMinutes ?? 5 * 60;
  if (mins < 12 * 60) return mins >= fajr ? "صباح الخير" : "ليلة هانئة";
  return greetingForHour(date.getHours());
};

export const greetingForHour = (hour: number) => {
  if (hour >= 5 && hour < 12) return "صباح الخير";
  if (hour >= 12 && hour < 17) return "نهارك سعيد";
  if (hour >= 17 && hour < 21) return "مساء الخير";
  return "ليلة هانئة";
};