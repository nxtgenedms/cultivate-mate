-- Create nomenclature templates table
CREATE TABLE IF NOT EXISTS public.nomenclature_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL UNIQUE,
  format_pattern TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nomenclature_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage nomenclature templates"
  ON public.nomenclature_templates
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view active templates"
  ON public.nomenclature_templates
  FOR SELECT
  USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_nomenclature_templates_updated_at
  BEFORE UPDATE ON public.nomenclature_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default Batch template
INSERT INTO public.nomenclature_templates (entity_type, format_pattern, description)
VALUES (
  'batch',
  '[YYYYMMDD]-[COUNT]',
  'Batch ID format: Date (YYYYMMDD) followed by daily sequential count'
);

-- Create function to generate next batch number
CREATE OR REPLACE FUNCTION public.generate_batch_number(creation_date DATE DEFAULT CURRENT_DATE)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  date_prefix TEXT;
  daily_count INTEGER;
  new_batch_number TEXT;
BEGIN
  -- Format date as YYYYMMDD
  date_prefix := TO_CHAR(creation_date, 'YYYYMMDD');
  
  -- Count existing batches for this date
  SELECT COUNT(*) + 1 INTO daily_count
  FROM batch_lifecycle_records
  WHERE batch_number LIKE date_prefix || '-%';
  
  -- Generate new batch number
  new_batch_number := date_prefix || '-' || LPAD(daily_count::TEXT, 3, '0');
  
  RETURN new_batch_number;
END;
$$;