-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_create_task_for_checklist_items ON public.checklist_instances;
DROP TRIGGER IF EXISTS trigger_create_task_for_checklist ON public.checklist_instances;
DROP TRIGGER IF EXISTS trigger_update_task_on_checklist_completion ON public.checklist_instances;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.create_task_for_checklist_items();
DROP FUNCTION IF EXISTS public.create_task_for_checklist();
DROP FUNCTION IF EXISTS public.update_task_on_checklist_completion();

-- Create new function that creates a task for each checklist item
CREATE OR REPLACE FUNCTION public.create_task_for_checklist_items()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  template_name TEXT;
  sof_number TEXT;
  batch_info TEXT;
  item_record RECORD;
  task_number TEXT;
  task_count INTEGER;
  task_name TEXT;
BEGIN
  -- Get template info
  SELECT ct.template_name, ct.sof_number
  INTO template_name, sof_number
  FROM checklist_templates ct
  WHERE ct.id = NEW.template_id;
  
  -- Get batch info if batch-related
  IF NEW.batch_id IS NOT NULL THEN
    SELECT batch_number INTO batch_info
    FROM batch_lifecycle_records
    WHERE id = NEW.batch_id;
  END IF;
  
  -- Loop through all required checklist items for this template
  FOR item_record IN 
    SELECT id, item_label, section_name, is_required
    FROM checklist_template_items
    WHERE template_id = NEW.template_id
    AND is_required = true
    ORDER BY sort_order
  LOOP
    -- Generate task number
    SELECT COUNT(*) INTO task_count FROM tasks;
    task_number := 'TASK-' || LPAD((task_count + 1)::TEXT, 4, '0');
    
    -- Create task name
    IF batch_info IS NOT NULL THEN
      task_name := sof_number || ': ' || item_record.item_label || ' (Batch ' || batch_info || ')';
    ELSE
      task_name := sof_number || ': ' || item_record.item_label;
    END IF;
    
    -- Create individual task for this checklist item
    INSERT INTO public.tasks (
      task_number,
      name,
      description,
      status,
      batch_id,
      checklist_id,
      template_item_id,
      created_by,
      due_date
    ) VALUES (
      task_number,
      task_name,
      CASE 
        WHEN item_record.section_name IS NOT NULL 
        THEN 'Section: ' || item_record.section_name || ' - ' || item_record.item_label
        ELSE item_record.item_label
      END,
      'pending',
      NEW.batch_id,
      NEW.id,
      item_record.id,
      NEW.created_by,
      CASE 
        WHEN NEW.week_ending IS NOT NULL THEN NEW.week_ending
        ELSE CURRENT_DATE + INTERVAL '7 days'
      END
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new function
CREATE TRIGGER trigger_create_task_for_checklist_items
AFTER INSERT ON public.checklist_instances
FOR EACH ROW
EXECUTE FUNCTION public.create_task_for_checklist_items();

-- Delete existing tasks that were created for checklists
DELETE FROM public.tasks WHERE checklist_id IS NOT NULL;

-- Create tasks for all existing checklist instances
DO $$
DECLARE
  instance_record RECORD;
  template_name TEXT;
  sof_number TEXT;
  batch_info TEXT;
  item_record RECORD;
  task_number TEXT;
  task_count INTEGER;
  task_name TEXT;
BEGIN
  FOR instance_record IN 
    SELECT id, template_id, batch_id, created_by, week_ending
    FROM checklist_instances
    ORDER BY created_at
  LOOP
    -- Get template info
    SELECT ct.template_name, ct.sof_number
    INTO template_name, sof_number
    FROM checklist_templates ct
    WHERE ct.id = instance_record.template_id;
    
    -- Get batch info if batch-related
    IF instance_record.batch_id IS NOT NULL THEN
      SELECT batch_number INTO batch_info
      FROM batch_lifecycle_records
      WHERE id = instance_record.batch_id;
    END IF;
    
    -- Loop through required items
    FOR item_record IN 
      SELECT id, item_label, section_name, is_required
      FROM checklist_template_items
      WHERE template_id = instance_record.template_id
      AND is_required = true
      ORDER BY sort_order
    LOOP
      -- Generate task number
      SELECT COUNT(*) INTO task_count FROM tasks;
      task_number := 'TASK-' || LPAD((task_count + 1)::TEXT, 4, '0');
      
      -- Create task name
      IF batch_info IS NOT NULL THEN
        task_name := sof_number || ': ' || item_record.item_label || ' (Batch ' || batch_info || ')';
      ELSE
        task_name := sof_number || ': ' || item_record.item_label;
      END IF;
      
      -- Create task
      INSERT INTO public.tasks (
        task_number,
        name,
        description,
        status,
        batch_id,
        checklist_id,
        template_item_id,
        created_by,
        due_date
      ) VALUES (
        task_number,
        task_name,
        CASE 
          WHEN item_record.section_name IS NOT NULL 
          THEN 'Section: ' || item_record.section_name || ' - ' || item_record.item_label
          ELSE item_record.item_label
        END,
        'pending',
        instance_record.batch_id,
        instance_record.id,
        item_record.id,
        instance_record.created_by,
        CASE 
          WHEN instance_record.week_ending IS NOT NULL THEN instance_record.week_ending
          ELSE CURRENT_DATE + INTERVAL '7 days'
        END
      );
    END LOOP;
  END LOOP;
END;
$$;