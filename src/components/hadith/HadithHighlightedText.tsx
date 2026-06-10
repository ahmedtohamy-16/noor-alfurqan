import { useMemo } from "react";
import { normalizeArabic } from "@/lib/arabicNormalize";

interface Props {
  text: string;
  query?: string;
  className?: string;
}

// Highlights occurrences of `query` (normalized, diacritic-insensitive) inside `text`
// while preserving the original Arabic diacritics in display.
const HadithHighlightedText = ({ text, query, className }: Props) => {
  const segments = useMemo(() => {
    if (!query || !query.trim()) return [{ str: text, hit: false }];
    const nQuery = normalizeArabic(query);
    if (!nQuery) return [{ str: text, hit: false }];

    // Build a character index map: normalizedIndex -> original char range.
    // Simple approach: walk text, build normalized projection.
    const norm: string[] = [];
    const idxMap: number[] = []; // for each normalized char, original start index
    for (let i = 0; i < text.length; i++) {
      const piece = normalizeArabic(text[i]);
      if (piece) {
        for (let k = 0; k < piece.length; k++) {
          norm.push(piece[k]);
          idxMap.push(i);
        }
      }
    }
    const normStr = norm.join("");

    const parts: { str: string; hit: boolean }[] = [];
    let cursor = 0;
    let searchFrom = 0;
    while (true) {
      const idx = normStr.indexOf(nQuery, searchFrom);
      if (idx === -1) break;
      const origStart = idxMap[idx];
      const origEnd =
        idx + nQuery.length < idxMap.length
          ? idxMap[idx + nQuery.length]
          : text.length;
      if (origStart > cursor) {
        parts.push({ str: text.slice(cursor, origStart), hit: false });
      }
      parts.push({ str: text.slice(origStart, origEnd), hit: true });
      cursor = origEnd;
      searchFrom = idx + nQuery.length;
    }
    if (cursor < text.length) {
      parts.push({ str: text.slice(cursor), hit: false });
    }
    return parts.length ? parts : [{ str: text, hit: false }];
  }, [text, query]);

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.hit ? (
          <mark
            key={i}
            className="bg-[hsl(var(--gold-gradient-start)/0.35)] text-foreground rounded px-0.5"
          >
            {seg.str}
          </mark>
        ) : (
          <span key={i}>{seg.str}</span>
        )
      )}
    </span>
  );
};

export default HadithHighlightedText;
