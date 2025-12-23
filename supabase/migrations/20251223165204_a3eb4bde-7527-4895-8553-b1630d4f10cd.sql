-- Add calculation method to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS prayer_method integer DEFAULT 4;

-- Add comment explaining the method values
COMMENT ON COLUMN public.user_settings.prayer_method IS 'Prayer calculation method: 1=Egyptian, 2=ISNA, 3=MWL, 4=Umm Al-Qura, 5=Dubai, etc.';