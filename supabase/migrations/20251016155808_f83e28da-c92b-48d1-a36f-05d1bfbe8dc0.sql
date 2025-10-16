-- Create function to automatically create a task when a checklist is created
CREATE OR REPLACE FUNCTION create_task_from_checklist()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  template_record RECORD;
  item_record RECORD;
  checklist_items_array JSONB;
  task_number TEXT;
  task_count INTEGER;
BEGIN
  -- Get template info
  SELECT template_name, sof_number, description
  INTO template_record
  FROM checklist_templates
  WHERE id = NEW.template_id;
  
  -- Build checklist items array from template items
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'label', item_label,
      'section', section_name,
      'is_required', is_required,
      'completed', false,
      'notes', '',
      'sort_order', sort_order
    ) ORDER BY sort_order
  )
  INTO checklist_items_array
  FROM checklist_template_items
  WHERE template_id = NEW.template_id
    AND is_required = true;
  
  -- Generate task number
  SELECT COUNT(*) INTO task_count FROM tasks;
  task_number := 'TA-' || LPAD((task_count + 1)::TEXT, 4, '0');
  
  -- Create ONE task with embedded checklist items
  INSERT INTO tasks (
    task_number,
    name,
    description,
    status,
    batch_id,
    checklist_id,
    template_item_id,
    checklist_items,
    completion_progress,
    created_by
  ) VALUES (
    task_number,
    template_record.sof_number || ': ' || template_record.template_name,
    template_record.description,
    'in_progress',
    NEW.batch_id,
    NEW.id,
    NEW.template_id,
    COALESCE(checklist_items_array, '[]'::jsonb),
    jsonb_build_object(
      'completed', 0,
      'total', COALESCE(jsonb_array_length(checklist_items_array), 0)
    ),
    NEW.created_by
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after checklist instance is created
DROP TRIGGER IF EXISTS on_checklist_created ON checklist_instances;
CREATE TRIGGER on_checklist_created
  AFTER INSERT ON checklist_instances
  FOR EACH ROW
  EXECUTE FUNCTION create_task_from_checklist();