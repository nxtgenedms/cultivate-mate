-- Initialize the counter table with existing task counts
INSERT INTO public.task_number_counters (date_key, counter)
SELECT 
  DATE(created_at) as date_key,
  COUNT(*) as counter
FROM public.tasks
GROUP BY DATE(created_at)
ON CONFLICT (date_key) DO UPDATE
SET counter = GREATEST(task_number_counters.counter, EXCLUDED.counter);