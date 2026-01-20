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

// Prayer calculation methods
export const prayerMethods = [
  { id: 1, name: 'جامعة العلوم الإسلامية - كراتشي' },
  { id: 2, name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)' },
  { id: 3, name: 'رابطة العالم الإسلامي' },
  { id: 4, name: 'أم القرى - مكة المكرمة' },
  { id: 5, name: 'الاتحاد الإسلامي - مصر' },
  { id: 7, name: 'معهد الجيوفيزياء - طهران' },
  { id: 8, name: 'منطقة الخليج' },
  { id: 9, name: 'الكويت' },
  { id: 10, name: 'قطر' },
  { id: 11, name: 'مجلس علماء سنغافورة' },
  { id: 12, name: 'فرنسا (UOIF)' },
  { id: 13, name: 'تركيا (ديانت)' },
  { id: 14, name: 'الإدارة الدينية - روسيا' },
  { id: 15, name: 'الشيعة - إثنا عشرية (جعفرية)' },
];
