-- Create trigger function to handle SOF04 completion tagging
CREATE OR REPLACE FUNCTION public.handle_sof04_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  completion_tag text;
  week_number text;
BEGIN
  -- Only proceed if task is marked as completed and is SOF04
  IF NEW.status = 'completed' AND OLD.status != 'completed' 
     AND NEW.name LIKE 'SOF04:%' AND NEW.batch_id IS NOT NULL THEN
    
    -- Get ISO week number
    week_number := TO_CHAR(CURRENT_DATE, 'IYYY-IW');
    
    -- Generate tag with week number
    completion_tag := 'SOF04-COMPLETED-WEEK-' || week_number;
    
    -- Add tag to batch record if not already present
    UPDATE public.batch_lifecycle_records
    SET tags = array_append(tags, completion_tag)
    WHERE id = NEW.batch_id
      AND NOT (tags @> ARRAY[completion_tag]);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for SOF04 completion
DROP TRIGGER IF EXISTS on_sof04_task_completed ON public.tasks;
CREATE TRIGGER on_sof04_task_completed
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sof04_completion();