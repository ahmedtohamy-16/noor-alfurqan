// Prophet location data with coordinates for map display
export interface ProphetLocation {
  id: string;
  name: { ar: string; en: string };
  coordinates: { lat: number; lng: number };
  description: { ar: string; en: string };
}

export interface ProphetLocationData {
  prophetId: string;
  image: string;
  mainLocation: { lat: number; lng: number };
  locations: ProphetLocation[];
}

export const prophetLocationsData: ProphetLocationData[] = [
  {
    prophetId: 'adam',
    image: 'adam',
    mainLocation: { lat: 21.4225, lng: 39.8262 },
    locations: [
      { id: 'jannah', name: { ar: 'الجنة', en: 'Paradise' }, coordinates: { lat: 21.4225, lng: 39.8262 }, description: { ar: 'مكان خلق آدم وحواء', en: 'Place of Adam and Eve creation' } },
      { id: 'mecca', name: { ar: 'مكة المكرمة', en: 'Mecca' }, coordinates: { lat: 21.4225, lng: 39.8262 }, description: { ar: 'هبوط آدم إلى الأرض', en: 'Adam descent to Earth' } },
    ],
  },
  {
    prophetId: 'idris',
    image: 'idris',
    mainLocation: { lat: 30.0444, lng: 31.2357 },
    locations: [
      { id: 'babylon', name: { ar: 'بابل', en: 'Babylon' }, coordinates: { lat: 32.5364, lng: 44.4209 }, description: { ar: 'مكان دعوة إدريس', en: 'Place of Idris preaching' } },
    ],
  },
  {
    prophetId: 'nuh',
    image: 'nuh',
    mainLocation: { lat: 39.4407, lng: 44.2990 },
    locations: [
      { id: 'judi', name: { ar: 'جبل الجودي', en: 'Mount Judi' }, coordinates: { lat: 37.3833, lng: 42.4500 }, description: { ar: 'مكان رسو السفينة', en: 'Where the Ark came to rest' } },
      { id: 'mesopotamia', name: { ar: 'بلاد الرافدين', en: 'Mesopotamia' }, coordinates: { lat: 33.3152, lng: 44.3661 }, description: { ar: 'مكان بناء السفينة', en: 'Where the Ark was built' } },
    ],
  },
  {
    prophetId: 'hud',
    image: 'hud',
    mainLocation: { lat: 16.9300, lng: 52.8600 },
    locations: [
      { id: 'ahqaf', name: { ar: 'الأحقاف', en: 'Al-Ahqaf' }, coordinates: { lat: 16.9300, lng: 52.8600 }, description: { ar: 'ديار قوم عاد', en: 'Land of Aad people' } },
      { id: 'iram', name: { ar: 'إرم ذات العماد', en: 'Iram of the Pillars' }, coordinates: { lat: 18.2500, lng: 54.0000 }, description: { ar: 'المدينة العظيمة', en: 'The great city' } },
    ],
  },
  {
    prophetId: 'saleh',
    image: 'saleh',
    mainLocation: { lat: 26.7686, lng: 37.9540 },
    locations: [
      { id: 'madain_saleh', name: { ar: 'مدائن صالح', en: 'Mada\'in Saleh' }, coordinates: { lat: 26.7686, lng: 37.9540 }, description: { ar: 'ديار قوم ثمود', en: 'Land of Thamud people' } },
      { id: 'hijr', name: { ar: 'الحِجر', en: 'Al-Hijr' }, coordinates: { lat: 26.8000, lng: 37.9500 }, description: { ar: 'البيوت المنحوتة في الصخر', en: 'Rock-carved houses' } },
    ],
  },
  {
    prophetId: 'ibrahim',
    image: 'ibrahim',
    mainLocation: { lat: 30.9625, lng: 46.1053 },
    locations: [
      { id: 'ur', name: { ar: 'أور', en: 'Ur' }, coordinates: { lat: 30.9625, lng: 46.1053 }, description: { ar: 'مسقط رأس إبراهيم', en: 'Birthplace of Ibrahim' } },
      { id: 'hebron', name: { ar: 'الخليل', en: 'Hebron' }, coordinates: { lat: 31.5326, lng: 35.0998 }, description: { ar: 'مكان دفن إبراهيم', en: 'Ibrahim burial place' } },
      { id: 'mecca_ibrahim', name: { ar: 'مكة المكرمة', en: 'Mecca' }, coordinates: { lat: 21.4225, lng: 39.8262 }, description: { ar: 'بناء الكعبة المشرفة', en: 'Building the Kaaba' } },
    ],
  },
  {
    prophetId: 'ismail',
    image: 'ismail',
    mainLocation: { lat: 21.4225, lng: 39.8262 },
    locations: [
      { id: 'mecca_ismail', name: { ar: 'مكة المكرمة', en: 'Mecca' }, coordinates: { lat: 21.4225, lng: 39.8262 }, description: { ar: 'بئر زمزم والكعبة', en: 'Zamzam well and Kaaba' } },
    ],
  },
  {
    prophetId: 'ishaq',
    image: 'ishaq',
    mainLocation: { lat: 31.5326, lng: 35.0998 },
    locations: [
      { id: 'canaan', name: { ar: 'كنعان', en: 'Canaan' }, coordinates: { lat: 31.7683, lng: 35.2137 }, description: { ar: 'أرض فلسطين', en: 'Land of Palestine' } },
      { id: 'hebron_ishaq', name: { ar: 'الخليل', en: 'Hebron' }, coordinates: { lat: 31.5326, lng: 35.0998 }, description: { ar: 'مكان الدفن', en: 'Burial place' } },
    ],
  },
  {
    prophetId: 'yaqub',
    image: 'yaqub',
    mainLocation: { lat: 31.7683, lng: 35.2137 },
    locations: [
      { id: 'canaan_yaqub', name: { ar: 'كنعان', en: 'Canaan' }, coordinates: { lat: 31.7683, lng: 35.2137 }, description: { ar: 'أرض الآباء', en: 'Land of the Patriarchs' } },
      { id: 'haran', name: { ar: 'حران', en: 'Haran' }, coordinates: { lat: 36.8650, lng: 39.0300 }, description: { ar: 'مكان الإقامة', en: 'Place of residence' } },
    ],
  },
  {
    prophetId: 'yusuf',
    image: 'yusuf',
    mainLocation: { lat: 30.0444, lng: 31.2357 },
    locations: [
      { id: 'egypt', name: { ar: 'مصر', en: 'Egypt' }, coordinates: { lat: 30.0444, lng: 31.2357 }, description: { ar: 'عزيز مصر', en: 'Governor of Egypt' } },
      { id: 'well', name: { ar: 'البئر', en: 'The Well' }, coordinates: { lat: 32.0, lng: 35.3 }, description: { ar: 'حيث ألقاه إخوته', en: 'Where his brothers threw him' } },
    ],
  },
  {
    prophetId: 'ayyub',
    image: 'ayyub',
    mainLocation: { lat: 32.3, lng: 36.1 },
    locations: [
      { id: 'hauran', name: { ar: 'حوران', en: 'Hauran' }, coordinates: { lat: 32.6, lng: 36.5 }, description: { ar: 'أرض أيوب', en: 'Land of Ayyub' } },
    ],
  },
  {
    prophetId: 'shuayb',
    image: 'shuayb',
    mainLocation: { lat: 28.5667, lng: 34.7500 },
    locations: [
      { id: 'midian', name: { ar: 'مدين', en: 'Midian' }, coordinates: { lat: 28.5667, lng: 34.7500 }, description: { ar: 'ديار قوم شعيب', en: 'Land of Shuayb people' } },
    ],
  },
  {
    prophetId: 'musa',
    image: 'musa',
    mainLocation: { lat: 28.5393, lng: 33.9756 },
    locations: [
      { id: 'sinai', name: { ar: 'جبل الطور', en: 'Mount Sinai' }, coordinates: { lat: 28.5393, lng: 33.9756 }, description: { ar: 'مكان تكليم الله لموسى', en: 'Where Allah spoke to Musa' } },
      { id: 'egypt_musa', name: { ar: 'مصر', en: 'Egypt' }, coordinates: { lat: 30.0444, lng: 31.2357 }, description: { ar: 'مواجهة فرعون', en: 'Confrontation with Pharaoh' } },
      { id: 'red_sea', name: { ar: 'البحر الأحمر', en: 'Red Sea' }, coordinates: { lat: 29.5, lng: 32.5 }, description: { ar: 'انشقاق البحر', en: 'Parting of the sea' } },
    ],
  },
  {
    prophetId: 'harun',
    image: 'harun',
    mainLocation: { lat: 30.3268, lng: 35.4416 },
    locations: [
      { id: 'petra', name: { ar: 'جبل هارون', en: 'Mount Aaron' }, coordinates: { lat: 30.3268, lng: 35.4416 }, description: { ar: 'مكان وفاة هارون', en: 'Place of Harun death' } },
    ],
  },
  {
    prophetId: 'dhulkifl',
    image: 'dhulkifl',
    mainLocation: { lat: 32.0, lng: 44.5 },
    locations: [
      { id: 'babylon_dhulkifl', name: { ar: 'بابل', en: 'Babylon' }, coordinates: { lat: 32.5364, lng: 44.4209 }, description: { ar: 'مكان الدعوة', en: 'Place of preaching' } },
    ],
  },
  {
    prophetId: 'dawud',
    image: 'dawud',
    mainLocation: { lat: 31.7683, lng: 35.2137 },
    locations: [
      { id: 'jerusalem_dawud', name: { ar: 'القدس', en: 'Jerusalem' }, coordinates: { lat: 31.7683, lng: 35.2137 }, description: { ar: 'عاصمة مملكة داود', en: 'Capital of David kingdom' } },
    ],
  },
  {
    prophetId: 'sulayman',
    image: 'sulayman',
    mainLocation: { lat: 31.7767, lng: 35.2345 },
    locations: [
      { id: 'temple', name: { ar: 'الهيكل', en: 'The Temple' }, coordinates: { lat: 31.7767, lng: 35.2345 }, description: { ar: 'بناء الهيكل', en: 'Building the Temple' } },
      { id: 'tadmur', name: { ar: 'تدمر', en: 'Palmyra' }, coordinates: { lat: 34.5555, lng: 38.2688 }, description: { ar: 'من مملكة سليمان', en: 'Part of Solomon kingdom' } },
    ],
  },
  {
    prophetId: 'ilyas',
    image: 'ilyas',
    mainLocation: { lat: 33.8, lng: 35.8 },
    locations: [
      { id: 'baalbek', name: { ar: 'بعلبك', en: 'Baalbek' }, coordinates: { lat: 34.0067, lng: 36.2039 }, description: { ar: 'مكان دعوة إلياس', en: 'Place of Ilyas preaching' } },
    ],
  },
  {
    prophetId: 'alyasa',
    image: 'alyasa',
    mainLocation: { lat: 32.5, lng: 35.5 },
    locations: [
      { id: 'jordan_valley', name: { ar: 'وادي الأردن', en: 'Jordan Valley' }, coordinates: { lat: 32.0, lng: 35.5 }, description: { ar: 'مكان الدعوة', en: 'Place of preaching' } },
    ],
  },
  {
    prophetId: 'yunus',
    image: 'yunus',
    mainLocation: { lat: 36.3500, lng: 43.1500 },
    locations: [
      { id: 'nineveh', name: { ar: 'نينوى', en: 'Nineveh' }, coordinates: { lat: 36.3500, lng: 43.1500 }, description: { ar: 'مدينة يونس', en: 'City of Yunus' } },
    ],
  },
  {
    prophetId: 'zakariya',
    image: 'zakariya',
    mainLocation: { lat: 31.7767, lng: 35.2345 },
    locations: [
      { id: 'aqsa', name: { ar: 'المسجد الأقصى', en: 'Al-Aqsa Mosque' }, coordinates: { lat: 31.7767, lng: 35.2345 }, description: { ar: 'مكان العبادة', en: 'Place of worship' } },
    ],
  },
  {
    prophetId: 'yahya',
    image: 'yahya',
    mainLocation: { lat: 32.0, lng: 35.5 },
    locations: [
      { id: 'jordan_river', name: { ar: 'نهر الأردن', en: 'Jordan River' }, coordinates: { lat: 31.7597, lng: 35.5508 }, description: { ar: 'مكان يحيى', en: 'Place of Yahya' } },
    ],
  },
  {
    prophetId: 'isa',
    image: 'isa',
    mainLocation: { lat: 31.7049, lng: 35.2078 },
    locations: [
      { id: 'bethlehem', name: { ar: 'بيت لحم', en: 'Bethlehem' }, coordinates: { lat: 31.7049, lng: 35.2078 }, description: { ar: 'مكان ولادة عيسى', en: 'Birthplace of Isa' } },
      { id: 'nazareth', name: { ar: 'الناصرة', en: 'Nazareth' }, coordinates: { lat: 32.7019, lng: 35.2979 }, description: { ar: 'مكان نشأة عيسى', en: 'Where Isa grew up' } },
      { id: 'jerusalem_isa', name: { ar: 'القدس', en: 'Jerusalem' }, coordinates: { lat: 31.7683, lng: 35.2137 }, description: { ar: 'رفع عيسى إلى السماء', en: 'Isa ascension to heaven' } },
    ],
  },
  {
    prophetId: 'muhammad',
    image: 'muhammad',
    mainLocation: { lat: 21.4225, lng: 39.8262 },
    locations: [
      { id: 'mecca_muhammad', name: { ar: 'مكة المكرمة', en: 'Mecca' }, coordinates: { lat: 21.4225, lng: 39.8262 }, description: { ar: 'مكان الولادة ونزول الوحي', en: 'Birthplace and revelation' } },
      { id: 'hira', name: { ar: 'غار حراء', en: 'Cave of Hira' }, coordinates: { lat: 21.4578, lng: 39.8581 }, description: { ar: 'مكان نزول الوحي الأول', en: 'First revelation' } },
      { id: 'medina', name: { ar: 'المدينة المنورة', en: 'Medina' }, coordinates: { lat: 24.4672, lng: 39.6151 }, description: { ar: 'مكان الهجرة والدفن', en: 'Migration and burial' } },
    ],
  },
  {
    prophetId: 'lut',
    image: 'lut',
    mainLocation: { lat: 31.0, lng: 35.4 },
    locations: [
      { id: 'sodom', name: { ar: 'سدوم', en: 'Sodom' }, coordinates: { lat: 31.0833, lng: 35.4167 }, description: { ar: 'قرى قوم لوط', en: 'Villages of Lut people' } },
      { id: 'dead_sea', name: { ar: 'البحر الميت', en: 'Dead Sea' }, coordinates: { lat: 31.5, lng: 35.5 }, description: { ar: 'مكان العذاب', en: 'Place of punishment' } },
    ],
  },
];

