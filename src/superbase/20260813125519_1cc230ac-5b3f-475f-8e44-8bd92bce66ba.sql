-- 1. has_role: security definer -> invoker
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

DROP POLICY IF EXISTS roles_self_read ON public.user_roles;
CREATE POLICY roles_self_read ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2. profiles: authenticated-only reads
DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
CREATE POLICY profiles_authenticated_read ON public.profiles
  FOR SELECT TO authenticated
  USING (true);
REVOKE SELECT ON public.profiles FROM anon;

-- 3. lawyers: hide user_id from anonymous visitors
REVOKE SELECT ON public.lawyers FROM anon;
GRANT SELECT (id, name, photo_url, specializations, city, fees, bio, bar_registration,
              experience_years, languages, rating, review_count, created_at)
  ON public.lawyers TO anon;

-- 4. reviews: hide user_id from anonymous visitors
REVOKE SELECT ON public.reviews FROM anon;
GRANT SELECT (id, lawyer_id, author_name, rating, comment, created_at)
  ON public.reviews TO anon;
