CREATE OR REPLACE FUNCTION public.list_public_profiles()
RETURNS TABLE (id uuid, username text, display_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.username, p.display_name FROM public.profiles p
$$;
REVOKE ALL ON FUNCTION public.list_public_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_public_profiles() TO anon, authenticated, service_role;

CREATE OR REPLACE VIEW public.public_profiles WITH (security_invoker = true) AS
  SELECT id, username, display_name FROM public.list_public_profiles();
REVOKE ALL ON public.public_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Signed-out visitors no longer touch the profiles table at all
DROP POLICY IF EXISTS "Anyone can read public profile columns" ON public.profiles;
REVOKE ALL ON public.profiles FROM anon;