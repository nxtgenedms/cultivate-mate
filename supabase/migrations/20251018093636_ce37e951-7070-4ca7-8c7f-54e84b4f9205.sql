-- Fix incorrect lifecycle_phase value in checklist templates
-- The enum value should be 'clone_germination' not 'cloning'
UPDATE checklist_templates 
SET lifecycle_phase = 'clone_germination'
WHERE lifecycle_phase = 'cloning';