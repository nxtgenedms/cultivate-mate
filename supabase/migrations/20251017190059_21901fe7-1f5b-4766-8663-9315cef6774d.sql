-- Add lifecycle_stage column to tasks table to track which batch lifecycle stage the task is for
ALTER TABLE public.tasks
ADD COLUMN lifecycle_stage batch_lifecycle_stage;

-- Add index for better query performance
CREATE INDEX idx_tasks_lifecycle_stage ON public.tasks(lifecycle_stage);

-- Add comment for clarity
COMMENT ON COLUMN public.tasks.lifecycle_stage IS 'The batch lifecycle stage this task is associated with';