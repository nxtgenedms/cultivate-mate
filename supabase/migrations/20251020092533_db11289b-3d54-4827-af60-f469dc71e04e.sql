-- Update profiles SELECT policies to allow users to see other users' names
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;

-- Allow all authenticated users to view active profiles (for displaying user names)
CREATE POLICY "Users can view all active profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_active = true);

-- Keep the update policies as they were
-- (Admins can update all, users can update their own)