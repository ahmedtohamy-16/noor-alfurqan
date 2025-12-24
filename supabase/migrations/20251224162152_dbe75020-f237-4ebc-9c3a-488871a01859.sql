-- Drop the problematic view that exposes auth.users
DROP VIEW IF EXISTS public.usage_stats;

-- Create a secure function instead for usage stats
CREATE OR REPLACE FUNCTION public.get_usage_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result jsonb;
BEGIN
    -- Only admins can call this function
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    SELECT jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM public.profiles),
        'today_reading_sessions', (SELECT COUNT(*) FROM public.reading_sessions WHERE session_date = CURRENT_DATE),
        'today_tasbih_sessions', (SELECT COUNT(*) FROM public.tasbih_stats WHERE session_date = CURRENT_DATE),
        'total_favorites', (SELECT COUNT(*) FROM public.favorites),
        'blocked_users_count', (SELECT COUNT(*) FROM public.blocked_users)
    ) INTO result;
    
    RETURN result;
END;
$$;