// Map prophet ID to image import path
export const prophetImages: Record<string, string> = {
  adam: '/src/assets/prophets/adam.jpg',
  idris: '/src/assets/prophets/idris.jpg',
  nuh: '/src/assets/prophets/nuh.jpg',
  hud: '/src/assets/prophets/hud.jpg',
  saleh: '/src/assets/prophets/saleh.jpg',
  ibrahim: '/src/assets/prophets/ibrahim.jpg',
  ismail: '/src/assets/prophets/ismail.jpg',
  ishaq: '/src/assets/prophets/ishaq.jpg',
  yaqub: '/src/assets/prophets/yaqub.jpg',
  yusuf: '/src/assets/prophets/yusuf.jpg',
  ayyub: '/src/assets/prophets/ayyub.jpg',
  shuayb: '/src/assets/prophets/shuayb.jpg',
  musa: '/src/assets/prophets/musa.jpg',
  harun: '/src/assets/prophets/harun.jpg',
  dhulkifl: '/src/assets/prophets/dhulkifl.jpg',
  dawud: '/src/assets/prophets/dawud.jpg',
  sulayman: '/src/assets/prophets/sulayman.jpg',
  ilyas: '/src/assets/prophets/ilyas.jpg',
  alyasa: '/src/assets/prophets/alyasa.jpg',
  yunus: '/src/assets/prophets/yunus.jpg',
  zakariya: '/src/assets/prophets/zakariya.jpg',
  yahya: '/src/assets/prophets/yahya.jpg',
  isa: '/src/assets/prophets/isa.jpg',
  muhammad: '/src/assets/prophets/muhammad.jpg',
  lut: '/src/assets/prophets/lut.jpg',
};
