-- Add a field to store checklist items as part of the task
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS checklist_items jsonb DEFAULT '[]'::jsonb;

-- Add a field to track completion progress
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_progress jsonb DEFAULT '{"completed": 0, "total": 0}'::jsonb;

-- Add a comment to describe the structure
COMMENT ON COLUMN tasks.checklist_items IS 'Array of checklist items with structure: [{id, label, section, is_required, completed, notes}]';
COMMENT ON COLUMN tasks.completion_progress IS 'Tracks completion: {completed: number, total: number}';