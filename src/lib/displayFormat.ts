export const arabicDigits = (value: number) =>
  String(value).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);

export const ayahCountLabel = (count: number) =>
  `${arabicDigits(count)} ${count % 100 >= 3 && count % 100 <= 10 ? "آيات" : "آية"}`;

export const greetingForHour = (hour: number) => {
  if (hour >= 4 && hour < 12) return "صباح الخير";
  if (hour >= 12 && hour < 17) return "نهارك سعيد";
  if (hour >= 17 && hour < 21) return "مساء الخير";
  return "ليلة هانئة";
};