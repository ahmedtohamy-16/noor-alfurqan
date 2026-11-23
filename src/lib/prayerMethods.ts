// Recommended Aladhan calculation method per country (ISO code).
// Falls back to Muslim World League (3) when the country has no official authority listed.
const BY_COUNTRY: Record<string, number> = {
  EG: 5, // الهيئة المصرية العامة للمساحة
  SA: 4, // أم القرى
  KW: 9, QA: 10, AE: 16, TR: 13, MA: 21, JO: 23, DZ: 19, TN: 18,
  BH: 8, OM: 8, YE: 4, SD: 5, LY: 5, SY: 5, LB: 5, IQ: 3, PS: 5,
};

export const recommendedPrayerMethod = (countryCode?: string | null): number =>
  (countryCode && BY_COUNTRY[countryCode.toUpperCase()]) || 3;
