/** Display-only numeral conversion shared by the app and future notification messages. */
export const arabicDigits = (value: number | string) =>
  String(value).replace(/\d/g, digit => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
export const westernDigits = (value: string) =>
  value.replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));