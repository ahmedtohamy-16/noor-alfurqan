CREATE OR REPLACE FUNCTION public.guard_profile_protected_columns()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() = 'service_role' OR (current_user IN ('postgres','supabase_admin') AND auth.uid() IS NULL) THEN
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