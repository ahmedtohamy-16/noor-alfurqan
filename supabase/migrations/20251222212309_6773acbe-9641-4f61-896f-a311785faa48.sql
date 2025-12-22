
-- جدول إعدادات المستخدم (الموقع، الإشعارات، إلخ)
CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city_name TEXT,
    notifications_enabled BOOLEAN DEFAULT false,
    daily_wird_enabled BOOLEAN DEFAULT false,
    daily_wird_time TIME DEFAULT '06:00:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_settings FOR UPDATE
USING (auth.uid() = user_id);

-- جدول حفظ آخر موضع قراءة
CREATE TABLE public.reading_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    surah_number INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    surah_name TEXT NOT NULL,
    progress_percentage DECIMAL(5, 2) DEFAULT 0,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, surah_number)
);

ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reading progress"
ON public.reading_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading progress"
ON public.reading_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading progress"
ON public.reading_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading progress"
ON public.reading_progress FOR DELETE
USING (auth.uid() = user_id);

-- جدول الورد اليومي
CREATE TABLE public.daily_wird (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    target_pages INTEGER DEFAULT 2,
    completed_pages INTEGER DEFAULT 0,
    target_date DATE DEFAULT CURRENT_DATE,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, target_date)
);

ALTER TABLE public.daily_wird ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily wird"
ON public.daily_wird FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily wird"
ON public.daily_wird FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily wird"
ON public.daily_wird FOR UPDATE
USING (auth.uid() = user_id);

-- تحديث جدول profiles لإضافة الموقع
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city_name TEXT;
