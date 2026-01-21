// DST (Daylight Saving Time) utilities for automatic and manual DST handling

// Countries and their DST rules
export interface DSTRule {
  countryCode: string;
  hasDST: boolean;
  dstStart?: { month: number; weekOfMonth: number; dayOfWeek: number }; // e.g., last Sunday of March
  dstEnd?: { month: number; weekOfMonth: number; dayOfWeek: number };   // e.g., last Sunday of October
  offsetMinutes?: number; // How many minutes to add during DST (usually 60)
}

// DST rules for countries (based on common patterns)
export const dstRules: DSTRule[] = [
  // Countries with NO DST (most Arab countries)
  { countryCode: 'SA', hasDST: false },
  { countryCode: 'AE', hasDST: false },
  { countryCode: 'KW', hasDST: false },
  { countryCode: 'QA', hasDST: false },
  { countryCode: 'BH', hasDST: false },
  { countryCode: 'OM', hasDST: false },
  { countryCode: 'YE', hasDST: false },
  { countryCode: 'IQ', hasDST: false },
  { countryCode: 'SD', hasDST: false },
  { countryCode: 'LY', hasDST: false },
  { countryCode: 'DZ', hasDST: false },
  { countryCode: 'TN', hasDST: false },
  { countryCode: 'PK', hasDST: false },
  
  // Countries WITH DST
  { 
    countryCode: 'EG', 
    hasDST: true, 
    dstStart: { month: 4, weekOfMonth: -1, dayOfWeek: 5 }, // Last Friday of April
    dstEnd: { month: 10, weekOfMonth: -1, dayOfWeek: 5 },   // Last Friday of October
    offsetMinutes: 60 
  },
  { 
    countryCode: 'JO', 
    hasDST: true, 
    dstStart: { month: 3, weekOfMonth: -1, dayOfWeek: 5 }, // Last Friday of March
    dstEnd: { month: 10, weekOfMonth: -1, dayOfWeek: 5 },   // Last Friday of October
    offsetMinutes: 60 
  },
  { 
    countryCode: 'LB', 
    hasDST: true, 
    dstStart: { month: 3, weekOfMonth: -1, dayOfWeek: 0 }, // Last Sunday of March
    dstEnd: { month: 10, weekOfMonth: -1, dayOfWeek: 0 },   // Last Sunday of October
    offsetMinutes: 60 
  },
  { 
    countryCode: 'SY', 
    hasDST: true, 
    dstStart: { month: 3, weekOfMonth: -1, dayOfWeek: 5 }, // Last Friday of March
    dstEnd: { month: 10, weekOfMonth: -1, dayOfWeek: 5 },   // Last Friday of October
    offsetMinutes: 60 
  },
  { 
    countryCode: 'PS', 
    hasDST: true, 
    dstStart: { month: 3, weekOfMonth: -1, dayOfWeek: 0 }, // Last Sunday of March
    dstEnd: { month: 10, weekOfMonth: -1, dayOfWeek: 0 },   // Last Sunday of October
    offsetMinutes: 60 
  },
  { 
    countryCode: 'MA', 
    hasDST: true, 
    dstStart: { month: 3, weekOfMonth: -1, dayOfWeek: 0 }, // Last Sunday of March
    dstEnd: { month: 10, weekOfMonth: -1, dayOfWeek: 0 },   // Last Sunday of October
    offsetMinutes: 60 
  },
  { 
    countryCode: 'TR', 
    hasDST: false // Turkey no longer observes DST since 2016
  },
];

// Get the nth occurrence of a day of week in a month
// weekOfMonth: positive for counting from start, negative for counting from end (-1 = last)
function getNthDayOfWeekInMonth(year: number, month: number, dayOfWeek: number, weekOfMonth: number): Date {
  if (weekOfMonth > 0) {
    const firstDay = new Date(year, month - 1, 1);
    const diff = (dayOfWeek - firstDay.getDay() + 7) % 7;
    return new Date(year, month - 1, 1 + diff + (weekOfMonth - 1) * 7);
  } else {
    // Last occurrence
    const lastDay = new Date(year, month, 0);
    const diff = (lastDay.getDay() - dayOfWeek + 7) % 7;
    return new Date(year, month - 1, lastDay.getDate() - diff + (weekOfMonth + 1) * 7);
  }
}

// Check if a given date is within DST period for a country
export function isInDSTForCountry(countryCode: string, date: Date = new Date()): boolean {
  const rule = dstRules.find(r => r.countryCode === countryCode);
  
  if (!rule || !rule.hasDST || !rule.dstStart || !rule.dstEnd) {
    return false;
  }
  
  const year = date.getFullYear();
  const dstStartDate = getNthDayOfWeekInMonth(
    year, 
    rule.dstStart.month, 
    rule.dstStart.dayOfWeek, 
    rule.dstStart.weekOfMonth
  );
  const dstEndDate = getNthDayOfWeekInMonth(
    year, 
    rule.dstEnd.month, 
    rule.dstEnd.dayOfWeek, 
    rule.dstEnd.weekOfMonth
  );
  
  return date >= dstStartDate && date < dstEndDate;
}

// Get DST offset in minutes for a country
export function getDSTOffset(countryCode: string, date: Date = new Date()): number {
  const rule = dstRules.find(r => r.countryCode === countryCode);
  
  if (!rule || !rule.hasDST) {
    return 0;
  }
  
  if (isInDSTForCountry(countryCode, date)) {
    return rule.offsetMinutes || 60;
  }
  
  return 0;
}

// Check if a country has DST
export function countryHasDST(countryCode: string): boolean {
  const rule = dstRules.find(r => r.countryCode === countryCode);
  return rule?.hasDST || false;
}

// Apply DST offset to a time string (e.g., "05:30" -> "06:30")
export function applyDSTToTime(timeString: string, offsetMinutes: number): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + offsetMinutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

// Detect country from timezone
export function detectCountryFromTimezone(timezone: string): string | null {
  const timezoneToCountry: Record<string, string> = {
    'Africa/Cairo': 'EG',
    'Asia/Riyadh': 'SA',
    'Asia/Dubai': 'AE',
    'Asia/Kuwait': 'KW',
    'Asia/Qatar': 'QA',
    'Asia/Bahrain': 'BH',
    'Asia/Muscat': 'OM',
    'Asia/Aden': 'YE',
    'Asia/Baghdad': 'IQ',
    'Africa/Khartoum': 'SD',
    'Africa/Tripoli': 'LY',
    'Africa/Algiers': 'DZ',
    'Africa/Tunis': 'TN',
    'Asia/Karachi': 'PK',
    'Asia/Amman': 'JO',
    'Asia/Beirut': 'LB',
    'Asia/Damascus': 'SY',
    'Asia/Gaza': 'PS',
    'Asia/Hebron': 'PS',
    'Africa/Casablanca': 'MA',
    'Europe/Istanbul': 'TR',
  };
  
  return timezoneToCountry[timezone] || null;
}

// Get DST status text in Arabic
export function getDSTStatusText(countryCode: string): string {
  const rule = dstRules.find(r => r.countryCode === countryCode);
  
  if (!rule || !rule.hasDST) {
    return 'لا يُطبق التوقيت الصيفي';
  }
  
  if (isInDSTForCountry(countryCode)) {
    return 'التوقيت الصيفي مُفعّل';
  }
  
  return 'التوقيت الشتوي (الأساسي)';
}
