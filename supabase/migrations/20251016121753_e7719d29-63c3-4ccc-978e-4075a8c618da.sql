-- Drop old constraint
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- Add new constraint with 'pending' status
ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_status_check 
CHECK (status = ANY (ARRAY['draft'::text, 'pending'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text]));

-- Add checklist_id column to tasks table
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS checklist_id UUID REFERENCES public.checklist_instances(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tasks_checklist ON public.tasks(checklist_id);

-- Create function to auto-generate task when checklist is created
CREATE OR REPLACE FUNCTION public.create_task_for_checklist()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  template_name TEXT;
  task_name TEXT;
  task_desc TEXT;
  batch_info TEXT;
  task_number TEXT;
  task_count INTEGER;
BEGIN
  -- Get template name
  SELECT ct.template_name, ct.sof_number
  INTO template_name, task_desc
  FROM checklist_templates ct
  WHERE ct.id = NEW.template_id;
  
  -- Get batch info if batch-related
  IF NEW.batch_id IS NOT NULL THEN
    SELECT batch_number INTO batch_info
    FROM batch_lifecycle_records
    WHERE id = NEW.batch_id;
    
    task_name := 'Complete ' || template_name || ' for Batch ' || batch_info;
  ELSE
    task_name := 'Complete ' || template_name;
  END IF;
  
  -- Generate task number
  SELECT COUNT(*) INTO task_count FROM tasks;
  task_number := 'TASK-' || LPAD((task_count + 1)::TEXT, 4, '0');
  
  -- Create task
  INSERT INTO public.tasks (
    task_number,
    name,
    description,
    status,
    batch_id,
    checklist_id,
    created_by,
    due_date
  ) VALUES (
    task_number,
    task_name,
    'Complete checklist: ' || task_desc || ' (Instance: ' || NEW.instance_number || ')',
    'pending',
    NEW.batch_id,
    NEW.id,
    NEW.created_by,
    CASE 
      WHEN NEW.week_ending IS NOT NULL THEN NEW.week_ending
      ELSE CURRENT_DATE + INTERVAL '7 days'
    END
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create task when checklist is created
DROP TRIGGER IF EXISTS trigger_create_task_for_checklist ON public.checklist_instances;
CREATE TRIGGER trigger_create_task_for_checklist
  AFTER INSERT ON public.checklist_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.create_task_for_checklist();

-- Create function to update task status when checklist is completed
CREATE OR REPLACE FUNCTION public.update_task_on_checklist_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If checklist status changed to completed, mark linked task as completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'completed'
    WHERE checklist_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update task when checklist is completed
DROP TRIGGER IF EXISTS trigger_update_task_on_checklist_completion ON public.checklist_instances;
CREATE TRIGGER trigger_update_task_on_checklist_completion
  AFTER UPDATE ON public.checklist_instances
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.update_task_on_checklist_completion();

-- Create a task for the existing checklist instance
INSERT INTO public.tasks (
  task_number,
  name,
  description,
  status,
  checklist_id,
  created_by,
  due_date
)
SELECT 
  'TASK-' || LPAD((SELECT COUNT(*) + 1 FROM tasks)::TEXT, 4, '0'),
  'Complete ' || ct.template_name,
  'Complete checklist: ' || ct.sof_number || ' (Instance: ' || ci.instance_number || ')',
  'pending',
  ci.id,
  ci.created_by,
  CURRENT_DATE + INTERVAL '7 days'
FROM checklist_instances ci
JOIN checklist_templates ct ON ci.template_id = ct.id
WHERE NOT EXISTS (
  SELECT 1 FROM tasks WHERE checklist_id = ci.id
);