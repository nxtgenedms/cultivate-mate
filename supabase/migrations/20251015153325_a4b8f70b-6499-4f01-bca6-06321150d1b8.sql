-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- First, try to unschedule if it exists (ignore errors if it doesn't exist)
DO $$
BEGIN
  PERFORM cron.unschedule('create-weekly-batch-tasks');
EXCEPTION WHEN OTHERS THEN
  -- Job doesn't exist, continue
  NULL;
END
$$;

-- Schedule weekly batch task creation
-- Runs every Monday at 7:00 AM UTC (9:00 AM SAST)
SELECT cron.schedule(
  'create-weekly-batch-tasks',
  '0 7 * * 1',
  $$
  SELECT
    net.http_post(
        url:='https://mypfhpxtesqdjeytygkp.supabase.co/functions/v1/create-weekly-batch-tasks',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGZocHh0ZXNxZGpleXR5Z2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzI5OTMsImV4cCI6MjA3NTcwODk5M30.QoY-AGouUw4Cpg7z3b7C0V5Lx6wfph-nUkVR6ZMCzI0"}'::jsonb,
        body:=concat('{"triggered_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
