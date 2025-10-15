-- Create SOF03 form for Cloning to Vegetative phase change
INSERT INTO public.sofs (
  sof_number,
  title,
  description,
  lifecycle_phase,
  revision_number,
  effective_date,
  review_date,
  compiled_by,
  authorised_by,
  approved_by,
  is_active
) VALUES (
  'HVCSOF003-GATE',
  'Phase Change Compliance: Cloning to Vegetative',
  'Mandatory compliance checklist for transitioning batches from Cloning to Vegetative phase',
  'cloning',
  1,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '2 years',
  'System Administrator',
  'Quality Assurance',
  'Operations Manager',
  true
) ON CONFLICT DO NOTHING;

-- Create table for SOF03 compliance submissions
CREATE TABLE IF NOT EXISTS public.sof03_phase_gate_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.batch_lifecycle_records(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  
  -- Compliance questions (all must be YES to pass)
  clones_healthy BOOLEAN NOT NULL DEFAULT false,
  root_development_adequate BOOLEAN NOT NULL DEFAULT false,
  no_disease_present BOOLEAN NOT NULL DEFAULT false,
  no_pest_infestation BOOLEAN NOT NULL DEFAULT false,
  environmental_conditions_met BOOLEAN NOT NULL DEFAULT false,
  documentation_complete BOOLEAN NOT NULL DEFAULT false,
  quality_check_passed BOOLEAN NOT NULL DEFAULT false,
  
  -- Submission metadata
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Outcome
  all_checks_passed BOOLEAN GENERATED ALWAYS AS (
    clones_healthy AND 
    root_development_adequate AND 
    no_disease_present AND 
    no_pest_infestation AND 
    environmental_conditions_met AND 
    documentation_complete AND 
    quality_check_passed
  ) STORED,
  
  phase_change_approved BOOLEAN,
  rework_task_id UUID,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sof03_phase_gate_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view SOF03 submissions"
  ON public.sof03_phase_gate_submissions
  FOR SELECT
  USING (true);

CREATE POLICY "Authorized users can create SOF03 submissions"
  ON public.sof03_phase_gate_submissions
  FOR INSERT
  WITH CHECK (
    submitted_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

CREATE POLICY "Authorized users can update SOF03 submissions"
  ON public.sof03_phase_gate_submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

-- Create index for batch lookups
CREATE INDEX idx_sof03_batch_id ON public.sof03_phase_gate_submissions(batch_id);
CREATE INDEX idx_sof03_batch_number ON public.sof03_phase_gate_submissions(batch_number);

-- Trigger for updated_at
CREATE TRIGGER update_sof03_submissions_updated_at
  BEFORE UPDATE ON public.sof03_phase_gate_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();