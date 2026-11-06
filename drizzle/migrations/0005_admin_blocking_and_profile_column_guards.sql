ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN is_blocked SET DEFAULT false;
UPDATE public.profiles SET is_blocked = false WHERE is_blocked IS NULL;

-- Column-level privileges
REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT (id, username, display_name) ON public.profiles TO anon;
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM authenticated;
GRANT UPDATE (username, display_name, is_blocked) ON public.profiles TO authenticated;

-- Guard trigger: only admins may change is_blocked; nobody but service role may change id/email
CREATE OR REPLACE FUNCTION public.guard_profile_protected_columns()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() = 'service_role' OR current_user IN ('postgres','supabase_admin') AND auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.is_blocked IS DISTINCT FROM OLD.is_blocked AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not_allowed_is_blocked' USING ERRCODE = '42501';
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'not_allowed_private_field' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS profiles_guard_protected_columns ON public.profiles;
CREATE TRIGGER profiles_guard_protected_columns BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_protected_columns();

-- Policies
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Anyone can read public profile columns" ON public.profiles;
CREATE POLICY "Anyone can read public profile columns" ON public.profiles FOR SELECT TO anon USING (true);

-- Public view runs with the caller's privileges
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles WITH (security_invoker = true) AS
  SELECT id, username, display_name FROM public.profiles;
REVOKE ALL ON public.public_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT ALL ON public.public_profiles TO service_role;