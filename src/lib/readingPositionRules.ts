export interface ReadingAyahBounds {
  index: number;
  top: number;
  bottom: number;
}

// The first ayah still crossing the reading line owns the displayed Mushaf page.
// Accept an iterable so the caller can stop measuring after finding that ayah.
export function readingAyahIndex(bounds: Iterable<ReadingAyahBounds>, readingLine: number): number {
  let lastIndex = 0;
  for (const ayah of bounds) {
    lastIndex = ayah.index;
    if (ayah.bottom > readingLine) return ayah.index;
  }
  return lastIndex;
}