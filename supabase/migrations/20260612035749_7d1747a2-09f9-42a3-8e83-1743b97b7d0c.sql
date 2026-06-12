
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notification_history;
CREATE POLICY "Service role can insert notifications"
ON public.notification_history FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert notification logs" ON public.notification_logs;
CREATE POLICY "Service role can insert notification logs"
ON public.notification_logs FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service can insert audio logs" ON public.audio_generation_log;
CREATE POLICY "Service can insert audio logs"
ON public.audio_generation_log FOR INSERT TO service_role WITH CHECK (true);

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.otp_codes'::regclass LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.otp_codes', pol.polname);
  END LOOP;
END $$;

CREATE POLICY "Service role full access otp_codes"
ON public.otp_codes FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Deny non-service access otp_codes"
ON public.otp_codes AS RESTRICTIVE FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);

REVOKE ALL ON public.otp_codes FROM anon, authenticated;

REVOKE ALL ON public.quiz_questions FROM anon, authenticated;
GRANT SELECT (id, quiz_id, question, options, points, order_index, question_type, created_at)
  ON public.quiz_questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quiz_questions TO authenticated;
GRANT ALL ON public.quiz_questions TO service_role;

DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ') INTO cols
    FROM information_schema.columns
   WHERE table_schema='public' AND table_name='khatmahs' AND column_name <> 'invite_code';
  EXECUTE 'REVOKE ALL ON public.khatmahs FROM anon, authenticated';
  EXECUTE format('GRANT SELECT (%s) ON public.khatmahs TO authenticated', cols);
  EXECUTE 'GRANT INSERT, UPDATE, DELETE ON public.khatmahs TO authenticated';
  EXECUTE 'GRANT ALL ON public.khatmahs TO service_role';
END $$;

CREATE OR REPLACE FUNCTION public.get_khatmah_invite_code(p_khatmah_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT invite_code FROM public.khatmahs
  WHERE id = p_khatmah_id AND created_by::text = auth.uid()::text;
$$;

REVOKE ALL ON FUNCTION public.get_khatmah_invite_code(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_khatmah_invite_code(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.cleanup_expired_otps() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_usage_stats() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.generate_invite_code() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can receive own conversation messages" ON realtime.messages;
CREATE POLICY "Authenticated can receive own conversation messages"
ON realtime.messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversations c ON c.id = m.conversation_id
    WHERE (extension = 'postgres_changes')
      AND (c.participant_1 = auth.uid()::text OR c.participant_2 = auth.uid()::text)
  )
);
