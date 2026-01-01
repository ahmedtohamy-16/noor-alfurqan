export interface AdhanSound {
  id: string;
  name: string;
  nameAr: string;
  url: string;
  fajrUrl?: string;
}

export const adhanSounds: AdhanSound[] = [
  {
    id: "makkah",
    name: "Makkah",
    nameAr: "الحرم المكي",
    url: "https://www.islamcan.com/audio/adhan/azan1.mp3",
    fajrUrl: "https://www.islamcan.com/audio/adhan/azan-fajr1.mp3"
  },
  {
    id: "madinah",
    name: "Madinah",
    nameAr: "الحرم المدني",
    url: "https://www.islamcan.com/audio/adhan/azan2.mp3"
  },
  {
    id: "mishary",
    name: "Mishary Alafasy",
    nameAr: "مشاري العفاسي",
    url: "https://www.islamcan.com/audio/adhan/azan3.mp3"
  },
  {
    id: "abdul-basit",
    name: "Abdul Basit",
    nameAr: "عبد الباسط عبد الصمد",
    url: "https://www.islamcan.com/audio/adhan/azan4.mp3"
  },
  {
    id: "egypt",
    name: "Egypt",
    nameAr: "مصر",
    url: "https://www.islamcan.com/audio/adhan/azan5.mp3"
  }
];

export const getAdhanSound = (id: string): AdhanSound => {
  return adhanSounds.find(s => s.id === id) || adhanSounds[0];
};
