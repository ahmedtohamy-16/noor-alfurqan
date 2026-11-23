/** Wrap full source text for image exports without dropping words or inserting an excerpt. */
export const fullTextLines = (text: string, maxWidth: number, measure: (line: string) => number): string[] => {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    let current = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = current ? `${current} ${word}` : word;
      if (current && measure(candidate) > maxWidth) { lines.push(current); current = word; }
      else current = candidate;
    }
    lines.push(current);
  }
  return lines;
};