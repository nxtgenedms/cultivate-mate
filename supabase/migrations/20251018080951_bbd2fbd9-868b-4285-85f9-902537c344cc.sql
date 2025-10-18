-- Fix incorrect stage names in task_field_mappings
-- Replace 'cloning' with 'clone_germination'
UPDATE task_field_mappings 
SET applicable_stages = array_replace(applicable_stages, 'cloning', 'clone_germination')
WHERE 'cloning' = ANY(applicable_stages);

-- Replace 'flowering' with 'flowering_grow_room'  
UPDATE task_field_mappings
SET applicable_stages = array_replace(applicable_stages, 'flowering', 'flowering_grow_room')
WHERE 'flowering' = ANY(applicable_stages);

-- Replace 'drying' with 'processing_drying'
UPDATE task_field_mappings
SET applicable_stages = array_replace(applicable_stages, 'drying', 'processing_drying')
WHERE 'drying' = ANY(applicable_stages);

-- Replace 'processing' with 'processing_drying'
UPDATE task_field_mappings
SET applicable_stages = array_replace(applicable_stages, 'processing', 'processing_drying')
WHERE 'processing' = ANY(applicable_stages);