-- Add 'signature' to the allowed item_type values for checklist_template_items
ALTER TABLE public.checklist_template_items 
DROP CONSTRAINT IF EXISTS checklist_template_items_item_type_check;

ALTER TABLE public.checklist_template_items 
ADD CONSTRAINT checklist_template_items_item_type_check 
CHECK (item_type IN ('checkbox', 'text', 'number', 'date', 'textarea', 'signature'));