-- Insert SOF065a: Cleaning Checklist 22C Growing
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
  'Cleaning Checklist 22C Growing',
  'SOF065a',
  'Weekly cleaning checklist for growing areas (Clonator, Vegging, Flowering)',
  'weekly',
  false,
  NULL,
  'facility_cleaning',
  true
);

-- Get the template_id for SOF065a
DO $$
DECLARE
  template_id_065a UUID;
BEGIN
  SELECT id INTO template_id_065a FROM public.checklist_templates WHERE sof_number = 'SOF065a';
  
  -- Insert items for SOF065a
  INSERT INTO public.checklist_template_items (template_id, section_name, item_label, item_type, is_required, sort_order) VALUES
    (template_id_065a, 'General Information', 'Week Starting', 'date', true, 1),
    (template_id_065a, 'General Information', 'Week Ending', 'date', true, 2),
    
    -- Clonator Area (Daily)
    (template_id_065a, 'Clonator Area - Daily', 'Disinfect cloning tools before and after use', 'checkbox', true, 3),
    (template_id_065a, 'Clonator Area - Daily', 'Wipe down clonator machine with 70% isopropyl alcohol', 'checkbox', true, 4),
    (template_id_065a, 'Clonator Area - Daily', 'Check and clean humidity domes', 'checkbox', true, 5),
    (template_id_065a, 'Clonator Area - Daily', 'Remove fallen leaves and plant debris', 'checkbox', true, 6),
    (template_id_065a, 'Clonator Area - Daily', 'Clean and sanitize trays or inserts', 'checkbox', true, 7),
    (template_id_065a, 'Clonator Area - Daily', 'Mop floors with approved disinfectant', 'checkbox', true, 8),
    (template_id_065a, 'Clonator Area - Daily', 'Sanitize hands or wear fresh gloves before handling clones', 'checkbox', true, 9),
    
    -- Vegging Area (Daily)
    (template_id_065a, 'Vegging Area - Daily', 'Sweep and mop floors', 'checkbox', true, 10),
    (template_id_065a, 'Vegging Area - Daily', 'Wipe down tables and plant trays', 'checkbox', true, 11),
    (template_id_065a, 'Vegging Area - Daily', 'Remove yellowing leaves and plant debris', 'checkbox', true, 12),
    (template_id_065a, 'Vegging Area - Daily', 'Sanitize pruning tools', 'checkbox', true, 13),
    (template_id_065a, 'Vegging Area - Daily', 'Monitor and log temperature/humidity levels', 'checkbox', true, 14),
    (template_id_065a, 'Vegging Area - Daily', 'Sanitize door handles and high-touch surfaces', 'checkbox', true, 15),
    
    -- Flowering Area (Daily)
    (template_id_065a, 'Flowering Area - Daily', 'Sanitize hands/gloves before entry', 'checkbox', true, 16),
    (template_id_065a, 'Flowering Area - Daily', 'Remove fallen leaves or plant debris', 'checkbox', true, 17),
    (template_id_065a, 'Flowering Area - Daily', 'Sweep floors and spot-mop as needed', 'checkbox', true, 18),
    (template_id_065a, 'Flowering Area - Daily', 'Disinfect trimming tools and scissors', 'checkbox', true, 19),
    (template_id_065a, 'Flowering Area - Daily', 'Check for powdery mildew, mold, or pests', 'checkbox', true, 20),
    
    -- Weekly: Clonator
    (template_id_065a, 'Weekly - Clonator', 'Deep clean clonator reservoir and replace water', 'checkbox', true, 21),
    (template_id_065a, 'Weekly - Clonator', 'Sanitize air intake vents and fans', 'checkbox', true, 22),
    (template_id_065a, 'Weekly - Clonator', 'Check and clean water pumps, hoses, and misters', 'checkbox', true, 23),
    (template_id_065a, 'Weekly - Clonator', 'Change and sanitize cloning gels/tools storage', 'checkbox', true, 24),
    
    -- Weekly: Vegging
    (template_id_065a, 'Weekly - Vegging', 'Deep clean all trays and containers', 'checkbox', true, 25),
    (template_id_065a, 'Weekly - Vegging', 'Inspect irrigation system for leaks or clogs', 'checkbox', true, 26),
    (template_id_065a, 'Weekly - Vegging', 'Inspect for mold, mildew, or algae buildup on containers', 'checkbox', true, 27),
    (template_id_065a, 'Weekly - Vegging', 'Clean lighting fixtures and reflectors', 'checkbox', true, 28),
    
    -- Signatures
    (template_id_065a, 'Signatures', 'Compiled By', 'text', true, 29),
    (template_id_065a, 'Signatures', 'Supervisor Signature', 'text', true, 30);
END $$;