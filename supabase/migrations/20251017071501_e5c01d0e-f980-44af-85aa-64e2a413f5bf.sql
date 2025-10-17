-- Delete all task notifications (child records)
DELETE FROM public.task_notifications;

-- Delete all tasks (parent records)
DELETE FROM public.tasks;