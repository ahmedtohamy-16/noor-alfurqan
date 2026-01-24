-- Add columns for username/displayname change tracking (skip constraint that already exists)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS last_username_change timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_displayname_change timestamp with time zone,
ADD COLUMN IF NOT EXISTS username_change_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS displayname_change_count integer DEFAULT 0;

-- Create profile changes log table
CREATE TABLE IF NOT EXISTS public.profile_changes_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    change_type text NOT NULL,
    old_value text,
    new_value text,
    ip_address text,
    user_agent text,
    changed_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_changes_log ENABLE ROW LEVEL SECURITY;

-- Create security questions table for account recovery
CREATE TABLE IF NOT EXISTS public.security_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    question_1 text NOT NULL,
    answer_1_hash text NOT NULL,
    question_2 text NOT NULL,
    answer_2_hash text NOT NULL,
    question_3 text,
    answer_3_hash text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on security_questions
ALTER TABLE public.security_questions ENABLE ROW LEVEL SECURITY;

-- Create account recovery requests table for admin verification
CREATE TABLE IF NOT EXISTS public.account_recovery_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    request_type text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    evidence_description text,
    admin_notes text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.account_recovery_requests ENABLE ROW LEVEL SECURITY;