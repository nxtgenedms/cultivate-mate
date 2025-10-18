-- Add product_type column to inventory_usage table
ALTER TABLE public.inventory_usage 
ADD COLUMN product_type inventory_receipt_type NOT NULL DEFAULT 'chemical';

-- Add comment for documentation
COMMENT ON COLUMN public.inventory_usage.product_type IS 'Type of product being used (chemical, fertilizer, etc.)';