-- Update RLS policies for checklist_instances to use task permissions
DROP POLICY IF EXISTS "Users with checklist permission can create instances" ON checklist_instances;
DROP POLICY IF EXISTS "Users with checklist permission can update instances" ON checklist_instances;

-- Allow users with create_tasks permission to create checklist instances
CREATE POLICY "Users with create_tasks permission can create instances" 
ON checklist_instances 
FOR INSERT 
WITH CHECK (has_permission(auth.uid(), 'create_tasks') AND created_by = auth.uid());

-- Allow users with edit permissions to update checklist instances
CREATE POLICY "Users can update checklist instances" 
ON checklist_instances 
FOR UPDATE 
USING (
  created_by = auth.uid() OR 
  has_permission(auth.uid(), 'edit_all_tasks')
);

-- Update RLS policies for checklist_item_responses
DROP POLICY IF EXISTS "Users with checklist permission can create responses" ON checklist_item_responses;
DROP POLICY IF EXISTS "Users with checklist permission can update responses" ON checklist_item_responses;

-- Allow users with create_tasks permission to create responses
CREATE POLICY "Users with create_tasks can create responses" 
ON checklist_item_responses 
FOR INSERT 
WITH CHECK (
  has_permission(auth.uid(), 'create_tasks') AND 
  (completed_by = auth.uid() OR completed_by IS NULL)
);

-- Allow users to update responses
CREATE POLICY "Users can update responses" 
ON checklist_item_responses 
FOR UPDATE 
USING (
  completed_by = auth.uid() OR 
  has_permission(auth.uid(), 'edit_all_tasks')
);