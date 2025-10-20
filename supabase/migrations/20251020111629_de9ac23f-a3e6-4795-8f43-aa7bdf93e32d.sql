-- Add approval chain tracking and update approval status values
COMMENT ON COLUMN public.tasks.approval_history IS 'JSON array tracking approval chain: [{action, user_id, user_name, role, target_user_id, target_user_name, remarks, timestamp}]';

-- Create index on assignee for faster task queries
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee);

-- Create index on approval_status for filtering
CREATE INDEX IF NOT EXISTS idx_tasks_approval_status ON public.tasks(approval_status);

-- Update RLS policy to allow admins to approve any task
DROP POLICY IF EXISTS "Users can update tasks with edit permission" ON public.tasks;

CREATE POLICY "Users can update tasks with edit permission"
ON public.tasks
FOR UPDATE
USING (
  (created_by = auth.uid()) 
  OR (assignee = auth.uid()) 
  OR has_permission(auth.uid(), 'edit_all_tasks'::text)
  OR is_admin(auth.uid())
);

-- Ensure task visibility includes pending approvals for assignee
DROP POLICY IF EXISTS "Users can view tasks they created or are assigned to" ON public.tasks;

CREATE POLICY "Users can view tasks they created or are assigned to"
ON public.tasks
FOR SELECT
USING (
  (created_by = auth.uid()) 
  OR (assignee = auth.uid()) 
  OR (EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = ANY (ARRAY['manager'::app_role, 'supervisor'::app_role, 'it_admin'::app_role, 'business_admin'::app_role])
  ))
);