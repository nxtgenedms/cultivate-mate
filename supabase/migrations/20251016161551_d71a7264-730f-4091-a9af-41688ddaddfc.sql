-- Enable realtime for tasks table so new tasks appear immediately
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;