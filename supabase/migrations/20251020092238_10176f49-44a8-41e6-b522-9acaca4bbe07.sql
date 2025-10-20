-- ============================================
-- TASKS TABLE - Use permission-based policies
-- ============================================
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks CASCADE;
DROP POLICY IF EXISTS "Users with create_tasks permission can create tasks" ON public.tasks CASCADE;
DROP POLICY IF EXISTS "Users can update their own tasks or assigned tasks" ON public.tasks CASCADE;
DROP POLICY IF EXISTS "Users can update tasks with edit permission" ON public.tasks CASCADE;
DROP POLICY IF EXISTS "Managers can delete tasks" ON public.tasks CASCADE;
DROP POLICY IF EXISTS "Users with delete permission can delete tasks" ON public.tasks CASCADE;

CREATE POLICY "Users with create_tasks permission can create tasks"
ON public.tasks
FOR INSERT
TO public
WITH CHECK (
  has_permission(auth.uid(), 'create_tasks') AND created_by = auth.uid()
);

CREATE POLICY "Users can update tasks with edit permission"
ON public.tasks
FOR UPDATE
TO public
USING (
  (created_by = auth.uid() OR assignee = auth.uid()) OR has_permission(auth.uid(), 'edit_all_tasks')
);

CREATE POLICY "Users with delete permission can delete tasks"
ON public.tasks
FOR DELETE
TO public
USING (
  has_permission(auth.uid(), 'delete_tasks')
);

-- ============================================
-- CHECKLIST INSTANCES - Use permission-based policies
-- ============================================
DROP POLICY IF EXISTS "Authorized users can create instances" ON public.checklist_instances CASCADE;
DROP POLICY IF EXISTS "Users with checklist permission can create instances" ON public.checklist_instances CASCADE;
DROP POLICY IF EXISTS "Authorized users can update instances" ON public.checklist_instances CASCADE;
DROP POLICY IF EXISTS "Users with checklist permission can update instances" ON public.checklist_instances CASCADE;

CREATE POLICY "Users with checklist permission can create instances"
ON public.checklist_instances
FOR INSERT
TO public
WITH CHECK (
  has_permission(auth.uid(), 'manage_checklists') AND created_by = auth.uid()
);

CREATE POLICY "Users with checklist permission can update instances"
ON public.checklist_instances
FOR UPDATE
TO public
USING (
  has_permission(auth.uid(), 'manage_checklists')
);

-- ============================================
-- CHECKLIST ITEM RESPONSES - Use permission-based policies
-- ============================================
DROP POLICY IF EXISTS "Users can create responses" ON public.checklist_item_responses CASCADE;
DROP POLICY IF EXISTS "Users with checklist permission can create responses" ON public.checklist_item_responses CASCADE;
DROP POLICY IF EXISTS "Users can update responses" ON public.checklist_item_responses CASCADE;
DROP POLICY IF EXISTS "Users with checklist permission can update responses" ON public.checklist_item_responses CASCADE;

CREATE POLICY "Users with checklist permission can create responses"
ON public.checklist_item_responses
FOR INSERT
TO public
WITH CHECK (
  has_permission(auth.uid(), 'manage_checklists') AND (completed_by = auth.uid() OR completed_by IS NULL)
);

CREATE POLICY "Users with checklist permission can update responses"
ON public.checklist_item_responses
FOR UPDATE
TO public
USING (
  has_permission(auth.uid(), 'manage_checklists')
);

-- ============================================
-- INVENTORY RECEIPTS - Use permission-based policies
-- ============================================
DROP POLICY IF EXISTS "Authorized users can create inventory receipts" ON public.inventory_receipts CASCADE;
DROP POLICY IF EXISTS "Users with manage_inventory permission can create receipts" ON public.inventory_receipts CASCADE;
DROP POLICY IF EXISTS "Authorized users can update inventory receipts" ON public.inventory_receipts CASCADE;
DROP POLICY IF EXISTS "Users with manage_inventory permission can update receipts" ON public.inventory_receipts CASCADE;

CREATE POLICY "Users with manage_inventory permission can create receipts"
ON public.inventory_receipts
FOR INSERT
TO public
WITH CHECK (
  has_permission(auth.uid(), 'manage_inventory') AND created_by = auth.uid()
);

CREATE POLICY "Users with manage_inventory permission can update receipts"
ON public.inventory_receipts
FOR UPDATE
TO public
USING (
  has_permission(auth.uid(), 'manage_inventory')
);

-- ============================================
-- INVENTORY USAGE - Use permission-based policies
-- ============================================
DROP POLICY IF EXISTS "Authorized users can create inventory usage" ON public.inventory_usage CASCADE;
DROP POLICY IF EXISTS "Users with manage_inventory permission can create usage" ON public.inventory_usage CASCADE;
DROP POLICY IF EXISTS "Authorized users can update inventory usage" ON public.inventory_usage CASCADE;
DROP POLICY IF EXISTS "Users with manage_inventory permission can update usage" ON public.inventory_usage CASCADE;

CREATE POLICY "Users with manage_inventory permission can create usage"
ON public.inventory_usage
FOR INSERT
TO public
WITH CHECK (
  has_permission(auth.uid(), 'manage_inventory') AND created_by = auth.uid()
);

CREATE POLICY "Users with manage_inventory permission can update usage"
ON public.inventory_usage
FOR UPDATE
TO public
USING (
  has_permission(auth.uid(), 'manage_inventory')
);

-- ============================================
-- MORTALITY DISCARD RECORDS - Use permission-based policies
-- ============================================
DROP POLICY IF EXISTS "Growers can create mortality records" ON public.mortality_discard_records CASCADE;
DROP POLICY IF EXISTS "Users with edit_batches permission can create mortality records" ON public.mortality_discard_records CASCADE;
DROP POLICY IF EXISTS "Authorized users can update mortality records" ON public.mortality_discard_records CASCADE;
DROP POLICY IF EXISTS "Users can update mortality records with permission" ON public.mortality_discard_records CASCADE;

CREATE POLICY "Users with edit_batches permission can create mortality records"
ON public.mortality_discard_records
FOR INSERT
TO public
WITH CHECK (
  has_permission(auth.uid(), 'edit_batches')
);

CREATE POLICY "Users can update mortality records with permission"
ON public.mortality_discard_records
FOR UPDATE
TO public
USING (
  (created_by = auth.uid() AND status = 'draft') OR has_permission(auth.uid(), 'edit_batches')
);

-- ============================================
-- SOF03 PHASE GATE SUBMISSIONS - Use permission-based policies
-- ============================================
DROP POLICY IF EXISTS "Authorized users can create SOF03 submissions" ON public.sof03_phase_gate_submissions CASCADE;
DROP POLICY IF EXISTS "Users with edit_batches permission can create SOF03 submissions" ON public.sof03_phase_gate_submissions CASCADE;
DROP POLICY IF EXISTS "Authorized users can update SOF03 submissions" ON public.sof03_phase_gate_submissions CASCADE;
DROP POLICY IF EXISTS "Users with edit_batches permission can update SOF03 submissions" ON public.sof03_phase_gate_submissions CASCADE;

CREATE POLICY "Users with edit_batches permission can create SOF03 submissions"
ON public.sof03_phase_gate_submissions
FOR INSERT
TO public
WITH CHECK (
  has_permission(auth.uid(), 'edit_batches') AND submitted_by = auth.uid()
);

CREATE POLICY "Users with edit_batches permission can update SOF03 submissions"
ON public.sof03_phase_gate_submissions
FOR UPDATE
TO public
USING (
  has_permission(auth.uid(), 'edit_batches')
);