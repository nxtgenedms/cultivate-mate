-- Step 1: Drop the existing CHECK constraint on tasks.status
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- Step 2: Update existing task statuses to merge approval_status into status
UPDATE tasks
SET status = CASE
  WHEN approval_status = 'approved' THEN 'completed'
  WHEN approval_status = 'rejected' THEN 'rejected'
  WHEN approval_status = 'pending_approval' THEN 'pending_approval'
  WHEN status = 'completed' THEN 'completed'
  WHEN status = 'cancelled' THEN 'cancelled'
  WHEN status = 'draft' THEN 'in_progress'
  WHEN status = 'pending' THEN 'in_progress'
  ELSE 'in_progress'
END;

-- Step 3: Drop the approval_status column from tasks table
ALTER TABLE tasks DROP COLUMN IF EXISTS approval_status;

-- Step 4: Add new CHECK constraint with the correct status values
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('in_progress', 'pending_approval', 'rejected', 'completed', 'cancelled'));

-- Step 5: Update checklist_instances to remove approval_status
ALTER TABLE checklist_instances DROP COLUMN IF EXISTS approval_status;

-- Step 6: Drop the old approval_status enum if it exists
DROP TYPE IF EXISTS approval_status CASCADE;

-- Step 7: Drop all triggers and functions related to task approval notifications
DROP TRIGGER IF EXISTS notify_task_approval_needed ON tasks;
DROP TRIGGER IF EXISTS task_approval_notification_trigger ON tasks;
DROP FUNCTION IF EXISTS notify_task_approval_needed() CASCADE;

-- Step 8: Recreate the notification function without approval_status references
CREATE OR REPLACE FUNCTION public.notify_task_approval_needed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When task status changes to pending_approval
  IF (NEW.status = 'pending_approval' AND 
      (OLD.status IS NULL OR OLD.status != 'pending_approval')) THEN
    
    -- Notify the assignee that task needs approval
    INSERT INTO public.task_notifications (
      user_id,
      task_id,
      notification_type,
      message,
      is_read
    ) VALUES (
      NEW.assignee,
      NEW.id,
      'approval_required',
      'Task "' || NEW.name || '" requires approval',
      false
    );
  END IF;
  
  -- When task is completed (approved), notify the creator
  IF (NEW.status = 'completed' AND 
      (OLD.status IS NULL OR OLD.status != 'completed')) THEN
    
    INSERT INTO public.task_notifications (
      user_id,
      task_id,
      notification_type,
      message,
      is_read
    ) VALUES (
      NEW.created_by,
      NEW.id,
      'task_approved',
      'Your task "' || NEW.name || '" has been completed',
      false
    );
  END IF;
  
  -- When task is rejected, notify the creator
  IF (NEW.status = 'rejected' AND 
      (OLD.status IS NULL OR OLD.status != 'rejected')) THEN
    
    INSERT INTO public.task_notifications (
      user_id,
      task_id,
      notification_type,
      message,
      is_read
    ) VALUES (
      NEW.created_by,
      NEW.id,
      'task_rejected',
      'Your task "' || NEW.name || '" has been rejected',
      false
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Step 9: Recreate the trigger
CREATE TRIGGER notify_task_approval_needed
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_approval_needed();