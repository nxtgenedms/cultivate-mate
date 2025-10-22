-- Update all existing tasks with 'pending' status to 'in_progress'
UPDATE tasks 
SET status = 'in_progress' 
WHERE status = 'pending';