REVOKE ALL ON public.user_roles FROM anon;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.user_roles FROM authenticated;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));