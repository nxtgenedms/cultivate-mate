-- Insert HVCSOF0015: MORTALITY & DISCARD RECORD checklist template
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
  'HVCSOF0015',
  'MORTALITY & DISCARD RECORD',
  'Record and track mortality and discarded plants across all cultivation phases',
  'on_demand',
  true,
  NULL,
  'mortality_discard',
  true
);

-- Insert checklist template items (fields)
DO $$
DECLARE
  template_id UUID;
BEGIN
  SELECT id INTO template_id 
  FROM public.checklist_templates 
  WHERE sof_number = 'HVCSOF0015';

  INSERT INTO public.checklist_template_items (
    template_id,
    section_name,
    item_label,
    item_type,
    is_required,
    sort_order
  ) VALUES
  (template_id, 'Mortality Record Entry', 'Area', 'text', true, 1),
  (template_id, 'Mortality Record Entry', 'Date', 'date', true, 2),
  (template_id, 'Mortality Record Entry', 'Batch ID Number', 'text', true, 3),
  (template_id, 'Mortality Record Entry', 'Qty Discarded', 'number', true, 4),
  (template_id, 'Mortality Record Entry', 'Details', 'text', true, 5);
END $$;