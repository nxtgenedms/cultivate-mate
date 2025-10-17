-- Recreate checklist_templates table
CREATE TABLE IF NOT EXISTS public.checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  sof_number TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'on_demand')),
  is_batch_specific BOOLEAN DEFAULT false,
  lifecycle_phase TEXT,
  task_category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Recreate checklist_template_items table
CREATE TABLE IF NOT EXISTS public.checklist_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  section_name TEXT,
  item_label TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('checkbox', 'text', 'number', 'date', 'textarea')),
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Recreate checklist_instances table
CREATE TABLE IF NOT EXISTS public.checklist_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batch_lifecycle_records(id) ON DELETE SET NULL,
  instance_name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  created_by UUID REFERENCES auth.users(id),
  completed_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Recreate checklist_item_responses table
CREATE TABLE IF NOT EXISTS public.checklist_item_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.checklist_instances(id) ON DELETE CASCADE,
  template_item_id UUID NOT NULL REFERENCES public.checklist_template_items(id) ON DELETE CASCADE,
  response_value TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_item_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for checklist_templates
CREATE POLICY "Users can view active templates"
  ON public.checklist_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage templates"
  ON public.checklist_templates FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for checklist_template_items
CREATE POLICY "Users can view template items"
  ON public.checklist_template_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage template items"
  ON public.checklist_template_items FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for checklist_instances
CREATE POLICY "Users can view checklist instances"
  ON public.checklist_instances FOR SELECT
  USING (true);

CREATE POLICY "Authorized users can create instances"
  ON public.checklist_instances FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

CREATE POLICY "Authorized users can update instances"
  ON public.checklist_instances FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

-- RLS Policies for checklist_item_responses
CREATE POLICY "Users can view responses"
  ON public.checklist_item_responses FOR SELECT
  USING (true);

CREATE POLICY "Users can create responses"
  ON public.checklist_item_responses FOR INSERT
  WITH CHECK (
    completed_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

CREATE POLICY "Users can update responses"
  ON public.checklist_item_responses FOR UPDATE
  USING (
    completed_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_checklist_templates_updated_at
  BEFORE UPDATE ON public.checklist_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_checklist_template_items_updated_at
  BEFORE UPDATE ON public.checklist_template_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_checklist_instances_updated_at
  BEFORE UPDATE ON public.checklist_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_checklist_item_responses_updated_at
  BEFORE UPDATE ON public.checklist_item_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();