-- Reserved names (immutable helper so it can back a CHECK constraint)
CREATE OR REPLACE FUNCTION public.is_reserved_username(name text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT lower(coalesce(name,'')) = ANY (ARRAY['admin','support','root','api','settings','login','signup','profile','u','null','undefined'])
$$;

ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_format
  CHECK (username ~ '^[a-z0-9_]{3,20}$');
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_not_reserved
  CHECK (NOT public.is_reserved_username(username));
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key ON public.profiles (lower(username));

-- Keep username_search in sync when users rename themselves
CREATE OR REPLACE FUNCTION public.sync_username_search()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.username_search := public.normalize_username(NEW.username);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS profiles_sync_username_search ON public.profiles;
CREATE TRIGGER profiles_sync_username_search
  BEFORE INSERT OR UPDATE OF username ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_username_search();

-- Availability check for the frontend
CREATE OR REPLACE FUNCTION public.check_username_available(name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(name,'') ~ '^[a-z0-9_]{3,20}$'
     AND NOT public.is_reserved_username(name)
     AND NOT EXISTS (
       SELECT 1 FROM public.profiles
       WHERE lower(username) = lower(name) AND id IS DISTINCT FROM auth.uid()
     )
$$;
REVOKE ALL ON FUNCTION public.check_username_available(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_username_available(text) TO anon, authenticated;

-- Signup trigger: always produce a valid, unique username, never raise
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
DECLARE
  v_email  text := COALESCE(NEW.email, '');
  v_hex    text := replace(NEW.id::text, '-', '');
  v_req    text := lower(btrim(COALESCE(NEW.raw_user_meta_data ->> 'username', '')));
  v_prefix text := left(regexp_replace(lower(split_part(COALESCE(NEW.email, ''), '@', 1)), '[^a-z0-9_]', '', 'g'), 13);
  v_uname  text;
  v_disp   text;
BEGIN
  IF v_req ~ '^[a-z0-9_]{3,20}$' AND NOT public.is_reserved_username(v_req) THEN
    v_uname := v_req;
  ELSIF length(v_prefix) >= 3 AND NOT public.is_reserved_username(v_prefix) THEN
    v_uname := v_prefix;
  ELSE
    v_uname := 'user_' || substr(v_hex, 1, 8);
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = v_uname) THEN
    v_uname := left(v_uname, 13) || '_' || substr(v_hex, 1, 6);
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = v_uname) THEN
    v_uname := 'u_' || substr(v_hex, 1, 18);
  END IF;

  v_disp := COALESCE(
    NULLIF(btrim(COALESCE(NEW.raw_user_meta_data ->> 'display_name', '')), ''),
    NULLIF(split_part(v_email, '@', 1), ''),
    v_uname
  );

  INSERT INTO public.profiles (id, username, display_name, email, username_search)
  VALUES (NEW.id, v_uname, v_disp, NULLIF(v_email, ''), public.normalize_username(v_uname))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Public, non-private view of profiles (username + display name only)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false) AS
  SELECT id, username, display_name FROM public.profiles;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Base table: no anonymous access; signed-in users may update only username and display name
REVOKE ALL ON public.profiles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (username, display_name) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update own username and display name"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);