-- Drop existing role-based policies
DROP POLICY IF EXISTS "Growers and above can create batch lifecycle records" ON public.batch_lifecycle_records;
DROP POLICY IF EXISTS "Growers and above can update batch lifecycle records" ON public.batch_lifecycle_records;

-- Create permission-based policies
CREATE POLICY "Users with create_batches permission can create records"
ON public.batch_lifecycle_records
FOR INSERT
TO public
WITH CHECK (
  has_permission(auth.uid(), 'create_batches')
);

CREATE POLICY "Users with edit_batches permission can update records"
ON public.batch_lifecycle_records
FOR UPDATE
TO public
USING (
  has_permission(auth.uid(), 'edit_batches')
);