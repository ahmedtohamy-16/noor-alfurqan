-- Add columns for granular notification settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS adhan_sound TEXT DEFAULT 'makkah',
ADD COLUMN IF NOT EXISTS prayer_fajr_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS prayer_dhuhr_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS prayer_asr_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS prayer_maghrib_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS prayer_isha_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS azkar_morning_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS azkar_morning_time TIME DEFAULT '06:00:00',
ADD COLUMN IF NOT EXISTS azkar_evening_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS azkar_evening_time TIME DEFAULT '17:00:00',
ADD COLUMN IF NOT EXISTS azkar_sleep_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS azkar_sleep_time TIME DEFAULT '22:00:00',
ADD COLUMN IF NOT EXISTS azkar_wakeup_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS azkar_wakeup_time TIME DEFAULT '05:00:00',
ADD COLUMN IF NOT EXISTS azkar_prayer_enabled BOOLEAN DEFAULT false;