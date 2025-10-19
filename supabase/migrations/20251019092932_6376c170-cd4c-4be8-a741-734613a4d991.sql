
-- Update the RLS policy for checklist_instances to include assistant_grower role
DROP POLICY IF EXISTS "Authorized users can create instances" ON checklist_instances;

CREATE POLICY "Authorized users can create instances" 
ON checklist_instances 
FOR INSERT 
TO authenticated
WITH CHECK (
  (created_by = auth.uid()) 
  AND 
  (EXISTS ( 
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = ANY (ARRAY[
        'assistant_grower'::app_role,
        'grower'::app_role, 
        'manager'::app_role, 
        'supervisor'::app_role, 
        'qa'::app_role, 
        'it_admin'::app_role, 
        'business_admin'::app_role
      ])
  ))
);
