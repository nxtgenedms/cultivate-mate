-- Phase 1: Update batch lifecycle stages from 4 to 9 stages (Fixed v2)

-- Step 1: Create new enum type with 9 stages
CREATE TYPE batch_lifecycle_stage_new AS ENUM (
  'preclone',
  'clone_germination',
  'hardening',
  'vegetative',
  'flowering_grow_room',
  'preharvest',
  'harvest',
  'processing_drying',
  'packing_storage'
);

-- Step 2: Remove default value from batch_lifecycle_records
ALTER TABLE batch_lifecycle_records 
ALTER COLUMN current_stage DROP DEFAULT;

-- Step 3: Update tasks table (convert enum to text)
ALTER TABLE tasks 
ALTER COLUMN lifecycle_stage TYPE text;

-- Step 4: Update task_field_mappings applicable_stages to text array
ALTER TABLE task_field_mappings 
ALTER COLUMN applicable_stages TYPE text[];

-- Step 5: Update batch_lifecycle_records current_stage to text
ALTER TABLE batch_lifecycle_records 
ALTER COLUMN current_stage TYPE text;

-- Step 6: Migrate data in batch_lifecycle_records
UPDATE batch_lifecycle_records
SET current_stage = CASE 
  WHEN current_stage = 'cloning' THEN 'clone_germination'
  WHEN current_stage = 'vegetative' THEN 'vegetative'
  WHEN current_stage = 'flowering' THEN 'flowering_grow_room'
  WHEN current_stage = 'harvest' THEN 'harvest'
  ELSE 'clone_germination'
END;

-- Step 7: Migrate data in tasks table
UPDATE tasks
SET lifecycle_stage = CASE 
  WHEN lifecycle_stage = 'cloning' THEN 'clone_germination'
  WHEN lifecycle_stage = 'vegetative' THEN 'vegetative'
  WHEN lifecycle_stage = 'flowering' THEN 'flowering_grow_room'
  WHEN lifecycle_stage = 'harvest' THEN 'harvest'
  ELSE lifecycle_stage
END
WHERE lifecycle_stage IS NOT NULL;

-- Step 8: Drop old enum type
DROP TYPE batch_lifecycle_stage;

-- Step 9: Rename new enum type to original name
ALTER TYPE batch_lifecycle_stage_new RENAME TO batch_lifecycle_stage;

-- Step 10: Convert batch_lifecycle_records current_stage back to enum with new default
ALTER TABLE batch_lifecycle_records 
ALTER COLUMN current_stage TYPE batch_lifecycle_stage USING current_stage::batch_lifecycle_stage;

ALTER TABLE batch_lifecycle_records 
ALTER COLUMN current_stage SET DEFAULT 'preclone'::batch_lifecycle_stage;

-- Step 11: Convert tasks lifecycle_stage back to enum
ALTER TABLE tasks 
ALTER COLUMN lifecycle_stage TYPE batch_lifecycle_stage USING lifecycle_stage::batch_lifecycle_stage;