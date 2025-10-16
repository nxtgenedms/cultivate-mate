-- Create storage bucket for receipt attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipt-attachments', 'receipt-attachments', false);

-- Add receipt_file_path column to inventory_receipts table
ALTER TABLE public.inventory_receipts
ADD COLUMN receipt_file_path text;

-- Create RLS policies for receipt-attachments bucket
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipt-attachments' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can view receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'receipt-attachments');

CREATE POLICY "Authenticated users can update their receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'receipt-attachments');

CREATE POLICY "Admins can delete receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipt-attachments' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('it_admin', 'business_admin', 'manager')
  )
);