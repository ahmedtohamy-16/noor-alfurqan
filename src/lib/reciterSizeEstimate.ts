import { arabicDigits } from "@/lib/displayFormat";

/** Approximate recitation pace, in minutes per mushaf page, per reciter. */
const MINUTES_PER_PAGE: Record<string, number> = {
  "ar.husary": 2.4, "ar.minshawi": 2.6, "ar.abdulsamad": 2.5, "ar.alafasy": 1.9,
  "ar.sudais": 1.5, "ar.shuraym": 1.4, "ar.shaatree": 1.8, "ar.mahermuaiqly": 1.7,
  "ar.hanirifai": 2.1, "ar.ahmedajamy": 1.9,
};
const PAGES_PER_AYAH = 604 / 6236;

export const reciterBitrateKbps = (server: string) => Number(server.match(/(\d{2,3})kbps/i)?.[1] ?? 128);

/** Estimated surah download size in MB for one reciter. */
export const estimateSurahMB = (reciterId: string, server: string, ayahCount: number) => {
  const minutes = Math.max(0.3, ayahCount * PAGES_PER_AYAH) * (MINUTES_PER_PAGE[reciterId] ?? 2);
  return (reciterBitrateKbps(server) * 1000 / 8) * minutes * 60 / (1024 * 1024);
};

export const formatSizeMB = (mb: number) => {
  const v = mb < 10 ? mb.toFixed(1) : String(Math.round(mb));
  return `≈ ${arabicDigits(v).replace(".", "٫")} م.ب`;
};
