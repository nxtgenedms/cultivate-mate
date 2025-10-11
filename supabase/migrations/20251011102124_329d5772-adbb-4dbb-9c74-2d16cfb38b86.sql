-- Update cloning_pre_start_checklists table to match the actual checklist

-- Drop old columns
ALTER TABLE cloning_pre_start_checklists
DROP COLUMN IF EXISTS mother_health_vigorous,
DROP COLUMN IF EXISTS mother_health_pest_free,
DROP COLUMN IF EXISTS mother_health_disease_free,
DROP COLUMN IF EXISTS prep_tools_sterilized,
DROP COLUMN IF EXISTS prep_media_ready,
DROP COLUMN IF EXISTS prep_environment_clean,
DROP COLUMN IF EXISTS hygiene_hands_sanitized,
DROP COLUMN IF EXISTS hygiene_ppe_worn,
DROP COLUMN IF EXISTS hygiene_workspace_clean;

-- Add new columns matching the actual checklist
ALTER TABLE cloning_pre_start_checklists
ADD COLUMN mother_plant_healthy boolean DEFAULT false,
ADD COLUMN mother_plant_fed_watered_12h boolean DEFAULT false,
ADD COLUMN work_area_sharp_clean_scissors boolean DEFAULT false,
ADD COLUMN work_area_sharp_clean_blade boolean DEFAULT false,
ADD COLUMN work_area_jug_clean_water boolean DEFAULT false,
ADD COLUMN work_area_dome_cleaned_disinfected boolean DEFAULT false,
ADD COLUMN work_area_dome_prepared_medium boolean DEFAULT false,
ADD COLUMN work_area_sanitizer_cup boolean DEFAULT false,
ADD COLUMN work_area_rooting_powder boolean DEFAULT false,
ADD COLUMN work_surface_sterilized boolean DEFAULT false,
ADD COLUMN wearing_clean_gloves boolean DEFAULT false;