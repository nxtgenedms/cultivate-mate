-- Allow authenticated users to view all user roles for task assignment and approval workflows
-- This is necessary so users can see roles when selecting approvers or assignees
CREATE POLICY "Authenticated users can view all roles for task management"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);