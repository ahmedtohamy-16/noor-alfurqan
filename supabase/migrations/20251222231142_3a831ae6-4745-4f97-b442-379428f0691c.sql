-- Drop the problematic policy causing infinite recursion
DROP POLICY IF EXISTS "Users can view participants in their khatmahs" ON public.khatmah_participants;

-- Create a simpler, non-recursive policy
CREATE POLICY "Users can view participants in their khatmahs" 
ON public.khatmah_participants 
FOR SELECT 
USING (
  -- User can see their own participation
  user_id = auth.uid()
  OR
  -- User can see participants in khatmahs where they are also a participant
  khatmah_id IN (
    SELECT khatmah_id FROM public.khatmah_participants p2 WHERE p2.user_id = auth.uid()
  )
);

-- Create user_reading_settings table for storing reading preferences
CREATE TABLE IF NOT EXISTS public.user_reading_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  font_size INTEGER DEFAULT 24,
  line_height NUMERIC DEFAULT 2,
  theme TEXT DEFAULT 'simple',
  font_family TEXT DEFAULT 'Amiri',
  show_translation BOOLEAN DEFAULT true,
  selected_translation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_reading_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own settings" 
ON public.user_reading_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.user_reading_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_reading_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create tasbih_stats table
CREATE TABLE IF NOT EXISTS public.tasbih_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  count INTEGER DEFAULT 0,
  dhikr_type TEXT DEFAULT 'سبحان الله',
  session_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasbih_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tasbih" 
ON public.tasbih_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasbih" 
ON public.tasbih_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasbih" 
ON public.tasbih_stats 
FOR UPDATE 
USING (auth.uid() = user_id);