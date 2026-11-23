import { createLucideIcon, type LucideIcon } from "lucide-react";

/** Custom icons drawn on Lucide's 24px grid so they match stroke weight and follow currentColor. */
export const MosqueIcon: LucideIcon = createLucideIcon("Mosque", [
  ["path", { d: "M12 3c-3 2-5 4-5 7h10c0-3-2-5-5-7z", key: "dome" }],
  ["path", { d: "M5 21V12h14v9", key: "body" }],
  ["path", { d: "M10 21v-4a2 2 0 0 1 4 0v4", key: "door" }],
  ["path", { d: "M2 21h20", key: "ground" }],
  ["path", { d: "M2 21V9l1-2 1 2v12", key: "minaret" }],
]);

export const KaabaIcon: LucideIcon = createLucideIcon("Kaaba", [
  ["path", { d: "M4 7l8-4 8 4v10l-8 4-8-4z", key: "cube" }],
  ["path", { d: "M4 7l8 4 8-4", key: "top" }],
  ["path", { d: "M12 11v10", key: "edge" }],
  ["path", { d: "M4 10.5l8 4 8-4", key: "band" }],
]);

