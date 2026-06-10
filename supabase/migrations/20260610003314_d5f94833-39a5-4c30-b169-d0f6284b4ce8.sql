
CREATE TABLE public.hadith_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id text NOT NULL,
  hadith_number integer NOT NULL,
  share_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_id, hadith_number)
);

GRANT SELECT ON public.hadith_shares TO anon, authenticated;
GRANT ALL    ON public.hadith_shares TO service_role;

ALTER TABLE public.hadith_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read share counts"
  ON public.hadith_shares
  FOR SELECT
  USING (true);

CREATE INDEX hadith_shares_count_idx
  ON public.hadith_shares (share_count DESC);

CREATE OR REPLACE FUNCTION public.increment_hadith_share(
  p_book_id text,
  p_hadith_number integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_count integer;
BEGIN
  IF p_book_id IS NULL OR length(p_book_id) = 0 OR length(p_book_id) > 64 THEN
    RAISE EXCEPTION 'invalid book_id';
  END IF;
  IF p_hadith_number IS NULL OR p_hadith_number <= 0 THEN
    RAISE EXCEPTION 'invalid hadith_number';
  END IF;

  INSERT INTO public.hadith_shares (book_id, hadith_number, share_count)
  VALUES (p_book_id, p_hadith_number, 1)
  ON CONFLICT (book_id, hadith_number)
  DO UPDATE SET
    share_count = public.hadith_shares.share_count + 1,
    updated_at  = now()
  RETURNING share_count INTO v_new_count;

  RETURN v_new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_hadith_share(text, integer) TO anon, authenticated;
