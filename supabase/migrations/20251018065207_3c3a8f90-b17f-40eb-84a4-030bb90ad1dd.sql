-- Phase 1: Update batch lifecycle stages from 4 to 9 stages (Fixed)

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

-- Step 2: Update batch_lifecycle_records table
ALTER TABLE batch_lifecycle_records 
ADD COLUMN current_stage_new batch_lifecycle_stage_new;

UPDATE batch_lifecycle_records
SET current_stage_new = CASE 
  WHEN current_stage::text = 'cloning' THEN 'clone_germination'::batch_lifecycle_stage_new
  WHEN current_stage::text = 'vegetative' THEN 'vegetative'::batch_lifecycle_stage_new
  WHEN current_stage::text = 'flowering' THEN 'flowering_grow_room'::batch_lifecycle_stage_new
  WHEN current_stage::text = 'harvest' THEN 'harvest'::batch_lifecycle_stage_new
  ELSE 'clone_germination'::batch_lifecycle_stage_new
END;

ALTER TABLE batch_lifecycle_records 
DROP COLUMN current_stage;

ALTER TABLE batch_lifecycle_records 
RENAME COLUMN current_stage_new TO current_stage;

ALTER TABLE batch_lifecycle_records 
ALTER COLUMN current_stage SET DEFAULT 'preclone'::batch_lifecycle_stage_new;

-- Step 3: Update tasks table lifecycle_stage column
ALTER TABLE tasks 
ADD COLUMN lifecycle_stage_new batch_lifecycle_stage_new;

UPDATE tasks
SET lifecycle_stage_new = CASE 
  WHEN lifecycle_stage::text = 'cloning' THEN 'clone_germination'::batch_lifecycle_stage_new
  WHEN lifecycle_stage::text = 'vegetative' THEN 'vegetative'::batch_lifecycle_stage_new
  WHEN lifecycle_stage::text = 'flowering' THEN 'flowering_grow_room'::batch_lifecycle_stage_new
  WHEN lifecycle_stage::text = 'harvest' THEN 'harvest'::batch_lifecycle_stage_new
  ELSE NULL
END;

ALTER TABLE tasks 
DROP COLUMN lifecycle_stage;

ALTER TABLE tasks 
RENAME COLUMN lifecycle_stage_new TO lifecycle_stage;

-- Step 4: Now safe to drop old enum type
DROP TYPE batch_lifecycle_stage;

-- Step 5: Rename new enum type to original name
ALTER TYPE batch_lifecycle_stage_new RENAME TO batch_lifecycle_stage;

-- Step 6: Update the applicable_stages column type in task_field_mappings table
ALTER TABLE task_field_mappings 
ADD COLUMN applicable_stages_new text[];

UPDATE task_field_mappings
SET applicable_stages_new = applicable_stages;

ALTER TABLE task_field_mappings 
DROP COLUMN applicable_stages;

ALTER TABLE task_field_mappings 
RENAME COLUMN applicable_stages_new TO applicable_stages;

ALTER TABLE task_field_mappings 
ALTER COLUMN applicable_stages SET NOT NULL;