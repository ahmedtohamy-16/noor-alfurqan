-- Create a secure RPC function for joining khatmah by invite code
-- This allows users to join without exposing all khatmahs via SELECT

CREATE OR REPLACE FUNCTION public.join_khatmah_by_code(p_invite_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_khatmah_id uuid;
  v_user_id uuid;
  v_available_juz integer;
  v_existing_participant uuid;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'يجب تسجيل الدخول');
  END IF;

  -- Find khatmah by invite code
  SELECT id INTO v_khatmah_id
  FROM public.khatmahs
  WHERE invite_code = UPPER(p_invite_code);

  IF v_khatmah_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'كود الدعوة غير صحيح');
  END IF;

  -- Check if already a participant
  SELECT id INTO v_existing_participant
  FROM public.khatmah_participants
  WHERE khatmah_id = v_khatmah_id AND user_id = v_user_id;

  IF v_existing_participant IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'أنت مشارك بالفعل في هذه الختمة');
  END IF;

  -- Find first available juz (1-30)
  SELECT juz INTO v_available_juz
  FROM generate_series(1, 30) AS juz
  WHERE juz NOT IN (
    SELECT assigned_juz FROM public.khatmah_participants WHERE khatmah_id = v_khatmah_id
  )
  ORDER BY juz
  LIMIT 1;

  IF v_available_juz IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'الختمة مكتملة');
  END IF;

  -- Insert participant
  INSERT INTO public.khatmah_participants (khatmah_id, user_id, assigned_juz)
  VALUES (v_khatmah_id, v_user_id, v_available_juz);

  RETURN json_build_object(
    'success', true, 
    'khatmah_id', v_khatmah_id,
    'assigned_juz', v_available_juz
  );
END;
$$;

-- Drop the overly permissive policy that allows any authenticated user to see all khatmahs
DROP POLICY IF EXISTS "Anyone can view khatmah by invite code" ON public.khatmahs;