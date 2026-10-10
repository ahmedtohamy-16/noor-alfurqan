-- 1) profiles: store the account email so the app can show and search it
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 2) Backfill email for the accounts that already exist
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL
  AND u.email IS NOT NULL;

-- 3) New accounts save username, display name and email into their profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, username, display_name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(COALESCE(NEW.email, ''), '@', 1)),
      COALESCE(
        NEW.raw_user_meta_data ->> 'display_name',
        NEW.raw_user_meta_data ->> 'username',
        split_part(COALESCE(NEW.email, ''), '@', 1)
      ),
      NEW.email
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- 4) Give the hosted Data API permission to reach the tables.
--    Row-level security policies (already in place) still decide which rows each role sees.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_recovery_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asma_favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audio_generation_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.azkar TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.azkar_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.countries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_enrollments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_lessons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_wird TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hadith_shares TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.khatmah_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.khatmahs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_changes_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quizzes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasbih_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_files TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_azkar_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_reading_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_story_preferences TO authenticated;

-- Legacy one-time-code table stays service-only (its policies deny every other role)
GRANT ALL ON public.otp_codes TO service_role;

GRANT ALL ON public.account_recovery_requests TO service_role;
GRANT ALL ON public.admin_messages TO service_role;
GRANT ALL ON public.admin_users TO service_role;
GRANT ALL ON public.app_settings TO service_role;
GRANT ALL ON public.asma_favorites TO service_role;
GRANT ALL ON public.audio_generation_log TO service_role;
GRANT ALL ON public.azkar TO service_role;
GRANT ALL ON public.azkar_categories TO service_role;
GRANT ALL ON public.blocked_users TO service_role;
GRANT ALL ON public.cities TO service_role;
GRANT ALL ON public.conversations TO service_role;
GRANT ALL ON public.countries TO service_role;
GRANT ALL ON public.course_enrollments TO service_role;
GRANT ALL ON public.course_lessons TO service_role;
GRANT ALL ON public.daily_wird TO service_role;
GRANT ALL ON public.favorites TO service_role;
GRANT ALL ON public.hadith_shares TO service_role;
GRANT ALL ON public.khatmah_participants TO service_role;
GRANT ALL ON public.khatmahs TO service_role;
GRANT ALL ON public.messages TO service_role;
GRANT ALL ON public.notification_history TO service_role;
GRANT ALL ON public.notification_logs TO service_role;
GRANT ALL ON public.profile_changes_log TO service_role;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.push_subscriptions TO service_role;
GRANT ALL ON public.quiz_attempts TO service_role;
GRANT ALL ON public.quiz_questions TO service_role;
GRANT ALL ON public.quizzes TO service_role;
GRANT ALL ON public.reading_progress TO service_role;
GRANT ALL ON public.reading_sessions TO service_role;
GRANT ALL ON public.security_questions TO service_role;
GRANT ALL ON public.tasbih_stats TO service_role;
GRANT ALL ON public.teacher_files TO service_role;
GRANT ALL ON public.user_azkar_progress TO service_role;
GRANT ALL ON public.user_reading_settings TO service_role;
GRANT ALL ON public.user_roles TO service_role;
GRANT ALL ON public.user_settings TO service_role;
GRANT ALL ON public.user_story_preferences TO service_role;

-- 5) Visitor-readable reference tables only (their policies already say "anyone can view")
GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT ON public.azkar TO anon;
GRANT SELECT ON public.azkar_categories TO anon;
GRANT SELECT ON public.cities TO anon;
GRANT SELECT ON public.countries TO anon;
GRANT SELECT ON public.course_lessons TO anon;
GRANT SELECT ON public.hadith_shares TO anon;
GRANT SELECT ON public.quiz_questions TO anon;
GRANT SELECT ON public.quizzes TO anon;
GRANT SELECT ON public.teacher_files TO anon;