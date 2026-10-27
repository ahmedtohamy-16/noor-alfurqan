-- Canonical username normalization shared by availability checks, the signup
-- trigger and username login: lowercase, trim, collapse spaces, strip Arabic
-- diacritics/tatweel, and unify alef/ya variants so visually-identical Arabic
-- usernames can never slip past the uniqueness check.
CREATE OR REPLACE FUNCTION public.normalize_username(p text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT regexp_replace(
    regexp_replace(
      translate(lower(btrim(coalesce(p, ''))), 'أإآٱى', 'ااااي'),
      '[ً-ْٰـ]', '', 'g'
    ),
    '\s+', ' ', 'g'
  )
$$;

-- Searchable normalized username column (additive; backfilled below).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username_search text;

UPDATE public.profiles
SET username_search = public.normalize_username(username)
WHERE username_search IS NULL OR username_search <> public.normalize_username(username);

-- Legacy test data contains usernames that collide after normalization; give
-- the later duplicates a deterministic unique suffix before indexing.
WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY username_search ORDER BY id) AS rn
  FROM public.profiles
)
UPDATE public.profiles p
SET username_search = p.username_search || '_' || substr(replace(p.id::text, '-', ''), 1, 6)
FROM ranked r
WHERE p.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_search_unique
ON public.profiles (username_search);

-- Availability check now compares normalized values only, and never treats a
-- lookup failure as "available" (errors propagate to the caller).
CREATE OR REPLACE FUNCTION public.is_username_taken(p_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE username_search = public.normalize_username(p_username)
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_username_taken(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_username(text) TO anon, authenticated;

-- Username login: resolve a username to its account email without exposing
-- the profiles table to anonymous reads.
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles
  WHERE username_search = public.normalize_username(p_username)
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon, authenticated;

-- Signup trigger: store the normalized username and enforce uniqueness on it.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username_search = public.normalize_username(v_uname)) THEN
    v_uname := COALESCE(v_prefix, 'user') || '_' || substr(replace(NEW.id::text, '-', ''), 9, 6);
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username_search = public.normalize_username(v_uname)) THEN
    v_uname := 'u_' || replace(NEW.id::text, '-', '');
  END IF;

  INSERT INTO public.profiles (id, username, display_name, email, username_search)
  VALUES (NEW.id, v_uname, v_disp, NULLIF(v_email, ''), public.normalize_username(v_uname))
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;