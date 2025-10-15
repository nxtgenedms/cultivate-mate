-- Add batch_id to tasks table to link tasks to batches
ALTER TABLE public.tasks
ADD COLUMN batch_id uuid REFERENCES public.batch_lifecycle_records(id) ON DELETE CASCADE;

-- Add tags array to batch_lifecycle_records for tagging completed checks
ALTER TABLE public.batch_lifecycle_records
ADD COLUMN tags text[] DEFAULT '{}';

-- Create index for better performance on batch_id lookups
CREATE INDEX idx_tasks_batch_id ON public.tasks(batch_id);
CREATE INDEX idx_tasks_batch_date ON public.tasks(batch_id, created_at);

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests to edge functions
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to handle post-completion tagging
CREATE OR REPLACE FUNCTION public.handle_sof12_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  completion_tag text;
BEGIN
  -- Only proceed if task is marked as completed and is SOF12
  IF NEW.status = 'completed' AND OLD.status != 'completed' 
     AND NEW.name LIKE 'SOF12:%' AND NEW.batch_id IS NOT NULL THEN
    
    -- Generate tag with current date
    completion_tag := 'SOF12-Completed-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    -- Add tag to batch record if not already present
    UPDATE public.batch_lifecycle_records
    SET tags = array_append(tags, completion_tag)
    WHERE id = NEW.batch_id
      AND NOT (tags @> ARRAY[completion_tag]);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for post-completion tagging
DROP TRIGGER IF EXISTS trigger_sof12_completion ON public.tasks;
CREATE TRIGGER trigger_sof12_completion
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sof12_completion();

-- Schedule daily task creation at 7:00 AM SAST (5:00 AM UTC)
SELECT cron.schedule(
  'daily-sof12-tasks',
  '0 5 * * *', -- 5:00 AM UTC = 7:00 AM SAST
  $$
  SELECT
    net.http_post(
      url:='https://mypfhpxtesqdjeytygkp.supabase.co/functions/v1/create-daily-sof12-tasks',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGZocHh0ZXNxZGpleXR5Z2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzI5OTMsImV4cCI6MjA3NTcwODk5M30.QoY-AGouUw4Cpg7z3b7C0V5Lx6wfph-nUkVR6ZMCzI0"}'::jsonb
    ) as request_id;
  $$
);