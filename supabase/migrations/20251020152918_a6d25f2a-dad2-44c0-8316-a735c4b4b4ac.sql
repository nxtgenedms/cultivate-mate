-- Create a table to store daily counters for task numbers
CREATE TABLE IF NOT EXISTS public.task_number_counters (
  date_key date PRIMARY KEY,
  counter integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on the counter table
ALTER TABLE public.task_number_counters ENABLE ROW LEVEL SECURITY;

-- Allow the function to access this table
CREATE POLICY "Service role can manage counters"
  ON public.task_number_counters
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Drop and recreate the generate_task_number function with proper locking
DROP FUNCTION IF EXISTS public.generate_task_number(date);

CREATE OR REPLACE FUNCTION public.generate_task_number(creation_date date DEFAULT CURRENT_DATE)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  date_prefix TEXT;
  next_counter INTEGER;
  new_task_number TEXT;
BEGIN
  -- Format date as YYYYMMDD
  date_prefix := TO_CHAR(creation_date, 'YYYYMMDD');
  
  -- Use row-level locking to prevent race conditions
  -- Insert or update the counter atomically
  INSERT INTO public.task_number_counters (date_key, counter)
  VALUES (creation_date, 1)
  ON CONFLICT (date_key) 
  DO UPDATE SET 
    counter = task_number_counters.counter + 1,
    updated_at = now()
  RETURNING counter INTO next_counter;
  
  -- Generate new task number: TA-YYYYMMDD-XXX
  new_task_number := 'TA-' || date_prefix || '-' || LPAD(next_counter::TEXT, 3, '0');
  
  RETURN new_task_number;
END;
$function$;