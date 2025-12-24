-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create blocked_users table
CREATE TABLE public.blocked_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    blocked_by uuid NOT NULL,
    reason text,
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id)
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view blocked users"
ON public.blocked_users
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage blocked users"
ON public.blocked_users
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin_messages table
CREATE TABLE public.admin_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid NOT NULL,
    recipient_id uuid,
    subject text NOT NULL,
    message text NOT NULL,
    is_broadcast boolean DEFAULT false,
    is_read boolean DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can send messages"
ON public.admin_messages
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their messages"
ON public.admin_messages
FOR SELECT
USING (recipient_id = auth.uid() OR is_broadcast = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage messages"
ON public.admin_messages
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create push_subscriptions table for FCM
CREATE TABLE public.push_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    fcm_token text NOT NULL,
    device_info jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, fcm_token)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their subscriptions"
ON public.push_subscriptions
FOR ALL
USING (auth.uid() = user_id);

-- Add prayer_reminder_minutes to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS prayer_reminder_minutes integer DEFAULT 10;

-- Add selected_reciter to user_reading_settings
ALTER TABLE public.user_reading_settings
ADD COLUMN IF NOT EXISTS selected_reciter text DEFAULT 'ar.alafasy';

-- Add is_blocked to profiles for quick check
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;

-- Update profiles policy to allow admins to view all
DROP POLICY IF EXISTS "Users can view basic profile info" ON public.profiles;
CREATE POLICY "Users can view profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create usage_stats view for admin dashboard
CREATE OR REPLACE VIEW public.usage_stats AS
SELECT
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM public.reading_sessions WHERE session_date = CURRENT_DATE) as today_reading_sessions,
    (SELECT COUNT(*) FROM public.tasbih_stats WHERE session_date = CURRENT_DATE) as today_tasbih_sessions,
    (SELECT COUNT(*) FROM public.favorites) as total_favorites,
    (SELECT COUNT(*) FROM public.blocked_users) as blocked_users_count;