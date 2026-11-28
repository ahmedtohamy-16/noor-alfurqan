REVOKE EXECUTE ON FUNCTION public.get_email_by_username(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO service_role;

DROP POLICY IF EXISTS tasbih_insert_own ON public.tasbih_sessions;
REVOKE INSERT ON public.tasbih_sessions FROM authenticated, anon;