-- Drop the overly restrictive RLS policy
DROP POLICY IF EXISTS "Authorized users can create checklists" ON public.checklist_instances;

-- Create a more permissive policy that allows any authenticated user to create checklists
CREATE POLICY "Authenticated users can create checklists"
  ON public.checklist_instances
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND auth.uid() IS NOT NULL
  );