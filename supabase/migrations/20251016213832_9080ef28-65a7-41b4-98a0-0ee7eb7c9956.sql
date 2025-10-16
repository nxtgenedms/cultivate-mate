-- Drop tables first (this will cascade to triggers)
DROP TABLE IF EXISTS public.sof_audit_history CASCADE;
DROP TABLE IF EXISTS public.sof_fields CASCADE;
DROP TABLE IF EXISTS public.sofs CASCADE;

-- Drop functions (they should now have no dependencies)
DROP FUNCTION IF EXISTS public.log_sof_changes() CASCADE;
DROP FUNCTION IF EXISTS public.log_sof_field_changes() CASCADE;