-- Add timezone column to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Create notification_history table to store received notifications
CREATE TABLE IF NOT EXISTS public.notification_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  notification_type TEXT NOT NULL DEFAULT 'general',
  tag TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
ON public.notification_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notification_history
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notification_history
FOR DELETE
USING (auth.uid() = user_id);

-- Allow system to insert notifications
CREATE POLICY "Service role can insert notifications"
ON public.notification_history
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON public.notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_created_at ON public.notification_history(created_at DESC);