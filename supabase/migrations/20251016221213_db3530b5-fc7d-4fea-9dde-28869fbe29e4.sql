-- Fix search path for notification function
CREATE OR REPLACE FUNCTION public.notify_task_approval_needed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- When task status changes to pending_approval or when submitted
  IF (NEW.approval_status = 'pending_approval' AND 
      (OLD.approval_status IS NULL OR OLD.approval_status != 'pending_approval')) THEN
    
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
  
  -- When task is approved, notify the creator
  IF (NEW.approval_status = 'approved' AND 
      (OLD.approval_status IS NULL OR OLD.approval_status != 'approved')) THEN
    
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
      'Your task "' || NEW.name || '" has been approved',
      false
    );
  END IF;
  
  -- When task is rejected, notify the creator
  IF (NEW.approval_status = 'rejected' AND 
      (OLD.approval_status IS NULL OR OLD.approval_status != 'rejected')) THEN
    
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
$$;