export const TOTAL_MUSHAF_PAGES = 604;
export const JUZ_START_PAGES = [1,22,42,62,82,102,121,142,162,182,201,222,242,262,282,302,322,342,362,382,402,422,442,462,482,502,522,542,562,582];

export const pageForJuz = (value: string | undefined): number | null => {
  if (!value || !/^\d{1,2}$/.test(value)) return null;
  return JUZ_START_PAGES[Number(value) - 1] ?? null;
};