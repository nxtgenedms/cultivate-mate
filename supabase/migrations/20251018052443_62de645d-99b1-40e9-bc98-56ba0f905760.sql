-- Add missing "checked_by" fields for mortality tracking across stages
-- These fields track who verified/checked mortality counts and reasons

ALTER TABLE public.batch_lifecycle_records
ADD COLUMN hardening_checked_by uuid REFERENCES auth.users(id),
ADD COLUMN veg_checked_by uuid REFERENCES auth.users(id),
ADD COLUMN flowering_checked_by uuid REFERENCES auth.users(id);

-- Add comments for clarity
COMMENT ON COLUMN public.batch_lifecycle_records.hardening_checked_by IS 'User who checked/verified hardening stage mortalities';
COMMENT ON COLUMN public.batch_lifecycle_records.veg_checked_by IS 'User who checked/verified vegetative stage mortalities';
COMMENT ON COLUMN public.batch_lifecycle_records.flowering_checked_by IS 'User who checked/verified flowering stage mortalities';