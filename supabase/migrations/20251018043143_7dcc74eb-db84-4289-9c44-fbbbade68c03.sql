-- Add task tracking fields to batch_lifecycle_records
ALTER TABLE public.batch_lifecycle_records
ADD COLUMN IF NOT EXISTS stage_transition_history jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_transition_tasks jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.batch_lifecycle_records.stage_transition_history IS 'Tracks all stage transitions with timestamp, user, and associated tasks';
COMMENT ON COLUMN public.batch_lifecycle_records.last_transition_tasks IS 'Tasks that were associated with the most recent stage transition';

-- Create task_field_mappings table for configuration
CREATE TABLE IF NOT EXISTS public.task_field_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_category text NOT NULL,
  sof_number text NOT NULL,
  applicable_stages text[] NOT NULL,
  field_mappings jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE public.task_field_mappings ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view mappings
CREATE POLICY "Users can view task field mappings"
  ON public.task_field_mappings
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Only admins can manage mappings
CREATE POLICY "Admins can manage task field mappings"
  ON public.task_field_mappings
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Insert default task-to-field mappings
INSERT INTO public.task_field_mappings (task_category, sof_number, applicable_stages, field_mappings) VALUES
('cloning_rooting', 'SOF03', ARRAY['cloning'], 
  '{"fields": ["actual_rooting_date", "hardening_number_clones", "dome_no"], "item_mappings": {"root_development": "actual_rooting_date", "total_plants": "hardening_number_clones"}}'::jsonb),
  
('cloning_rooting', 'SOF04', ARRAY['cloning'], 
  '{"fields": ["total_clones_plants", "dome_no", "mother_no"], "item_mappings": {"total_clones": "total_clones_plants", "dome_number": "dome_no"}}'::jsonb),
  
('daily_monitoring', 'SOF12', ARRAY['vegetative', 'flowering'], 
  '{"fields": ["veg_diseases", "veg_pests", "flowering_diseases", "flowering_pests"], "item_mappings": {"disease_check": "diseases", "pest_check": "pests"}}'::jsonb);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_task_field_mappings_updated_at
  BEFORE UPDATE ON public.task_field_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();