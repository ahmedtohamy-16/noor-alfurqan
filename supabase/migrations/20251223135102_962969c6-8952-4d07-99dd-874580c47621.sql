
-- Create azkar categories table
CREATE TABLE public.azkar_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create azkar table
CREATE TABLE public.azkar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.azkar_categories(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  reference TEXT,
  repeat_count INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user azkar progress table
CREATE TABLE public.user_azkar_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  azkar_id UUID REFERENCES public.azkar(id) ON DELETE CASCADE,
  completed_count INTEGER DEFAULT 0,
  progress_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, azkar_id, progress_date)
);

-- Create countries table for location picker
CREATE TABLE public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE
);

-- Create cities table for location picker
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL
);

-- Add dark_mode column to user_settings
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.azkar_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.azkar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_azkar_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Public read policies for azkar
CREATE POLICY "Anyone can view azkar categories" ON public.azkar_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view azkar" ON public.azkar FOR SELECT USING (true);
CREATE POLICY "Anyone can view countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Anyone can view cities" ON public.cities FOR SELECT USING (true);

-- User azkar progress policies
CREATE POLICY "Users can view their own azkar progress" ON public.user_azkar_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own azkar progress" ON public.user_azkar_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own azkar progress" ON public.user_azkar_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own azkar progress" ON public.user_azkar_progress FOR DELETE USING (auth.uid() = user_id);

-- Insert azkar categories
INSERT INTO public.azkar_categories (name, icon, display_order) VALUES
('أذكار الصباح', 'sunrise', 1),
('أذكار المساء', 'sunset', 2),
('أذكار النوم', 'moon', 3),
('أذكار الاستيقاظ', 'sun', 4),
('أذكار الصلاة', 'mosque', 5),
('أذكار الوضوء', 'droplets', 6),
('أذكار الطعام', 'utensils', 7),
('أذكار المنزل', 'home', 8),
('أذكار السفر', 'car', 9),
('أذكار اللباس', 'shirt', 10),
('أدعية متنوعة', 'book', 11);

