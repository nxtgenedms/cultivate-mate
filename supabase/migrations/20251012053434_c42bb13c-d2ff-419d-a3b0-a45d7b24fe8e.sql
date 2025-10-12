-- Create audit history table for tracking changes to SOFs and fields
CREATE TABLE IF NOT EXISTS public.sof_audit_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sof_id UUID REFERENCES public.sofs(id) ON DELETE CASCADE,
  field_id UUID REFERENCES public.sof_fields(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'activated', 'deactivated'
  table_name TEXT NOT NULL, -- 'sofs' or 'sof_fields'
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  change_description TEXT
);

-- Create index for faster queries
CREATE INDEX idx_sof_audit_history_sof_id ON public.sof_audit_history(sof_id);
CREATE INDEX idx_sof_audit_history_field_id ON public.sof_audit_history(field_id);
CREATE INDEX idx_sof_audit_history_record_id ON public.sof_audit_history(record_id);
CREATE INDEX idx_sof_audit_history_changed_at ON public.sof_audit_history(changed_at DESC);

-- Enable RLS
ALTER TABLE public.sof_audit_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view audit history
CREATE POLICY "Users can view audit history"
ON public.sof_audit_history
FOR SELECT
USING (true);

-- Policy: System can insert audit records (admins only)
CREATE POLICY "Admins can insert audit history"
ON public.sof_audit_history
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Function to automatically log SOF changes
CREATE OR REPLACE FUNCTION public.log_sof_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.sof_audit_history (
      sof_id, table_name, record_id, action, new_values, changed_by, change_description
    ) VALUES (
      NEW.id, 'sofs', NEW.id, 'created', to_jsonb(NEW), auth.uid(), 'SOF created'
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.sof_audit_history (
      sof_id, table_name, record_id, action, old_values, new_values, changed_by, change_description
    ) VALUES (
      NEW.id, 'sofs', NEW.id, 'updated', to_jsonb(OLD), to_jsonb(NEW), auth.uid(), 'SOF updated'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.sof_audit_history (
      sof_id, table_name, record_id, action, old_values, changed_by, change_description
    ) VALUES (
      OLD.id, 'sofs', OLD.id, 'deleted', to_jsonb(OLD), auth.uid(), 'SOF deleted'
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to automatically log SOF field changes
CREATE OR REPLACE FUNCTION public.log_sof_field_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.sof_audit_history (
      sof_id, field_id, table_name, record_id, action, new_values, changed_by, change_description
    ) VALUES (
      NEW.sof_id, NEW.id, 'sof_fields', NEW.id, 'created', to_jsonb(NEW), auth.uid(), 'Field created'
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.sof_audit_history (
      sof_id, field_id, table_name, record_id, action, old_values, new_values, changed_by, change_description
    ) VALUES (
      NEW.sof_id, NEW.id, 'sof_fields', NEW.id, 'updated', to_jsonb(OLD), to_jsonb(NEW), auth.uid(), 'Field updated'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.sof_audit_history (
      sof_id, field_id, table_name, record_id, action, old_values, changed_by, change_description
    ) VALUES (
      OLD.sof_id, OLD.id, 'sof_fields', OLD.id, 'deleted', to_jsonb(OLD), auth.uid(), 'Field deleted'
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for SOFs table
CREATE TRIGGER sof_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.sofs
FOR EACH ROW EXECUTE FUNCTION public.log_sof_changes();

-- Create triggers for SOF fields table
CREATE TRIGGER sof_field_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.sof_fields
FOR EACH ROW EXECUTE FUNCTION public.log_sof_field_changes();