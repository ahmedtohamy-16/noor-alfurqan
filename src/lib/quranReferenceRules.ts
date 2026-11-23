import { surahs } from "@/data/surahs";
import { westernDigits } from "./displayFormat";
export const parseQuranReference = (input: string) => {
  const match = westernDigits(input.trim()).match(/^(\d+):(\d+)$/);
  return match ? { surah: Number(match[1]), ayah: Number(match[2]) } : null;
};
export const validQuranReference = (reference: { surah: number; ayah: number } | null) => {
  if (!reference || !Number.isInteger(reference.surah) || !Number.isInteger(reference.ayah)) return false;
  const surah = surahs.find(value => value.number === reference.surah);
  return Boolean(surah && reference.ayah >= 1 && reference.ayah <= surah.numberOfAyahs);
};