CREATE TABLE public.asma_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  asma_number integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, asma_number)
);

ALTER TABLE public.asma_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their asma favorites"
  ON public.asma_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users add their asma favorites"
  ON public.asma_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users remove their asma favorites"
  ON public.asma_favorites FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_asma_favorites_user ON public.asma_favorites(user_id);