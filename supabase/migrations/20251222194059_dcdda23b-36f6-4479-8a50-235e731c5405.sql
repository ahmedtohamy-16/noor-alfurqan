-- Create khatmahs table for group Quran readings
CREATE TABLE public.khatmahs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create khatmah_participants table
CREATE TABLE public.khatmah_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    khatmah_id UUID REFERENCES public.khatmahs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    assigned_juz INTEGER NOT NULL CHECK (assigned_juz >= 1 AND assigned_juz <= 30),
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(khatmah_id, assigned_juz)
);

-- Enable RLS
ALTER TABLE public.khatmahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.khatmah_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for khatmahs
CREATE POLICY "Anyone can view khatmahs they participate in"
ON public.khatmahs FOR SELECT
TO authenticated
USING (
    id IN (SELECT khatmah_id FROM public.khatmah_participants WHERE user_id = auth.uid())
    OR created_by = auth.uid()
);

CREATE POLICY "Authenticated users can create khatmahs"
ON public.khatmahs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their khatmahs"
ON public.khatmahs FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their khatmahs"
ON public.khatmahs FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- RLS Policies for khatmah_participants
CREATE POLICY "Users can view participants in their khatmahs"
ON public.khatmah_participants FOR SELECT
TO authenticated
USING (
    khatmah_id IN (
        SELECT id FROM public.khatmahs 
        WHERE created_by = auth.uid() 
        OR id IN (SELECT khatmah_id FROM public.khatmah_participants WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Users can join khatmahs"
ON public.khatmah_participants FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
ON public.khatmah_participants FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can leave khatmahs"
ON public.khatmah_participants FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username');
    RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate random invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for khatmahs updated_at
CREATE TRIGGER update_khatmahs_updated_at
    BEFORE UPDATE ON public.khatmahs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();