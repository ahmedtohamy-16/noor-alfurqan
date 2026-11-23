// Country and city data for location picker

export interface City {
  name_ar: string;
  name_en: string;
  latitude: number;
  longitude: number;
}

export interface Country {
  code: string;
  name_ar: string;
  name_en: string;
  cities: City[];
}

export const countries: Country[] = [
  {
    code: 'SA',
    name_ar: 'المملكة العربية السعودية',
    name_en: 'Saudi Arabia',
    cities: [
      { name_ar: 'مكة المكرمة', name_en: 'Makkah', latitude: 21.4225, longitude: 39.8262 },
      { name_ar: 'المدينة المنورة', name_en: 'Madinah', latitude: 24.5247, longitude: 39.5692 },
      { name_ar: 'الرياض', name_en: 'Riyadh', latitude: 24.7136, longitude: 46.6753 },
      { name_ar: 'جدة', name_en: 'Jeddah', latitude: 21.5433, longitude: 39.1728 },
      { name_ar: 'الدمام', name_en: 'Dammam', latitude: 26.4207, longitude: 50.0888 },
      { name_ar: 'الخبر', name_en: 'Khobar', latitude: 26.2172, longitude: 50.1971 },
      { name_ar: 'تبوك', name_en: 'Tabuk', latitude: 28.3838, longitude: 36.5550 },
      { name_ar: 'أبها', name_en: 'Abha', latitude: 18.2164, longitude: 42.5053 },
    ],
  },
  {
    code: 'EG',
    name_ar: 'مصر',
    name_en: 'Egypt',
    cities: [
      { name_ar: 'القاهرة', name_en: 'Cairo', latitude: 30.0444, longitude: 31.2357 },
      { name_ar: 'الإسكندرية', name_en: 'Alexandria', latitude: 31.2001, longitude: 29.9187 },
      { name_ar: 'الجيزة', name_en: 'Giza', latitude: 30.0131, longitude: 31.2089 },
      { name_ar: 'أسوان', name_en: 'Aswan', latitude: 24.0889, longitude: 32.8998 },
      { name_ar: 'الأقصر', name_en: 'Luxor', latitude: 25.6872, longitude: 32.6396 },
      { name_ar: 'الزقازيق', name_en: 'Zagazig', latitude: 30.5877, longitude: 31.502 },
      { name_ar: 'المنصورة', name_en: 'Mansoura', latitude: 31.0409, longitude: 31.3785 },
      { name_ar: 'طنطا', name_en: 'Tanta', latitude: 30.7865, longitude: 31.0004 },
      { name_ar: 'المحلة الكبرى', name_en: 'El Mahalla El Kubra', latitude: 30.9697, longitude: 31.166 },
      { name_ar: 'بورسعيد', name_en: 'Port Said', latitude: 31.2653, longitude: 32.3019 },
      { name_ar: 'السويس', name_en: 'Suez', latitude: 29.9668, longitude: 32.5498 },
      { name_ar: 'الإسماعيلية', name_en: 'Ismailia', latitude: 30.5965, longitude: 32.2715 },
      { name_ar: 'دمياط', name_en: 'Damietta', latitude: 31.4165, longitude: 31.8133 },
      { name_ar: 'دمنهور', name_en: 'Damanhur', latitude: 31.0341, longitude: 30.4682 },
      { name_ar: 'كفر الشيخ', name_en: 'Kafr El Sheikh', latitude: 31.1107, longitude: 30.9388 },
      { name_ar: 'شبين الكوم', name_en: 'Shibin El Kom', latitude: 30.5503, longitude: 31.0106 },
      { name_ar: 'بنها', name_en: 'Banha', latitude: 30.466, longitude: 31.1848 },
      { name_ar: 'شبرا الخيمة', name_en: 'Shubra El Kheima', latitude: 30.1286, longitude: 31.2422 },
      { name_ar: 'الفيوم', name_en: 'Faiyum', latitude: 29.3084, longitude: 30.8428 },
      { name_ar: 'بني سويف', name_en: 'Beni Suef', latitude: 29.0661, longitude: 31.0994 },
      { name_ar: 'المنيا', name_en: 'Minya', latitude: 28.0871, longitude: 30.7618 },
      { name_ar: 'أسيوط', name_en: 'Asyut', latitude: 27.1783, longitude: 31.1859 },
      { name_ar: 'سوهاج', name_en: 'Sohag', latitude: 26.5591, longitude: 31.6957 },
      { name_ar: 'قنا', name_en: 'Qena', latitude: 26.1551, longitude: 32.716 },
      { name_ar: 'الغردقة', name_en: 'Hurghada', latitude: 27.2579, longitude: 33.8116 },
      { name_ar: 'شرم الشيخ', name_en: 'Sharm El Sheikh', latitude: 27.9158, longitude: 34.33 },
      { name_ar: 'العريش', name_en: 'Arish', latitude: 31.1316, longitude: 33.7984 },
      { name_ar: 'مرسى مطروح', name_en: 'Marsa Matruh', latitude: 31.3543, longitude: 27.2373 },
      { name_ar: 'الخارجة', name_en: 'Kharga', latitude: 25.439, longitude: 30.5586 },
      { name_ar: 'العاشر من رمضان', name_en: '10th of Ramadan', latitude: 30.2967, longitude: 31.7433 },
      { name_ar: '6 أكتوبر', name_en: '6th of October', latitude: 29.9285, longitude: 30.9188 },
      { name_ar: 'القاهرة الجديدة', name_en: 'New Cairo', latitude: 30.03, longitude: 31.47 },
      { name_ar: 'حلوان', name_en: 'Helwan', latitude: 29.8414, longitude: 31.3008 },
      { name_ar: 'ميت غمر', name_en: 'Mit Ghamr', latitude: 30.7167, longitude: 31.2627 },
      { name_ar: 'ملوي', name_en: 'Mallawi', latitude: 27.7314, longitude: 30.8418 },
      { name_ar: 'إدفو', name_en: 'Edfu', latitude: 24.9781, longitude: 32.8734 },
      { name_ar: 'كوم أمبو', name_en: 'Kom Ombo', latitude: 24.4767, longitude: 32.9467 },
    ],
  },
  {
    code: 'AE',
    name_ar: 'الإمارات العربية المتحدة',
    name_en: 'United Arab Emirates',
    cities: [
      { name_ar: 'دبي', name_en: 'Dubai', latitude: 25.2048, longitude: 55.2708 },
      { name_ar: 'أبوظبي', name_en: 'Abu Dhabi', latitude: 24.4539, longitude: 54.3773 },
      { name_ar: 'الشارقة', name_en: 'Sharjah', latitude: 25.3573, longitude: 55.4033 },
    ],
  },
  {
    code: 'KW',
    name_ar: 'الكويت',
    name_en: 'Kuwait',
    cities: [
      { name_ar: 'الكويت', name_en: 'Kuwait City', latitude: 29.3759, longitude: 47.9774 },
    ],
  },
  {
    code: 'QA',
    name_ar: 'قطر',
    name_en: 'Qatar',
    cities: [
      { name_ar: 'الدوحة', name_en: 'Doha', latitude: 25.2854, longitude: 51.5310 },
    ],
  },
  {
    code: 'JO',
    name_ar: 'الأردن',
    name_en: 'Jordan',
    cities: [
      { name_ar: 'عمّان', name_en: 'Amman', latitude: 31.9454, longitude: 35.9284 },
    ],
  },
  {
    code: 'LB',
    name_ar: 'لبنان',
    name_en: 'Lebanon',
    cities: [
      { name_ar: 'بيروت', name_en: 'Beirut', latitude: 33.8938, longitude: 35.5018 },
    ],
  },
  {
    code: 'IQ',
    name_ar: 'العراق',
    name_en: 'Iraq',
    cities: [
      { name_ar: 'بغداد', name_en: 'Baghdad', latitude: 33.3152, longitude: 44.3661 },
    ],
  },
  {
    code: 'SY',
    name_ar: 'سوريا',
    name_en: 'Syria',
    cities: [
      { name_ar: 'دمشق', name_en: 'Damascus', latitude: 33.5138, longitude: 36.2765 },
    ],
  },
  {
    code: 'MA',
    name_ar: 'المغرب',
    name_en: 'Morocco',
    cities: [
      { name_ar: 'الرباط', name_en: 'Rabat', latitude: 34.0209, longitude: -6.8416 },
      { name_ar: 'الدار البيضاء', name_en: 'Casablanca', latitude: 33.5731, longitude: -7.5898 },
    ],
  },
  {
    code: 'DZ',
    name_ar: 'الجزائر',
    name_en: 'Algeria',
    cities: [
      { name_ar: 'الجزائر', name_en: 'Algiers', latitude: 36.7538, longitude: 3.0588 },
    ],
  },
  {
    code: 'TN',
    name_ar: 'تونس',
    name_en: 'Tunisia',
    cities: [
      { name_ar: 'تونس', name_en: 'Tunis', latitude: 36.8065, longitude: 10.1815 },
    ],
  },
  {
    code: 'SD',
    name_ar: 'السودان',
    name_en: 'Sudan',
    cities: [
      { name_ar: 'الخرطوم', name_en: 'Khartoum', latitude: 15.5007, longitude: 32.5599 },
    ],
  },
  {
    code: 'YE',
    name_ar: 'اليمن',
    name_en: 'Yemen',
    cities: [
      { name_ar: 'صنعاء', name_en: 'Sanaa', latitude: 15.3694, longitude: 44.1910 },
    ],
  },
  {
    code: 'LY',
    name_ar: 'ليبيا',
    name_en: 'Libya',
    cities: [
      { name_ar: 'طرابلس', name_en: 'Tripoli', latitude: 32.8872, longitude: 13.1913 },
    ],
  },
  {
    code: 'OM',
    name_ar: 'عمان',
    name_en: 'Oman',
    cities: [
      { name_ar: 'مسقط', name_en: 'Muscat', latitude: 23.5880, longitude: 58.3829 },
    ],
  },
  {
    code: 'BH',
    name_ar: 'البحرين',
    name_en: 'Bahrain',
    cities: [
      { name_ar: 'المنامة', name_en: 'Manama', latitude: 26.2285, longitude: 50.5860 },
    ],
  },
  {
    code: 'PS',
    name_ar: 'فلسطين',
    name_en: 'Palestine',
    cities: [
      { name_ar: 'القدس', name_en: 'Jerusalem', latitude: 31.7683, longitude: 35.2137 },
      { name_ar: 'غزة', name_en: 'Gaza', latitude: 31.5017, longitude: 34.4668 },
    ],
  },
  {
    code: 'TR',
    name_ar: 'تركيا',
    name_en: 'Turkey',
    cities: [
      { name_ar: 'إسطنبول', name_en: 'Istanbul', latitude: 41.0082, longitude: 28.9784 },
      { name_ar: 'أنقرة', name_en: 'Ankara', latitude: 39.9334, longitude: 32.8597 },
    ],
  },
  {
    code: 'PK',
    name_ar: 'باكستان',
    name_en: 'Pakistan',
    cities: [
      { name_ar: 'إسلام آباد', name_en: 'Islamabad', latitude: 33.6844, longitude: 73.0479 },
      { name_ar: 'كراتشي', name_en: 'Karachi', latitude: 24.8607, longitude: 67.0011 },
      { name_ar: 'لاهور', name_en: 'Lahore', latitude: 31.5497, longitude: 74.3436 },
    ],
  },
];

