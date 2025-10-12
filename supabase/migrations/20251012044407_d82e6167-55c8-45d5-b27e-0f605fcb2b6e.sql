-- Create enum for SOF field types
CREATE TYPE sof_field_type AS ENUM (
  'text',
  'number',
  'date',
  'checkbox',
  'textarea',
  'select',
  'signature'
);

-- Create enum for lifecycle phases
CREATE TYPE lifecycle_phase AS ENUM (
  'cloning',
  'hardening',
  'vegetative',
  'flowering',
  'harvest',
  'processing',
  'drying',
  'packing',
  'mortality',
  'scouting',
  'general'
);

-- Create SOFs table
CREATE TABLE public.sofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sof_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  lifecycle_phase lifecycle_phase NOT NULL,
  effective_date DATE,
  revision_number INTEGER DEFAULT 1,
  supersedes TEXT,
  review_date DATE,
  is_active BOOLEAN DEFAULT true,
  compiled_by TEXT,
  authorised_by TEXT,
  approved_by TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create SOF fields table (stores the structure of each SOF)
CREATE TABLE public.sof_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sof_id UUID NOT NULL REFERENCES public.sofs(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type sof_field_type NOT NULL,
  field_group TEXT,
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  options JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sof_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sofs
CREATE POLICY "Users can view active SOFs"
  ON public.sofs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage SOFs"
  ON public.sofs FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for sof_fields
CREATE POLICY "Users can view SOF fields"
  ON public.sof_fields FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sofs
      WHERE sofs.id = sof_fields.sof_id
      AND sofs.is_active = true
    )
  );

CREATE POLICY "Admins can manage SOF fields"
  ON public.sof_fields FOR ALL
  USING (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_sofs_updated_at
  BEFORE UPDATE ON public.sofs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX idx_sofs_number ON public.sofs(sof_number);
CREATE INDEX idx_sofs_phase ON public.sofs(lifecycle_phase);
CREATE INDEX idx_sof_fields_sof_id ON public.sof_fields(sof_id);
CREATE INDEX idx_sof_fields_sort ON public.sof_fields(sof_id, sort_order);