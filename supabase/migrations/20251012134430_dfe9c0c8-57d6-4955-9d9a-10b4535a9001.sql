-- Update generate_batch_number function to follow nomenclature template B-[YYYYMMDD]-{seq}
CREATE OR REPLACE FUNCTION public.generate_batch_number(creation_date date DEFAULT CURRENT_DATE)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  date_prefix TEXT;
  daily_count INTEGER;
  new_batch_number TEXT;
BEGIN
  -- Format date as YYYYMMDD
  date_prefix := TO_CHAR(creation_date, 'YYYYMMDD');
  
  -- Count existing batches for this date
  SELECT COUNT(*) + 1 INTO daily_count
  FROM batch_lifecycle_records
  WHERE batch_number LIKE 'B-' || date_prefix || '-%';
  
  -- Generate new batch number following nomenclature: B-YYYYMMDD-XXX
  new_batch_number := 'B-' || date_prefix || '-' || LPAD(daily_count::TEXT, 3, '0');
  
  RETURN new_batch_number;
END;
$function$;