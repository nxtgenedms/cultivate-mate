-- Create atomic task number generator function
CREATE OR REPLACE FUNCTION public.generate_task_number(creation_date date DEFAULT CURRENT_DATE)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  date_prefix TEXT;
  daily_count INTEGER;
  new_task_number TEXT;
BEGIN
  -- Format date as YYYYMMDD
  date_prefix := TO_CHAR(creation_date, 'YYYYMMDD');
  
  -- Count existing tasks for this date and get next number
  SELECT COUNT(*) + 1 INTO daily_count
  FROM tasks
  WHERE task_number LIKE 'TA-' || date_prefix || '-%';
  
  -- Generate new task number: TA-YYYYMMDD-XXX
  new_task_number := 'TA-' || date_prefix || '-' || LPAD(daily_count::TEXT, 3, '0');
  
  RETURN new_task_number;
END;
$function$;