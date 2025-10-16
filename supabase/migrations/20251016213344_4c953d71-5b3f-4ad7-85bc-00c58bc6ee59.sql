-- Insert HVCSOF0012: DAILY CLONING RECORD checklist template
INSERT INTO public.checklist_templates (
  sof_number,
  template_name,
  description,
  frequency,
  is_batch_specific,
  lifecycle_phase,
  task_category,
  is_active
) VALUES (
  'HVCSOF0012',
  'DAILY CLONING RECORD',
  'Daily record of cloning activities and transplant tracking',
  'daily',
  true,
  NULL,
  'daily_cloning_transplant',
  true
);

-- Insert checklist template items (fields)
DO $$
DECLARE
  template_id UUID;
BEGIN
  SELECT id INTO template_id 
  FROM public.checklist_templates 
  WHERE sof_number = 'HVCSOF0012';

  INSERT INTO public.checklist_template_items (
    template_id,
    section_name,
    item_label,
    item_type,
    is_required,
    sort_order
  ) VALUES
  (template_id, 'Cloning Record', 'Strain', 'text', true, 1),
  (template_id, 'Cloning Record', 'Batch number', 'text', true, 2),
  (template_id, 'Cloning Record', 'Mother ID number', 'text', true, 3),
  (template_id, 'Cloning Record', 'Total clones in batch', 'number', true, 4),
  (template_id, 'Cloning Record', 'Dome No.', 'text', true, 5),
  (template_id, 'Cloning Record', 'Projected Transplant Date', 'date', true, 6),
  (template_id, 'Cloning Record', 'Date Transplanted', 'date', true, 7),
  (template_id, 'Cloning Record', 'Total Transplanted', 'number', true, 8);
END $$;