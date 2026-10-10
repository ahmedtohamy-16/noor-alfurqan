CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_email  text := COALESCE(NEW.email, '');
  v_prefix text := NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), '');
  v_uname  text;
  v_disp   text;
BEGIN
  v_uname := COALESCE(
    NULLIF(btrim(COALESCE(NEW.raw_user_meta_data ->> 'username', '')), ''),
    v_prefix,
    'user'
  );
  v_disp := COALESCE(
    NULLIF(btrim(COALESCE(NEW.raw_user_meta_data ->> 'display_name', '')), ''),
    NULLIF(btrim(COALESCE(NEW.raw_user_meta_data ->> 'username', '')), ''),
    v_prefix,
    v_uname
  );

  -- A taken username must never abort account creation: a unique-violation
  -- here surfaced to the browser as "Database error saving new user" (500).
  -- Fall back to a deterministic unique variant derived from the new id.
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = v_uname) THEN
    v_uname := COALESCE(v_prefix, 'user') || '_' || substr(replace(NEW.id::text, '-', ''), 9, 6);
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = v_uname) THEN
    v_uname := 'u_' || replace(NEW.id::text, '-', '');
  END IF;

  INSERT INTO public.profiles (id, username, display_name, email)
  VALUES (NEW.id, v_uname, v_disp, NULLIF(v_email, ''))
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_username_taken(p_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE username = p_username
       OR lower(btrim(username)) = lower(btrim(p_username))
  )
$function$;

GRANT EXECUTE ON FUNCTION public.is_username_taken(text) TO anon, authenticated, service_role;