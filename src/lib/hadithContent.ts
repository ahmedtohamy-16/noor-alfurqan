import type { Hadith } from "@/data/hadithBooks";
export const HADITH_CONTENT_VERSION = 2;

type Snapshot = { bookId: string; hadithNumber: number; text: string; narrator?: string; contentVersion?: number };
export const safeHadithSnapshot = <T extends Snapshot>(value: T): T => value.contentVersion === HADITH_CONTENT_VERSION
  ? value : { ...value, text: "", narrator: undefined };

/** Keep saved identities; obtain authoritative text instead of displaying a legacy bad snapshot. */
export const refreshHadithSnapshots = async <T extends Snapshot>(values: T[]): Promise<T[]> => {
  const replacements = new Map<string, Hadith>();
  const groups = new Map<string, number[]>();
  for (const value of values) {
    if (value.contentVersion === HADITH_CONTENT_VERSION) continue;
    groups.set(value.bookId, [...(groups.get(value.bookId) ?? []), value.hadithNumber]);
  }
  await Promise.all([...groups].map(async ([book, numbers]) => {
    try {
      const params = new URLSearchParams({ action: "lookup", book, numbers: [...new Set(numbers)].join(",") });
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hadith-api?${params}`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.contentVersion !== HADITH_CONTENT_VERSION) return;
      for (const hadith of data.hadiths ?? []) replacements.set(`${book}:${hadith.hadithNumber}`, hadith);
    } catch { /* A saved identity remains available for retry when connected. */ }
  }));
  return values.map(value => {
    const replacement = replacements.get(`${value.bookId}:${value.hadithNumber}`);
    return replacement ? { ...value, text: replacement.text, narrator: replacement.narrator, contentVersion: HADITH_CONTENT_VERSION } : safeHadithSnapshot(value);
  });
};