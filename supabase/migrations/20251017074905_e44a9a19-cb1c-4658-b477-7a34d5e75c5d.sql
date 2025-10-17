-- Drop checklist and log related tables and their triggers/functions

-- Drop function with CASCADE to remove dependent triggers
DROP FUNCTION IF EXISTS public.create_task_from_checklist() CASCADE;

-- Drop tables in order (child tables first, then parent tables)
DROP TABLE IF EXISTS checklist_signatures CASCADE;
DROP TABLE IF EXISTS checklist_item_responses CASCADE;
DROP TABLE IF EXISTS checklist_batch_records CASCADE;
DROP TABLE IF EXISTS checklist_instances CASCADE;
DROP TABLE IF EXISTS checklist_template_items CASCADE;
DROP TABLE IF EXISTS checklist_templates CASCADE;
DROP TABLE IF EXISTS cloning_transplant_logs CASCADE;
DROP TABLE IF EXISTS cloning_pre_start_checklists CASCADE;