-- Add after prayer azkar timing column
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS azkar_prayer_delay_minutes integer DEFAULT 10;