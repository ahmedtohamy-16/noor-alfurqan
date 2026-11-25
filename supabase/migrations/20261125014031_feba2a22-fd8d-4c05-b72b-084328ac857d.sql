CREATE FUNCTION public.read_account_state(expected_owner uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM expected_owner THEN RAISE EXCEPTION 'Account changed' USING ERRCODE='42501'; END IF;
 RETURN public.read_user_state();
END $$;
CREATE FUNCTION public.sync_account_state(changes jsonb, expected_owner uuid) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM expected_owner THEN RAISE EXCEPTION 'Account changed' USING ERRCODE='42501'; END IF;
 PERFORM public.sync_user_state(changes);
END $$;
REVOKE ALL ON FUNCTION public.read_account_state(uuid), public.sync_account_state(jsonb,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.read_account_state(uuid), public.sync_account_state(jsonb,uuid) TO authenticated,service_role;