-- Insert some azkar for morning
INSERT INTO public.azkar (category_id, text, reference, repeat_count, display_order) VALUES
((SELECT id FROM azkar_categories WHERE name = 'أذكار الصباح'), 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', 'رواه أبو داود', 1, 1),
((SELECT id FROM azkar_categories WHERE name = 'أذكار الصباح'), 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ', 'رواه الترمذي', 1, 2),
((SELECT id FROM azkar_categories WHERE name = 'أذكار الصباح'), 'سُبْحَانَ اللهِ وَبِحَمْدِهِ', 'متفق عليه', 100, 3),
((SELECT id FROM azkar_categories WHERE name = 'أذكار الصباح'), 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير', 'متفق عليه', 10, 4),
((SELECT id FROM azkar_categories WHERE name = 'أذكار الصباح'), 'أستغفر الله وأتوب إليه', 'رواه البخاري', 100, 5);

-- Insert evening azkar
INSERT INTO public.azkar (category_id, text, reference, repeat_count, display_order) VALUES
((SELECT id FROM azkar_categories WHERE name = 'أذكار المساء'), 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ للهِ، وَالْحَمْدُ للهِ، لَا إِلَهَ إِلاَّ اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ', 'رواه أبو داود', 1, 1),
((SELECT id FROM azkar_categories WHERE name = 'أذكار المساء'), 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ', 'رواه الترمذي', 1, 2),
((SELECT id FROM azkar_categories WHERE name = 'أذكار المساء'), 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ', 'رواه أبو داود', 1, 3);

-- Insert sleep azkar
INSERT INTO public.azkar (category_id, text, reference, repeat_count, display_order) VALUES
((SELECT id FROM azkar_categories WHERE name = 'أذكار النوم'), 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', 'متفق عليه', 1, 1),
((SELECT id FROM azkar_categories WHERE name = 'أذكار النوم'), 'سُبْحَانَ اللهِ', 'متفق عليه', 33, 2),
((SELECT id FROM azkar_categories WHERE name = 'أذكار النوم'), 'الْحَمْدُ للهِ', 'متفق عليه', 33, 3),
((SELECT id FROM azkar_categories WHERE name = 'أذكار النوم'), 'اللهُ أَكْبَرُ', 'متفق عليه', 34, 4);

-- Insert prayer azkar
INSERT INTO public.azkar (category_id, text, reference, repeat_count, display_order) VALUES
((SELECT id FROM azkar_categories WHERE name = 'أذكار الصلاة'), 'أَسْتَغْفِرُ اللهَ (ثلاثاً) اللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ', 'رواه مسلم', 1, 1),
((SELECT id FROM azkar_categories WHERE name = 'أذكار الصلاة'), 'سُبْحَانَ اللهِ', 'متفق عليه', 33, 2),
((SELECT id FROM azkar_categories WHERE name = 'أذكار الصلاة'), 'الْحَمْدُ للهِ', 'متفق عليه', 33, 3),
((SELECT id FROM azkar_categories WHERE name = 'أذكار الصلاة'), 'اللهُ أَكْبَرُ', 'متفق عليه', 33, 4);

-- Insert some countries and cities
INSERT INTO public.countries (name_ar, name_en, code) VALUES
('المملكة العربية السعودية', 'Saudi Arabia', 'SA'),
('مصر', 'Egypt', 'EG'),
('الإمارات العربية المتحدة', 'United Arab Emirates', 'AE'),
('الكويت', 'Kuwait', 'KW'),
('قطر', 'Qatar', 'QA'),
('الأردن', 'Jordan', 'JO'),
('لبنان', 'Lebanon', 'LB'),
('العراق', 'Iraq', 'IQ'),
('سوريا', 'Syria', 'SY'),
('المغرب', 'Morocco', 'MA'),
('الجزائر', 'Algeria', 'DZ'),
('تونس', 'Tunisia', 'TN'),
('السودان', 'Sudan', 'SD'),
('اليمن', 'Yemen', 'YE'),
('ليبيا', 'Libya', 'LY'),
('عمان', 'Oman', 'OM'),
('البحرين', 'Bahrain', 'BH'),
('فلسطين', 'Palestine', 'PS'),
('تركيا', 'Turkey', 'TR'),
('باكستان', 'Pakistan', 'PK');

-- Insert cities for Saudi Arabia
INSERT INTO public.cities (country_id, name_ar, name_en, latitude, longitude) VALUES
((SELECT id FROM countries WHERE code = 'SA'), 'مكة المكرمة', 'Makkah', 21.4225, 39.8262),
((SELECT id FROM countries WHERE code = 'SA'), 'المدينة المنورة', 'Madinah', 24.5247, 39.5692),
((SELECT id FROM countries WHERE code = 'SA'), 'الرياض', 'Riyadh', 24.7136, 46.6753),
((SELECT id FROM countries WHERE code = 'SA'), 'جدة', 'Jeddah', 21.5433, 39.1728),
((SELECT id FROM countries WHERE code = 'SA'), 'الدمام', 'Dammam', 26.4207, 50.0888),
((SELECT id FROM countries WHERE code = 'SA'), 'الخبر', 'Khobar', 26.2172, 50.1971),
((SELECT id FROM countries WHERE code = 'SA'), 'تبوك', 'Tabuk', 28.3838, 36.5550),
((SELECT id FROM countries WHERE code = 'SA'), 'أبها', 'Abha', 18.2164, 42.5053);

-- Insert cities for Egypt
INSERT INTO public.cities (country_id, name_ar, name_en, latitude, longitude) VALUES
((SELECT id FROM countries WHERE code = 'EG'), 'القاهرة', 'Cairo', 30.0444, 31.2357),
((SELECT id FROM countries WHERE code = 'EG'), 'الإسكندرية', 'Alexandria', 31.2001, 29.9187),
((SELECT id FROM countries WHERE code = 'EG'), 'الجيزة', 'Giza', 30.0131, 31.2089),
((SELECT id FROM countries WHERE code = 'EG'), 'أسوان', 'Aswan', 24.0889, 32.8998),
((SELECT id FROM countries WHERE code = 'EG'), 'الأقصر', 'Luxor', 25.6872, 32.6396);

-- Insert cities for UAE
INSERT INTO public.cities (country_id, name_ar, name_en, latitude, longitude) VALUES
((SELECT id FROM countries WHERE code = 'AE'), 'دبي', 'Dubai', 25.2048, 55.2708),
((SELECT id FROM countries WHERE code = 'AE'), 'أبوظبي', 'Abu Dhabi', 24.4539, 54.3773),
((SELECT id FROM countries WHERE code = 'AE'), 'الشارقة', 'Sharjah', 25.3573, 55.4033);

-- Insert cities for other countries
INSERT INTO public.cities (country_id, name_ar, name_en, latitude, longitude) VALUES
((SELECT id FROM countries WHERE code = 'KW'), 'الكويت', 'Kuwait City', 29.3759, 47.9774),
((SELECT id FROM countries WHERE code = 'QA'), 'الدوحة', 'Doha', 25.2854, 51.5310),
((SELECT id FROM countries WHERE code = 'JO'), 'عمّان', 'Amman', 31.9454, 35.9284),
((SELECT id FROM countries WHERE code = 'LB'), 'بيروت', 'Beirut', 33.8938, 35.5018),
((SELECT id FROM countries WHERE code = 'IQ'), 'بغداد', 'Baghdad', 33.3152, 44.3661),
((SELECT id FROM countries WHERE code = 'SY'), 'دمشق', 'Damascus', 33.5138, 36.2765),
((SELECT id FROM countries WHERE code = 'MA'), 'الرباط', 'Rabat', 34.0209, -6.8416),
((SELECT id FROM countries WHERE code = 'DZ'), 'الجزائر', 'Algiers', 36.7538, 3.0588),
((SELECT id FROM countries WHERE code = 'TN'), 'تونس', 'Tunis', 36.8065, 10.1815),
((SELECT id FROM countries WHERE code = 'TR'), 'إسطنبول', 'Istanbul', 41.0082, 28.9784);
