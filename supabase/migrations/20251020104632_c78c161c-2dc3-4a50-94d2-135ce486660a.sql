-- Add approval_workflow field to checklist_templates
ALTER TABLE checklist_templates 
ADD COLUMN IF NOT EXISTS approval_workflow text;

-- Update existing templates with their approval workflows based on task_category
UPDATE checklist_templates 
SET approval_workflow = CASE task_category
  WHEN 'daily_cloning_transplant' THEN 'Assistant Grower → Grower/Manager'
  WHEN 'mortality_discard' THEN 'Grower → Manager → QA'
  WHEN 'weekly_cultivation' THEN 'Grower → Manager'
  WHEN 'clonator_weekly' THEN 'Grower → Supervisor → Manager'
  WHEN 'soil_moisture' THEN 'Grower → Manager'
  WHEN 'scouting_corrective' THEN 'Grower → Manager → QA'
  WHEN 'chemical_delivery' THEN 'Receiver Signature'
  WHEN 'fertigation_application' THEN 'Grower → Manager → QA'
  WHEN 'ipm_chemical_mixing' THEN 'Grower → Manager → QA'
  WHEN 'hygiene_check' THEN 'Staff → Manager/Supervisor'
  WHEN 'cultivation_cleaning' THEN 'Performer → Manager → QA'
  WHEN 'processing_cleaning' THEN 'Performer → Manager → QA'
  WHEN 'pre_harvest' THEN 'Grower → Supervisor'
  WHEN 'final_harvest' THEN 'Manager → QA'
  ELSE 'Creator → Manager'
END
WHERE task_category IS NOT NULL;