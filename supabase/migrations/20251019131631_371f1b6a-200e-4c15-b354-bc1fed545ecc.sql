-- Insert SOF001a: Start of Day Hygiene 22c
INSERT INTO public.checklist_templates (
  template_name,
  sof_number,
  description,
  frequency,
  is_batch_specific,
  lifecycle_phase,
  task_category,
  is_active
) VALUES (
  'Start of Day Hygiene 22c',
  'SOF001a',
  'Daily hygiene checklist for cultivation area start of day',
  'daily',
  false,
  NULL,
  'daily_hygiene',
  true
);

-- Get the template_id for SOF001a
DO $$
DECLARE
  template_id_001a UUID;
BEGIN
  SELECT id INTO template_id_001a FROM public.checklist_templates WHERE sof_number = 'SOF001a';
  
  -- Insert items for SOF001a
  INSERT INTO public.checklist_template_items (template_id, section_name, item_label, item_type, is_required, sort_order) VALUES
    (template_id_001a, 'General Information', 'Date', 'date', true, 1),
    (template_id_001a, 'General Information', 'Name', 'text', true, 2),
    (template_id_001a, 'Hygiene Checks', 'Hair tied back', 'checkbox', true, 3),
    (template_id_001a, 'Hygiene Checks', 'No jewelry worn', 'checkbox', true, 4),
    (template_id_001a, 'Hygiene Checks', 'Clean uniform', 'checkbox', true, 5),
    (template_id_001a, 'Hygiene Checks', 'Hands washed', 'checkbox', true, 6),
    (template_id_001a, 'Hygiene Checks', 'Footwear clean', 'checkbox', true, 7),
    (template_id_001a, 'Notes', 'Additional Notes', 'textarea', false, 8),
    (template_id_001a, 'Signature', 'Employee Signature', 'text', true, 9);
END $$;

-- Insert SOF001b: Start of Day Hygiene
INSERT INTO public.checklist_templates (
  template_name,
  sof_number,
  description,
  frequency,
  is_batch_specific,
  lifecycle_phase,
  task_category,
  is_active
) VALUES (
  'Start of Day Hygiene',
  'SOF001b',
  'Daily hygiene checklist for general areas',
  'daily',
  false,
  NULL,
  'daily_hygiene',
  true
);

-- Get the template_id for SOF001b
DO $$
DECLARE
  template_id_001b UUID;
BEGIN
  SELECT id INTO template_id_001b FROM public.checklist_templates WHERE sof_number = 'SOF001b';
  
  -- Insert items for SOF001b
  INSERT INTO public.checklist_template_items (template_id, section_name, item_label, item_type, is_required, sort_order) VALUES
    (template_id_001b, 'General Information', 'Date', 'date', true, 1),
    (template_id_001b, 'General Information', 'Name', 'text', true, 2),
    (template_id_001b, 'Hygiene Checks', 'Personal hygiene maintained', 'checkbox', true, 3),
    (template_id_001b, 'Hygiene Checks', 'Appropriate PPE worn', 'checkbox', true, 4),
    (template_id_001b, 'Hygiene Checks', 'Work area sanitized', 'checkbox', true, 5),
    (template_id_001b, 'Hygiene Checks', 'Equipment cleaned', 'checkbox', true, 6),
    (template_id_001b, 'Notes', 'Comments', 'textarea', false, 7),
    (template_id_001b, 'Signature', 'Employee Signature', 'text', true, 8);
END $$;

-- Insert SOF065b: Cleaning Checklist 22C Processing
INSERT INTO public.checklist_templates (
  template_name,
  sof_number,
  description,
  frequency,
  is_batch_specific,
  lifecycle_phase,
  task_category,
  is_active
) VALUES (
  'Cleaning Checklist 22C Processing',
  'SOF065b',
  'Cleaning checklist for processing area 22C',
  'daily',
  false,
  NULL,
  'facility_cleaning',
  true
);

-- Get the template_id for SOF065b
DO $$
DECLARE
  template_id_065b UUID;
BEGIN
  SELECT id INTO template_id_065b FROM public.checklist_templates WHERE sof_number = 'SOF065b';
  
  -- Insert items for SOF065b
  INSERT INTO public.checklist_template_items (template_id, section_name, item_label, item_type, is_required, sort_order) VALUES
    (template_id_065b, 'General Information', 'Date', 'date', true, 1),
    (template_id_065b, 'General Information', 'Cleaned By', 'text', true, 2),
    (template_id_065b, 'Processing Area', 'Work surfaces cleaned and sanitized', 'checkbox', true, 3),
    (template_id_065b, 'Processing Area', 'Equipment cleaned and sanitized', 'checkbox', true, 4),
    (template_id_065b, 'Processing Area', 'Floors swept and mopped', 'checkbox', true, 5),
    (template_id_065b, 'Processing Area', 'Walls and doors wiped down', 'checkbox', true, 6),
    (template_id_065b, 'Processing Area', 'Waste removed', 'checkbox', true, 7),
    (template_id_065b, 'Processing Area', 'Tools and utensils sanitized', 'checkbox', true, 8),
    (template_id_065b, 'Inspection', 'Area inspected and approved', 'checkbox', true, 9),
    (template_id_065b, 'Notes', 'Additional Comments', 'textarea', false, 10),
    (template_id_065b, 'Signature', 'Cleaner Signature', 'text', true, 11),
    (template_id_065b, 'Signature', 'Supervisor Signature', 'text', true, 12);
END $$;