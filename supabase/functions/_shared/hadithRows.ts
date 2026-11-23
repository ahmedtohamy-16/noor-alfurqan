export const HADITH_CONTENT_VERSION = 2;

/** Verified repository schema: number, full Arabic text, optional commentary. No narrator column. */
export const mapHadithRows = (rows: string[][], bookId: string) => rows.flatMap(row => {
  const value = row[0]?.replace(/^\uFEFF/, "").trim();
  if (!value || !/^\d+$/.test(value)) return [];
  const hadithNumber = Number(value);
  if (!Number.isSafeInteger(hadithNumber) || hadithNumber < 1 || !row[1]?.trim()) return [];
  return [{ id: hadithNumber, bookId, hadithNumber, text: row[1].trim(), ...(row[2]?.trim() ? { elaboration: row[2].trim() } : {}), contentVersion: HADITH_CONTENT_VERSION }];
});