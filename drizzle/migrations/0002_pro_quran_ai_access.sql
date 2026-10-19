CREATE TABLE public.pro_entitlements (user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE, status text NOT NULL DEFAULT 'inactive', source text NOT NULL DEFAULT 'subscription', expires_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_entitlements TO authenticated;
GRANT ALL ON public.pro_entitlements TO service_role;
ALTER TABLE public.pro_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own Pro access" ON public.pro_entitlements FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage Pro access" ON public.pro_entitlements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TABLE public.quran_ai_service_state (id text PRIMARY KEY, denied boolean NOT NULL DEFAULT false, message text, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.quran_ai_service_state TO service_role;
ALTER TABLE public.quran_ai_service_state ENABLE ROW LEVEL SECURITY;