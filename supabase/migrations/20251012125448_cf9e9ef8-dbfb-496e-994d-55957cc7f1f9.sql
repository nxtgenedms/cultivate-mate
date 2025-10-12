-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  assignee UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'draft',
  description TEXT,
  CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled'))
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view tasks they created or are assigned to"
ON public.tasks
FOR SELECT
USING (
  created_by = auth.uid() OR 
  assignee = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('manager', 'supervisor', 'it_admin', 'business_admin')
  )
);

CREATE POLICY "Users can create tasks"
ON public.tasks
FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own tasks or assigned tasks"
ON public.tasks
FOR UPDATE
USING (
  created_by = auth.uid() OR 
  assignee = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('manager', 'supervisor', 'it_admin', 'business_admin')
  )
);

CREATE POLICY "Managers can delete tasks"
ON public.tasks
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('manager', 'supervisor', 'it_admin', 'business_admin')
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert nomenclature template for tasks
INSERT INTO public.nomenclature_templates (
  entity_type,
  format_pattern,
  description,
  is_active
) VALUES (
  'task',
  'TA-{counter:4}',
  'Task number nomenclature: TA-XXXX (e.g., TA-0001, TA-0002)',
  true
);