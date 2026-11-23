CREATE TABLE public.tasbih_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dhikr text NOT NULL CHECK (char_length(dhikr) BETWEEN 1 AND 200),
  count integer NOT NULL CHECK (count > 0 AND count <= 100000),
  session_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.tasbih_sessions TO authenticated;
GRANT ALL ON public.tasbih_sessions TO service_role;
ALTER TABLE public.tasbih_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tasbih_select_own ON public.tasbih_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY tasbih_insert_own ON public.tasbih_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY tasbih_delete_own ON public.tasbih_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX tasbih_sessions_user_date_idx ON public.tasbih_sessions (user_id, session_date);