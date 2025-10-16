-- Create enum for receipt types
CREATE TYPE public.inventory_receipt_type AS ENUM (
  'chemical',
  'fertilizer',
  'seeds',
  'growing_media',
  'packaging',
  'equipment',
  'harvest_output',
  'other'
);

-- Create enum for quantity units
CREATE TYPE public.inventory_unit AS ENUM (
  'kg',
  'g',
  'l',
  'ml',
  'units',
  'boxes',
  'bags',
  'packs'
);

-- Create inventory receipts table
CREATE TABLE public.inventory_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_number TEXT NOT NULL UNIQUE,
  receipt_type inventory_receipt_type NOT NULL,
  
  -- Date and time info
  receipt_date DATE NOT NULL,
  receipt_time TIME NOT NULL,
  month TEXT NOT NULL,
  
  -- People involved
  responsible_person_id UUID REFERENCES auth.users(id),
  received_by_id UUID NOT NULL REFERENCES auth.users(id),
  receiver_signature_id UUID REFERENCES auth.users(id),
  
  -- Product details
  product_name TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit inventory_unit NOT NULL,
  usage_area TEXT,
  
  -- Additional info
  batch_number TEXT, -- For harvest outputs
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all inventory receipts"
  ON public.inventory_receipts
  FOR SELECT
  USING (true);

CREATE POLICY "Authorized users can create inventory receipts"
  ON public.inventory_receipts
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('assistant_grower', 'grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

CREATE POLICY "Authorized users can update inventory receipts"
  ON public.inventory_receipts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

-- Create index for faster queries
CREATE INDEX idx_inventory_receipts_date ON public.inventory_receipts(receipt_date DESC);
CREATE INDEX idx_inventory_receipts_type ON public.inventory_receipts(receipt_type);
CREATE INDEX idx_inventory_receipts_responsible ON public.inventory_receipts(responsible_person_id);

-- Trigger for updated_at
CREATE TRIGGER update_inventory_receipts_updated_at
  BEFORE UPDATE ON public.inventory_receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION public.generate_receipt_number(receipt_date DATE DEFAULT CURRENT_DATE)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  date_prefix TEXT;
  daily_count INTEGER;
  new_receipt_number TEXT;
BEGIN
  -- Format date as YYYYMMDD
  date_prefix := TO_CHAR(receipt_date, 'YYYYMMDD');
  
  -- Count existing receipts for this date
  SELECT COUNT(*) + 1 INTO daily_count
  FROM inventory_receipts
  WHERE receipt_number LIKE 'RCP-' || date_prefix || '-%';
  
  -- Generate new receipt number: RCP-YYYYMMDD-XXX
  new_receipt_number := 'RCP-' || date_prefix || '-' || LPAD(daily_count::TEXT, 3, '0');
  
  RETURN new_receipt_number;
END;
$$;