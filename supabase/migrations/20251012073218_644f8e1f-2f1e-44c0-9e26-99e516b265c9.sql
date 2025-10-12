-- Insert lookup categories for Strain ID, Mother ID, and Dome No
INSERT INTO public.lookup_categories (category_key, category_name, description, is_active)
VALUES 
  ('strain_id', 'Strain ID', 'Cannabis strain identifiers for batch tracking', true),
  ('mother_id', 'Mother ID', 'Mother plant identifiers for cloning', true),
  ('dome_no', 'Dome No', 'Dome numbers for cultivation tracking', true)
ON CONFLICT (category_key) DO NOTHING;

-- Get the category IDs (store them in variables for use in the next inserts)
DO $$
DECLARE
  strain_category_id uuid;
  mother_category_id uuid;
  dome_category_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO strain_category_id FROM public.lookup_categories WHERE category_key = 'strain_id';
  SELECT id INTO mother_category_id FROM public.lookup_categories WHERE category_key = 'mother_id';
  SELECT id INTO dome_category_id FROM public.lookup_categories WHERE category_key = 'dome_no';

  -- Insert sample values for Strain ID
  INSERT INTO public.lookup_values (category_id, value_key, value_display, sort_order, is_active)
  VALUES 
    (strain_category_id, 'strain_1', 'Strain 1', 1, true),
    (strain_category_id, 'strain_2', 'Strain 2', 2, true),
    (strain_category_id, 'strain_3', 'Strain 3', 3, true)
  ON CONFLICT DO NOTHING;

  -- Insert sample values for Mother ID
  INSERT INTO public.lookup_values (category_id, value_key, value_display, sort_order, is_active)
  VALUES 
    (mother_category_id, 'mother_a', 'Mother A', 1, true),
    (mother_category_id, 'mother_b', 'Mother B', 2, true),
    (mother_category_id, 'mother_c', 'Mother C', 3, true)
  ON CONFLICT DO NOTHING;

  -- Insert sample values for Dome No
  INSERT INTO public.lookup_values (category_id, value_key, value_display, sort_order, is_active)
  VALUES 
    (dome_category_id, 'dome_1', 'Dome 1', 1, true),
    (dome_category_id, 'dome_2', 'Dome 2', 2, true),
    (dome_category_id, 'dome_3', 'Dome 3', 3, true)
  ON CONFLICT DO NOTHING;
END $$;