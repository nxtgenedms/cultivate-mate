-- Create task category enum with 14 types
CREATE TYPE task_category AS ENUM (
  'daily_cloning_transplant',
  'mortality_discard',
  'weekly_cultivation',
  'clonator_weekly',
  'soil_moisture',
  'scouting_corrective',
  'chemical_delivery',
  'fertigation_application',
  'ipm_chemical_mixing',
  'hygiene_check',
  'cultivation_cleaning',
  'processing_cleaning',
  'pre_harvest',
  'final_harvest'
);

-- Create priority level enum
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Add task category to checklist templates
ALTER TABLE checklist_templates 
ADD COLUMN task_category task_category NULL;

-- Add approval workflow fields to tasks table
ALTER TABLE tasks 
ADD COLUMN task_category task_category NULL,
ADD COLUMN approval_status text DEFAULT 'draft',
ADD COLUMN current_approval_stage integer DEFAULT 0,
ADD COLUMN approval_history jsonb DEFAULT '[]'::jsonb,
ADD COLUMN rejection_reason text NULL,
ADD COLUMN priority_level task_priority DEFAULT 'medium';

-- Create task notifications table
CREATE TABLE task_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on task_notifications
ALTER TABLE task_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON task_notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON task_notifications FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert notifications (via functions)
CREATE POLICY "System can insert notifications"
ON task_notifications FOR INSERT
WITH CHECK (true);

-- Delete existing test tasks
DELETE FROM tasks;

-- Update create_task_from_checklist function to inherit category
CREATE OR REPLACE FUNCTION public.create_task_from_checklist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  template_record RECORD;
  checklist_items_array JSONB;
  task_number TEXT;
  task_count INTEGER;
BEGIN
  -- Get template info including task_category
  SELECT template_name, sof_number, description, task_category
  INTO template_record
  FROM checklist_templates
  WHERE id = NEW.template_id;
  
  -- Build checklist items array from template items
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'label', item_label,
      'section', section_name,
      'is_required', is_required,
      'completed', false,
      'notes', '',
      'sort_order', sort_order
    ) ORDER BY sort_order
  )
  INTO checklist_items_array
  FROM checklist_template_items
  WHERE template_id = NEW.template_id
    AND is_required = true;
  
  -- Generate task number
  SELECT COUNT(*) INTO task_count FROM tasks;
  task_number := 'TA-' || LPAD((task_count + 1)::TEXT, 4, '0');
  
  -- Create ONE task with embedded checklist items and inherited category
  INSERT INTO tasks (
    task_number,
    name,
    description,
    status,
    batch_id,
    checklist_id,
    template_item_id,
    checklist_items,
    completion_progress,
    created_by,
    assignee,
    task_category,
    approval_status
  ) VALUES (
    task_number,
    template_record.sof_number || ': ' || template_record.template_name,
    template_record.description,
    'in_progress',
    NEW.batch_id,
    NEW.id,
    NULL,
    COALESCE(checklist_items_array, '[]'::jsonb),
    jsonb_build_object(
      'completed', 0,
      'total', COALESCE(jsonb_array_length(checklist_items_array), 0)
    ),
    NEW.created_by,
    NEW.created_by,
    template_record.task_category,
    CASE WHEN template_record.task_category IS NOT NULL THEN 'draft' ELSE NULL END
  );
  
  RETURN NEW;
END;
$function$;