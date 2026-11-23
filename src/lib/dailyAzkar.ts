import type { AzkarSection, AzkarDhikr } from "./azkarRules";

export const MORNING_SECTION_ID = 1;
export const EVENING_SECTION_ID = 133;

function dailyDhikr(dhikr: AzkarDhikr, evening: boolean): AzkarDhikr {
  const body = dhikr.text.replace(/\[[^\]]*\]/g, "").trim();
  if (!evening) return { ...dhikr, text: body };
  let text = body;
  // These variants are explicitly documented in the source's evening annotations.
  switch (dhikr.id) {
    case 3:
      text = body.replace("أَصْبَحْنَا وَأَصْبَحَ", "أَمْسَيْنَا وَأَمْسَى")
        .replace(/هَذَا الْيَوْمِ/g, "هَذِهِ اللَّيْلَةِ").replace(/مَا بَعْدَهُ/g, "مَا بَعْدَهَا");
      break;
    case 4:
    case 15: {
      const variant = dhikr.text.match(/\[وإذا أمسى قال:\s*([^\]]+)\]/)?.[1];
      if (variant) text = variant.replace(/\.$/, "");
      break;
    }
    case 6: text = body.replace("أَصْبَحْتُ", "أَمْسَيْتُ"); break;
    case 7: text = body.replace("أَصْبَحَ", "أَمْسَى"); break;
    case 16: text = body.replace("أَصْبَحْنا", "أَمْسَيْنَا"); break;
  }
  // Never play the source's morning recording against a different evening text.
  return { ...dhikr, text, ...(text !== body ? { audio: "", filename: "" } : {}) };
}

export function separateDailyAzkar(source: AzkarSection[]): AzkarSection[] {
  const combined = source.find(s => s.id === MORNING_SECTION_ID);
  if (!combined || !combined.category.includes("والمساء")) return source;
  const morning: AzkarSection = {
    ...combined, category: "أذكار الصباح", audio: "", filename: "",
    array: combined.array.filter(d => d.id !== 23).map(d => dailyDhikr(d, false)),
  };
  const evening: AzkarSection = {
    ...combined, id: EVENING_SECTION_ID, category: "أذكار المساء", audio: "", filename: "",
    array: combined.array.filter(d => ![19, 20, 21].includes(d.id)).map(d => dailyDhikr(d, true)),
  };
  return source.flatMap(s => s.id === MORNING_SECTION_ID ? [morning, evening] : [s]);
}