// Prayer calculation methods — names must match the Aladhan method IDs they are saved with.
export const prayerMethods = [
  { id: 1, name: 'جامعة العلوم الإسلامية - كراتشي' },
  { id: 2, name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)' },
  { id: 3, name: 'رابطة العالم الإسلامي' },
  { id: 4, name: 'أم القرى - مكة المكرمة' },
  { id: 5, name: 'الهيئة المصرية العامة للمساحة' },
  { id: 7, name: 'معهد الجيوفيزياء - طهران' },
  { id: 8, name: 'منطقة الخليج' },
  { id: 9, name: 'الكويت' },
  { id: 10, name: 'قطر' },
  { id: 11, name: 'مجلس علماء سنغافورة' },
  { id: 12, name: 'فرنسا (UOIF)' },
  { id: 13, name: 'تركيا (ديانت)' },
  { id: 14, name: 'الإدارة الدينية - روسيا' },
  { id: 15, name: 'لجنة رؤية الهلال العالمية' },
  { id: 16, name: 'دبي (الإمارات)' },
  { id: 17, name: 'دائرة تطوير الإسلام - ماليزيا (JAKIM)' },
  { id: 18, name: 'وزارة الشؤون الدينية - تونس' },
  { id: 19, name: 'وزارة الشؤون الدينية - الجزائر' },
  { id: 20, name: 'وزارة الشؤون الدينية - إندونيسيا' },
  { id: 21, name: 'وزارة الأوقاف - المغرب' },
  { id: 22, name: 'الجالية الإسلامية - لشبونة' },
  { id: 23, name: 'وزارة الأوقاف - الأردن' },
];
