-- Add receipt_file_path column to inventory_receipts table
ALTER TABLE public.inventory_receipts
ADD COLUMN IF NOT EXISTS receipt_file_path text;