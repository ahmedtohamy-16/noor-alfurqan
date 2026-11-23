import { countries } from "@/data/locationData";

/** Translate only exact known names; never replace the device's GPS coordinates. */
export const arabicCityName = (name: string | null | undefined): string | null => {
  if (!name) return null;
  const trimmed = name.trim();
  const matches = new Set(countries.flatMap(country => country.cities)
    .filter(city => [city.name_ar, city.name_en].some(value => value.toLocaleLowerCase() === trimmed.toLocaleLowerCase()))
    .map(city => city.name_ar));
  return matches.size === 1 ? [...matches][0] : trimmed;
};

export const preferredCityName = (candidates: unknown[]): string | null => {
  const names = candidates.filter((value): value is string => typeof value === "string" && !!value.trim()).map(value => arabicCityName(value));
  return names.find(value => value && /[\u0621-\u064A]/.test(value)) ?? names[0] ?? null;
};