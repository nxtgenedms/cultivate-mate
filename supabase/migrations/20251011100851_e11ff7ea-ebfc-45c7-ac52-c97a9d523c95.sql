-- Create batch stages enum
CREATE TYPE batch_stage AS ENUM (
  'cloning',
  'rooting',
  'vegetation',
  'flowering',
  'harvest',
  'processing',
  'completed'
);

-- Create approval status enum
CREATE TYPE approval_status AS ENUM (
  'draft',
  'pending',
  'approved',
  'rejected'
);

-- Create batches table (core entity)
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT NOT NULL UNIQUE,
  strain_id UUID REFERENCES public.lookup_values(id),
  mother_id TEXT,
  stage batch_stage NOT NULL DEFAULT 'cloning',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  projected_quantity INTEGER,
  actual_quantity INTEGER,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create cloning_pre_start_checklists table (HVCSOF0011)
CREATE TABLE public.cloning_pre_start_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  sof_number TEXT DEFAULT 'HVCSOF0011',
  
  -- Batch Information
  mother_id TEXT NOT NULL,
  batch_number TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  
  -- Mother Health Checklist (Yes/No)
  mother_health_vigorous BOOLEAN,
  mother_health_pest_free BOOLEAN,
  mother_health_disease_free BOOLEAN,
  
  -- Preparation Checklist (Yes/No)
  prep_tools_sterilized BOOLEAN,
  prep_media_ready BOOLEAN,
  prep_environment_clean BOOLEAN,
  
  -- Hygiene Checklist (Yes/No)
  hygiene_hands_sanitized BOOLEAN,
  hygiene_ppe_worn BOOLEAN,
  hygiene_workspace_clean BOOLEAN,
  
  -- Workflow fields
  status approval_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cloning_transplant_logs table (HVCSOF0012)
CREATE TABLE public.cloning_transplant_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  sof_number TEXT DEFAULT 'HVCSOF0012',
  
  strain_id UUID REFERENCES public.lookup_values(id),
  batch_number TEXT NOT NULL,
  mother_id TEXT NOT NULL,
  dome_number TEXT,
  total_clones INTEGER,
  projected_transplant_date DATE,
  actual_transplant_date DATE,
  total_transplanted INTEGER,
  
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create mortality_discard_records table (HVCSOF0015)
CREATE TABLE public.mortality_discard_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  sof_number TEXT DEFAULT 'HVCSOF0015',
  
  record_date DATE NOT NULL,
  batch_identifier TEXT NOT NULL,
  quantity_discarded INTEGER NOT NULL,
  reason TEXT NOT NULL, -- Mandatory field
  
  -- Workflow: Grower → Manager → QA
  status approval_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  grower_approved_by UUID REFERENCES auth.users(id),
  grower_approved_at TIMESTAMP WITH TIME ZONE,
  manager_approved_by UUID REFERENCES auth.users(id),
  manager_approved_at TIMESTAMP WITH TIME ZONE,
  qa_approved_by UUID REFERENCES auth.users(id),
  qa_approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloning_pre_start_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloning_transplant_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortality_discard_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for batches
CREATE POLICY "Users can view active batches"
  ON public.batches FOR SELECT
  USING (is_active = true);

CREATE POLICY "Growers and above can create batches"
  ON public.batches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

CREATE POLICY "Growers and above can update batches"
  ON public.batches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

-- RLS Policies for cloning_pre_start_checklists
CREATE POLICY "Users can view checklists"
  ON public.cloning_pre_start_checklists FOR SELECT
  USING (true);

CREATE POLICY "Assistant growers can create checklists"
  ON public.cloning_pre_start_checklists FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('assistant_grower', 'grower', 'manager', 'it_admin', 'business_admin')
    )
  );

CREATE POLICY "Users can update their own draft checklists"
  ON public.cloning_pre_start_checklists FOR UPDATE
  USING (
    (created_by = auth.uid() AND status = 'draft')
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('grower', 'manager', 'it_admin', 'business_admin')
    )
  );

-- RLS Policies for cloning_transplant_logs
CREATE POLICY "Users can view transplant logs"
  ON public.cloning_transplant_logs FOR SELECT
  USING (true);

CREATE POLICY "Growers can manage transplant logs"
  ON public.cloning_transplant_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('assistant_grower', 'grower', 'manager', 'it_admin', 'business_admin')
    )
  );

-- RLS Policies for mortality_discard_records
CREATE POLICY "Users can view mortality records"
  ON public.mortality_discard_records FOR SELECT
  USING (true);

CREATE POLICY "Growers can create mortality records"
  ON public.mortality_discard_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('grower', 'manager', 'qa', 'it_admin', 'business_admin')
    )
  );

CREATE POLICY "Authorized users can update mortality records"
  ON public.mortality_discard_records FOR UPDATE
  USING (
    (created_by = auth.uid() AND status = 'draft')
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('grower', 'manager', 'qa', 'it_admin', 'business_admin')
    )
  );

-- Create updated_at trigger for all tables
CREATE TRIGGER update_batches_updated_at
  BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_cloning_checklists_updated_at
  BEFORE UPDATE ON public.cloning_pre_start_checklists
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_transplant_logs_updated_at
  BEFORE UPDATE ON public.cloning_transplant_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_mortality_records_updated_at
  BEFORE UPDATE ON public.mortality_discard_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();