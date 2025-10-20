-- Create table for approval workflows
CREATE TABLE approval_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_category text NOT NULL UNIQUE,
  category_display_name text NOT NULL,
  stages jsonb NOT NULL, -- Array of stage names
  total_stages integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;

-- Admins can manage workflows
CREATE POLICY "Admins can manage workflows"
ON approval_workflows
FOR ALL
USING (is_admin(auth.uid()));

-- Everyone can view active workflows
CREATE POLICY "Users can view workflows"
ON approval_workflows
FOR SELECT
USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_approval_workflows_updated_at
  BEFORE UPDATE ON approval_workflows
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert default workflows from existing configuration
INSERT INTO approval_workflows (task_category, category_display_name, stages, total_stages) VALUES
  ('daily_cloning_transplant', 'Daily Cloning & Transplant Log', '["Assistant Grower", "Grower/Manager"]'::jsonb, 2),
  ('mortality_discard', 'Mortality & Discard Record', '["Grower", "Manager", "QA"]'::jsonb, 3),
  ('weekly_cultivation', 'Weekly Cultivation Checklist', '["Grower", "Manager"]'::jsonb, 2),
  ('clonator_weekly', 'Clonator Weekly Checklist', '["Grower", "Supervisor", "Manager"]'::jsonb, 3),
  ('soil_moisture', 'Soil Moisture Records', '["Grower", "Manager"]'::jsonb, 2),
  ('scouting_corrective', 'Scouting & Corrective Action', '["Grower", "Manager", "QA"]'::jsonb, 3),
  ('chemical_delivery', 'Chemical Delivery Receipt', '["Receiver Signature"]'::jsonb, 1),
  ('fertigation_application', 'Fertigation Application Record', '["Grower", "Manager", "QA"]'::jsonb, 3),
  ('ipm_chemical_mixing', 'IPM Chemical Mixing Record', '["Grower", "Manager", "QA"]'::jsonb, 3),
  ('hygiene_check', 'Personnel/Facility Hygiene Check', '["Staff", "Manager/Supervisor"]'::jsonb, 2),
  ('cultivation_cleaning', 'Cultivation Cleaning Checklist', '["Performer", "Manager", "QA"]'::jsonb, 3),
  ('processing_cleaning', 'Processing Cleaning Checklist', '["Performer", "Manager", "QA"]'::jsonb, 3),
  ('pre_harvest', 'Pre-Harvest Checklist', '["Grower", "Supervisor"]'::jsonb, 2),
  ('final_harvest', 'Final Harvest Record', '["Manager", "QA"]'::jsonb, 2),
  ('cloning_pre_start', 'Cloning Pre-Start Checklist', '["Grower"]'::jsonb, 1);