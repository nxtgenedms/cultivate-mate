-- Drop the overly permissive policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Users can view all active profiles" ON public.profiles;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Managers and admins can view all active profiles
CREATE POLICY "Managers can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  is_active = true AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('manager', 'supervisor', 'it_admin', 'business_admin')
  )
);