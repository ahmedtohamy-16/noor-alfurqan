-- Fix 1: Restrict profiles table - users can only see their own profile (admins can see all)
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id OR has_role(auth.uid(), 'admin'));

-- Fix 2: Create audio generation log table for rate limiting
CREATE TABLE IF NOT EXISTS public.audio_generation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prophet_id text,
  text_length integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audio_generation_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view own audio logs"
ON public.audio_generation_log
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can insert logs (edge functions use service role)
CREATE POLICY "Service can insert audio logs"
ON public.audio_generation_log
FOR INSERT
WITH CHECK (true);

-- Create index for efficient rate limit queries
CREATE INDEX idx_audio_log_user_created ON public.audio_generation_log(user_id, created_at DESC);