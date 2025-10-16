-- Create enum types for checklist system
CREATE TYPE checklist_frequency AS ENUM ('daily', 'weekly', 'monthly', 'on_demand');
CREATE TYPE checklist_item_type AS ENUM ('boolean', 'yes_no', 'text', 'number', 'date', 'signature', 'multi_day_boolean');

-- Create checklist_templates table (Admin manages)
CREATE TABLE public.checklist_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  sof_number TEXT NOT NULL,
  description TEXT,
  frequency checklist_frequency NOT NULL DEFAULT 'on_demand',
  is_batch_specific BOOLEAN NOT NULL DEFAULT false,
  lifecycle_phase batch_lifecycle_stage,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create checklist_template_items table (Items within templates)
CREATE TABLE public.checklist_template_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  section_name TEXT,
  item_label TEXT NOT NULL,
  item_type checklist_item_type NOT NULL DEFAULT 'yes_no',
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create checklist_instances table (User-created checklists)
CREATE TABLE public.checklist_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.checklist_templates(id),
  batch_id UUID REFERENCES public.batch_lifecycle_records(id),
  instance_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  week_starting DATE,
  week_ending DATE,
  completed_by UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create checklist_item_responses table (User responses to checklist items)
CREATE TABLE public.checklist_item_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.checklist_instances(id) ON DELETE CASCADE,
  template_item_id UUID NOT NULL REFERENCES public.checklist_template_items(id),
  response_value TEXT,
  response_data JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  action_required BOOLEAN DEFAULT false,
  action_taken TEXT,
  reported_to UUID REFERENCES public.profiles(id),
  action_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create checklist_signatures table (Digital signatures)
CREATE TABLE public.checklist_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.checklist_instances(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  signed_by UUID REFERENCES public.profiles(id),
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  signature_type TEXT NOT NULL DEFAULT 'approval',
  UNIQUE(instance_id, role)
);

-- Create checklist_batch_records table (For daily cloning records with multiple batches)
CREATE TABLE public.checklist_batch_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.checklist_instances(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batch_lifecycle_records(id),
  strain TEXT,
  batch_number TEXT,
  mother_id TEXT,
  total_clones INTEGER,
  dome_no TEXT,
  projected_transplant_date DATE,
  date_transplanted DATE,
  total_transplanted INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create checklist_task_rules table (Auto-generate tasks based on checklist results)
CREATE TABLE public.checklist_task_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  template_item_id UUID REFERENCES public.checklist_template_items(id),
  trigger_condition TEXT NOT NULL,
  task_name_template TEXT NOT NULL,
  task_description_template TEXT,
  due_date_offset_days INTEGER DEFAULT 1,
  assign_to_role app_role,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_item_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_batch_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_task_rules ENABLE ROW LEVEL SECURITY;

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
  USING (EXISTS (
    SELECT 1 FROM public.checklist_templates
    WHERE id = template_id AND is_active = true
  ));

CREATE POLICY "Admins can manage template items"
  ON public.checklist_template_items FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for checklist_instances
CREATE POLICY "Users can view checklists"
  ON public.checklist_instances FOR SELECT
  USING (true);

CREATE POLICY "Authorized users can create checklists"
  ON public.checklist_instances FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('assistant_grower', 'grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

CREATE POLICY "Authorized users can update checklists"
  ON public.checklist_instances FOR UPDATE
  USING (
    created_by = auth.uid() OR
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

CREATE POLICY "Authorized users can manage responses"
  ON public.checklist_item_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM checklist_instances
      WHERE id = instance_id
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
      ))
    )
  );

-- RLS Policies for checklist_signatures
CREATE POLICY "Users can view signatures"
  ON public.checklist_signatures FOR SELECT
  USING (true);

CREATE POLICY "Authorized users can sign checklists"
  ON public.checklist_signatures FOR INSERT
  WITH CHECK (
    signed_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

-- RLS Policies for checklist_batch_records
CREATE POLICY "Users can view batch records"
  ON public.checklist_batch_records FOR SELECT
  USING (true);

CREATE POLICY "Authorized users can manage batch records"
  ON public.checklist_batch_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM checklist_instances
      WHERE id = instance_id
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('assistant_grower', 'grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
      ))
    )
  );

-- RLS Policies for checklist_task_rules
CREATE POLICY "Users can view active task rules"
  ON public.checklist_task_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage task rules"
  ON public.checklist_task_rules FOR ALL
  USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_checklist_templates_active ON public.checklist_templates(is_active);
CREATE INDEX idx_checklist_templates_batch_specific ON public.checklist_templates(is_batch_specific);
CREATE INDEX idx_checklist_template_items_template ON public.checklist_template_items(template_id);
CREATE INDEX idx_checklist_instances_template ON public.checklist_instances(template_id);
CREATE INDEX idx_checklist_instances_batch ON public.checklist_instances(batch_id);
CREATE INDEX idx_checklist_instances_status ON public.checklist_instances(status);
CREATE INDEX idx_checklist_item_responses_instance ON public.checklist_item_responses(instance_id);
CREATE INDEX idx_checklist_batch_records_instance ON public.checklist_batch_records(instance_id);

-- Create trigger for updated_at
CREATE TRIGGER update_checklist_templates_updated_at
  BEFORE UPDATE ON public.checklist_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_checklist_instances_updated_at
  BEFORE UPDATE ON public.checklist_instances
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_checklist_item_responses_updated_at
  BEFORE UPDATE ON public.checklist_item_responses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();