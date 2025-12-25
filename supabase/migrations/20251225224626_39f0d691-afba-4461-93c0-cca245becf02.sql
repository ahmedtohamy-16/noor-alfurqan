-- Create table to store user language preferences for prophet stories
CREATE TABLE public.user_story_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'ar',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_story_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own preferences" 
ON public.user_story_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.user_story_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_story_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_story_preferences_updated_at
BEFORE UPDATE ON public.user_story_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();