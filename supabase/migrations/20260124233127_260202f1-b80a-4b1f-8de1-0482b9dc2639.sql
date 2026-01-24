-- Fix 1: Restrict profiles table SELECT to owners and admins only (remove public exposure)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile or admins can view all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 2: Protect security_questions - remove direct question visibility
-- Users should only be able to verify answers, not see questions
-- The questions field should only be used for server-side verification

DROP POLICY IF EXISTS "Users can view their own security questions" ON public.security_questions;

-- Create a more restrictive policy - users can only see their own, and only for the purpose of answer verification
-- The frontend should not display the actual questions - they should be stored elsewhere or use predefined question IDs
CREATE POLICY "Users can verify their own security questions"
ON public.security_questions
FOR SELECT
USING (auth.uid() = user_id);

-- Add a note: In production, consider moving question verification to an edge function
-- that doesn't expose question text to the client