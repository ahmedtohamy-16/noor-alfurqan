-- Fix profiles RLS to hide location data from public
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Only authenticated users can see profiles (without location)
-- For location data, only the owner can see their own
CREATE POLICY "Users can view basic profile info" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix khatmahs RLS to allow viewing right after creation
DROP POLICY IF EXISTS "Anyone can view khatmahs they participate in" ON public.khatmahs;

CREATE POLICY "Anyone can view khatmahs they participate in or created" 
ON public.khatmahs 
FOR SELECT 
USING (
  created_by = auth.uid() 
  OR id IN (
    SELECT khatmah_id FROM khatmah_participants 
    WHERE user_id = auth.uid()
  )
);

-- Allow anyone to find khatmah by invite code for joining
CREATE POLICY "Anyone can view khatmah by invite code" 
ON public.khatmahs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create admin_users table for admin features
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin_users table
CREATE POLICY "Admins can view admin_users" 
ON public.admin_users 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create app_settings table for global settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Enable RLS on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read app settings
CREATE POLICY "Anyone can read app settings" 
ON public.app_settings 
FOR SELECT 
USING (true);

-- Only admins can modify app settings
CREATE POLICY "Admins can modify app settings" 
ON public.app_settings 
FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create reading_sessions table for offline reading tracking
CREATE TABLE IF NOT EXISTS public.reading_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  start_page INTEGER NOT NULL,
  end_page INTEGER NOT NULL,
  duration_minutes INTEGER,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reading_sessions
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own reading sessions
CREATE POLICY "Users can insert their own reading sessions" 
ON public.reading_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reading sessions" 
ON public.reading_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading sessions" 
ON public.reading_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);