-- Create inventory usage tracking table
CREATE TABLE public.inventory_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usage_date DATE NOT NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit inventory_unit NOT NULL,
  batch_number TEXT,
  usage_area TEXT,
  used_by UUID,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all inventory usage"
  ON public.inventory_usage
  FOR SELECT
  USING (true);

CREATE POLICY "Authorized users can create inventory usage"
  ON public.inventory_usage
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('assistant_grower', 'grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

CREATE POLICY "Authorized users can update inventory usage"
  ON public.inventory_usage
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER handle_inventory_usage_updated_at
  BEFORE UPDATE ON public.inventory_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better performance
CREATE INDEX idx_inventory_usage_product ON public.inventory_usage(product_name);
CREATE INDEX idx_inventory_usage_date ON public.inventory_usage(usage_date);
CREATE INDEX idx_inventory_usage_batch ON public.inventory_usage(batch_number);