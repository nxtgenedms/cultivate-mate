-- Fix incorrect enum value in handle_batch_stage_change trigger
-- The enum value should be 'clone_germination' not 'cloning'
CREATE OR REPLACE FUNCTION public.handle_batch_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only proceed if stage has actually changed
  IF OLD.current_stage IS DISTINCT FROM NEW.current_stage THEN
    
    -- Log the stage change by appending to tags
    NEW.tags := array_append(
      NEW.tags, 
      'STAGE_CHANGE_' || TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS') || '_' || 
      UPPER(OLD.current_stage::text) || '_TO_' || UPPER(NEW.current_stage::text)
    );
    
    -- Cancel pending tasks from previous phase
    -- SOF12 tasks should be cancelled when moving to Harvest
    IF NEW.current_stage = 'harvest' THEN
      UPDATE public.tasks
      SET status = 'cancelled'
      WHERE batch_id = NEW.id
        AND status IN ('pending', 'in_progress')
        AND name LIKE 'SOF12:%';
    END IF;
    
    -- SOF04 tasks should be cancelled when moving out of Clone/Germination
    IF OLD.current_stage = 'clone_germination' AND NEW.current_stage != 'clone_germination' THEN
      UPDATE public.tasks
      SET status = 'cancelled'
      WHERE batch_id = NEW.id
        AND status IN ('pending', 'in_progress')
        AND name LIKE 'SOF04:%';
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$function$;