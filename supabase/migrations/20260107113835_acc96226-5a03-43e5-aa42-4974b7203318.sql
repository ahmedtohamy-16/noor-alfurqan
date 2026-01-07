-- Fix otp_codes policy to only allow service role access, not anonymous
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON public.otp_codes;

-- Only service role can access OTPs (used by Edge Functions with service role key)
-- The "FOR ALL" with role restriction ensures only service role can CRUD
CREATE POLICY "Only service role can manage OTP codes"
ON public.otp_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Explicitly deny all access for anon and authenticated roles
-- RLS is enabled, so with no matching policy, access is denied by default