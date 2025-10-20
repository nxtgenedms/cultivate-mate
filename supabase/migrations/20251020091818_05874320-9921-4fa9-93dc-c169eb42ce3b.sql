-- Drop existing policies
DROP POLICY IF EXISTS "Growers and above can create batch lifecycle records" ON public.batch_lifecycle_records;
DROP POLICY IF EXISTS "Growers and above can update batch lifecycle records" ON public.batch_lifecycle_records;

-- Recreate policies with assistant_grower included
CREATE POLICY "Growers and above can create batch lifecycle records"
ON public.batch_lifecycle_records
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN (
        'assistant_grower',
        'grower',
        'manager',
        'supervisor',
        'qa',
        'it_admin',
        'business_admin'
      )
  )
);

CREATE POLICY "Growers and above can update batch lifecycle records"
ON public.batch_lifecycle_records
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN (
        'assistant_grower',
        'grower',
        'manager',
        'supervisor',
        'qa',
        'it_admin',
        'business_admin'
      )
  )
);