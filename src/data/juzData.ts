// Juz (Para) global-ayah starts. Global ayah numbers follow the alquran.cloud
// numbering (1..6236) which matches the audio CDN used by the app.
export const juzStarts: number[] = [
  1, 149, 260, 386, 517, 641, 751, 900, 1042, 1201,
  1329, 1479, 1649, 1803, 2030, 2215, 2484, 2674, 2876, 3215,
  3386, 3564, 3733, 3971, 4177, 4382, 4629, 4923, 5106, 5673,
];

export const TOTAL_AYAHS = 6236;

/** Return the 1-based juz number for a given global ayah number. */
export const getJuzOfAyah = (globalAyahNumber: number): number => {
  if (globalAyahNumber < 1) return 1;
  for (let i = juzStarts.length - 1; i >= 0; i--) {
    if (globalAyahNumber >= juzStarts[i]) return i + 1;
  }
  return 1;
};
