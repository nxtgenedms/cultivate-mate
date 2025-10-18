-- Update invalid task_category value in checklist_templates
UPDATE checklist_templates
SET task_category = 'daily_cloning_transplant'
WHERE task_category = 'cloning_pre_start';