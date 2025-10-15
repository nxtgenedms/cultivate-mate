-- Step 1: Remove default value temporarily
ALTER TABLE public.batch_lifecycle_records 
  ALTER COLUMN current_stage DROP DEFAULT;

-- Step 2: Update batch_lifecycle_stage enum to only have 4 primary phases
ALTER TYPE batch_lifecycle_stage RENAME TO batch_lifecycle_stage_old;
CREATE TYPE batch_lifecycle_stage AS ENUM ('cloning', 'vegetative', 'flowering', 'harvest');

-- Step 3: Update the column to use new enum with mapping
ALTER TABLE public.batch_lifecycle_records 
  ALTER COLUMN current_stage TYPE batch_lifecycle_stage 
  USING (
    CASE 
      WHEN current_stage::text IN ('cloning', 'rooting') THEN 'cloning'::batch_lifecycle_stage
      WHEN current_stage::text IN ('hardening', 'vegetative') THEN 'vegetative'::batch_lifecycle_stage
      WHEN current_stage::text = 'flowering' THEN 'flowering'::batch_lifecycle_stage
      WHEN current_stage::text IN ('harvest', 'processing', 'drying', 'packing') THEN 'harvest'::batch_lifecycle_stage
      ELSE 'cloning'::batch_lifecycle_stage
    END
  );

-- Step 4: Set new default value
ALTER TABLE public.batch_lifecycle_records 
  ALTER COLUMN current_stage SET DEFAULT 'cloning'::batch_lifecycle_stage;

-- Step 5: Drop old enum type
DROP TYPE batch_lifecycle_stage_old;

-- Create trigger function to handle stage changes
CREATE OR REPLACE FUNCTION public.handle_batch_stage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    
    -- SOF04 tasks should be cancelled when moving out of Cloning
    IF OLD.current_stage = 'cloning' AND NEW.current_stage != 'cloning' THEN
      UPDATE public.tasks
      SET status = 'cancelled'
      WHERE batch_id = NEW.id
        AND status IN ('pending', 'in_progress')
        AND name LIKE 'SOF04:%';
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for stage changes
DROP TRIGGER IF EXISTS on_batch_stage_change ON public.batch_lifecycle_records;
CREATE TRIGGER on_batch_stage_change
  BEFORE UPDATE ON public.batch_lifecycle_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_batch_stage_change();