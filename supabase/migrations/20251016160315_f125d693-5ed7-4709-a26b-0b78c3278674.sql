-- First drop the old trigger
DROP TRIGGER IF EXISTS trigger_create_task_for_checklist_items ON checklist_instances;

-- Then drop the old function
DROP FUNCTION IF EXISTS create_task_for_checklist_items();