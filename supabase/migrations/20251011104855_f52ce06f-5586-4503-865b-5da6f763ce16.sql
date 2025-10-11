-- Create enum for batch lifecycle stages
CREATE TYPE batch_lifecycle_stage AS ENUM (
  'cloning',
  'hardening', 
  'veg',
  'flowering',
  'harvest',
  'processing',
  'drying',
  'packing',
  'completed'
);

-- Create batch lifecycle records table
CREATE TABLE batch_lifecycle_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id),
  
  -- Header Information
  batch_number TEXT NOT NULL,
  strain_id UUID,
  dome_no TEXT,
  mother_no TEXT,
  clone_germination_date DATE,
  total_clones_plants INTEGER,
  clonator_1 TEXT,
  rack_no TEXT,
  
  -- Stage 1: Cloning/Rooting
  clonator_mortalities INTEGER,
  expected_rooting_date DATE,
  actual_rooting_date DATE,
  clonator_2 TEXT,
  clonator_2_date DATE,
  clonator_2_number_clones INTEGER,
  clonator_2_area_placed TEXT,
  clonator_2_rack_no TEXT,
  clonator_2_completed_by UUID REFERENCES profiles(id),
  clonator_2_no_of_days INTEGER,
  
  -- Stage 2: Hardening
  move_to_hardening_date DATE,
  hardening_number_clones INTEGER,
  hardening_area_placed TEXT,
  hardening_rack_no TEXT,
  hardening_completed_by UUID REFERENCES profiles(id),
  hardening_no_of_days INTEGER,
  hardening_mortalities JSONB DEFAULT '[]'::jsonb,
  hardening_grower_sign UUID REFERENCES profiles(id),
  hardening_grower_sign_date TIMESTAMP WITH TIME ZONE,
  hardening_manager_sign UUID REFERENCES profiles(id),
  hardening_manager_sign_date TIMESTAMP WITH TIME ZONE,
  hardening_qa_sign UUID REFERENCES profiles(id),
  hardening_qa_sign_date TIMESTAMP WITH TIME ZONE,
  
  -- Stage 3: Veg
  move_to_veg_date DATE,
  veg_number_plants INTEGER,
  veg_table_no TEXT,
  veg_completed_by UUID REFERENCES profiles(id),
  veg_diseases BOOLEAN DEFAULT false,
  veg_pests BOOLEAN DEFAULT false,
  veg_mortalities JSONB DEFAULT '[]'::jsonb,
  veg_expected_days INTEGER,
  veg_actual_days INTEGER,
  
  -- Stage 4: Flowering/Grow Room
  move_to_flowering_date DATE,
  flowering_number_plants INTEGER,
  flowering_table_no TEXT,
  flowering_completed_by UUID REFERENCES profiles(id),
  flowering_grower_sign UUID REFERENCES profiles(id),
  flowering_grower_sign_date TIMESTAMP WITH TIME ZONE,
  flowering_manager_sign UUID REFERENCES profiles(id),
  flowering_manager_sign_date TIMESTAMP WITH TIME ZONE,
  flowering_qa_sign UUID REFERENCES profiles(id),
  flowering_qa_sign_date TIMESTAMP WITH TIME ZONE,
  nutrients_used TEXT,
  using_extra_lights BOOLEAN DEFAULT false,
  extra_lights_from_day INTEGER,
  extra_lights_no_of_days INTEGER,
  increase_in_yield TEXT,
  eight_nodes BOOLEAN DEFAULT false,
  expected_flowering_date DATE,
  estimated_days INTEGER,
  actual_flowering_date DATE,
  actual_days INTEGER,
  flowering_diseases BOOLEAN DEFAULT false,
  flowering_pests BOOLEAN DEFAULT false,
  flowering_mortalities JSONB DEFAULT '[]'::jsonb,
  
  -- Stage 5: Harvest
  harvest_date DATE,
  harvest_number_plants INTEGER,
  harvest_table_no TEXT,
  harvest_completed_by UUID REFERENCES profiles(id),
  harvest_grower_sign UUID REFERENCES profiles(id),
  harvest_grower_sign_date TIMESTAMP WITH TIME ZONE,
  harvest_manager_sign UUID REFERENCES profiles(id),
  harvest_manager_sign_date TIMESTAMP WITH TIME ZONE,
  harvest_qa_sign UUID REFERENCES profiles(id),
  harvest_qa_sign_date TIMESTAMP WITH TIME ZONE,
  
  -- Stage 6: Processing/Inspection
  inspection_date DATE,
  inspection_number_plants INTEGER,
  inspection_rack_no TEXT,
  inspection_table_no TEXT,
  inspection_completed_by UUID REFERENCES profiles(id),
  total_plants_processed INTEGER,
  total_wet_weight NUMERIC(10,2),
  processor_sign UUID REFERENCES profiles(id),
  processor_sign_date TIMESTAMP WITH TIME ZONE,
  processing_manager_sign UUID REFERENCES profiles(id),
  processing_manager_sign_date TIMESTAMP WITH TIME ZONE,
  processing_qa_sign UUID REFERENCES profiles(id),
  processing_qa_sign_date TIMESTAMP WITH TIME ZONE,
  
  -- Stage 7: Drying
  drying_date DATE,
  drying_rack_no TEXT,
  drying_total_plants INTEGER,
  drying_completed_by UUID REFERENCES profiles(id),
  drying_checked_by UUID REFERENCES profiles(id),
  no_of_days_drying INTEGER,
  total_dry_weight NUMERIC(10,2),
  dry_weight_no_plants INTEGER,
  dry_weight_completed_by UUID REFERENCES profiles(id),
  dry_weight_date DATE,
  dry_weight_checked_by UUID REFERENCES profiles(id),
  dry_weight_checked_date DATE,
  
  -- Stage 8: Packing
  packing_a_grade NUMERIC(10,2),
  packing_b_grade NUMERIC(10,2),
  packing_c_grade NUMERIC(10,2),
  packing_date DATE,
  packing_bag_ids TEXT,
  packing_storage_area TEXT,
  packing_completed_by UUID REFERENCES profiles(id),
  packing_checked_by UUID REFERENCES profiles(id),
  
  -- Stage 9: Mortality Summary
  mortality_total_amount_kg NUMERIC(10,2),
  mortality_total_percentage NUMERIC(5,2),
  mortality_general_reason TEXT,
  mortality_completed_by UUID REFERENCES profiles(id),
  mortality_checked_by UUID REFERENCES profiles(id),
  final_processor_sign UUID REFERENCES profiles(id),
  final_processor_sign_date DATE,
  final_manager_sign UUID REFERENCES profiles(id),
  final_manager_sign_date DATE,
  final_qa_sign UUID REFERENCES profiles(id),
  final_qa_sign_date DATE,
  
  -- Meta
  current_stage batch_lifecycle_stage DEFAULT 'cloning',
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE batch_lifecycle_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view batch lifecycle records"
  ON batch_lifecycle_records FOR SELECT
  USING (true);

CREATE POLICY "Growers and above can create batch lifecycle records"
  ON batch_lifecycle_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

CREATE POLICY "Growers and above can update batch lifecycle records"
  ON batch_lifecycle_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('grower', 'manager', 'supervisor', 'qa', 'it_admin', 'business_admin')
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_batch_lifecycle_records_updated_at
  BEFORE UPDATE ON batch_lifecycle_records
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();