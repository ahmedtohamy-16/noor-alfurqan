-- RLS Policies for profile_changes_log
CREATE POLICY "Users can view their own change logs"
ON public.profile_changes_log
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own change logs"
ON public.profile_changes_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all change logs"
ON public.profile_changes_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for security_questions
CREATE POLICY "Users can view their own security questions"
ON public.security_questions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security questions"
ON public.security_questions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own security questions"
ON public.security_questions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all security questions"
ON public.security_questions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for account_recovery_requests
CREATE POLICY "Users can view their own recovery requests"
ON public.account_recovery_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recovery requests"
ON public.account_recovery_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all recovery requests"
ON public.account_recovery_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update recovery requests"
ON public.account_recovery_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));