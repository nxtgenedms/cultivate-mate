-- Add approval fields to checklist_instances table
ALTER TABLE public.checklist_instances
ADD COLUMN approval_status TEXT DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending_approval', 'approved', 'rejected')),
ADD COLUMN submitted_by UUID REFERENCES auth.users(id),
ADD COLUMN submitted_at TIMESTAMPTZ,
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMPTZ,
ADD COLUMN rejected_by UUID REFERENCES auth.users(id),
ADD COLUMN rejected_at TIMESTAMPTZ,
ADD COLUMN rejection_reason TEXT,
ADD COLUMN approval_notes TEXT;