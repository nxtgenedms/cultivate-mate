-- Populate fields for HVCSOF003 - Cultivation Area Weekly Checklist
INSERT INTO public.sof_fields (sof_id, field_key, field_label, field_type, field_group, is_required, sort_order) VALUES
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF003'), 'inspection_date', 'Inspection Date', 'date', 'Header', true, 1),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF003'), 'area_inspected', 'Area Inspected', 'text', 'Header', true, 2),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF003'), 'inspector_name', 'Inspector Name', 'text', 'Header', true, 3),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF003'), 'temperature', 'Temperature (°C)', 'number', 'Environmental Checks', true, 4),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF003'), 'humidity', 'Relative Humidity (%)', 'number', 'Environmental Checks', true, 5),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF003'), 'lighting_operational', 'Lighting System Operational', 'checkbox', 'Environmental Checks', true, 6),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF003'), 'ventilation_operational', 'Ventilation System Operational', 'checkbox', 'Environmental Checks', true, 7),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF003'), 'irrigation_system_check', 'Irrigation System Check', 'checkbox', 'System Checks', true, 8),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF003'), 'pest_issues', 'Pest Issues Observed', 'checkbox', 'Plant Health', false, 9),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF003'), 'disease_issues', 'Disease Issues Observed', 'checkbox', 'Plant Health', false, 10),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF003'), 'corrective_actions', 'Corrective Actions Taken', 'textarea', 'Actions', false, 11),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF003'), 'notes', 'Additional Notes', 'textarea', 'Notes', false, 12),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF003'), 'grower_signature', 'Grower Signature', 'signature', 'Signatures', true, 13),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF003'), 'manager_signature', 'Manager Signature', 'signature', 'Signatures', true, 14);

-- Populate fields for HVCSOF004 - Clonator Weekly Checklist
INSERT INTO public.sof_fields (sof_id, field_key, field_label, field_type, field_group, is_required, sort_order) VALUES
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF004'), 'inspection_date', 'Inspection Date', 'date', 'Header', true, 1),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF004'), 'clonator_id', 'Clonator ID', 'text', 'Header', true, 2),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF004'), 'inspector_name', 'Inspector Name', 'text', 'Header', true, 3),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF004'), 'temperature', 'Temperature (°C)', 'number', 'Environmental Checks', true, 4),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF004'), 'humidity', 'Relative Humidity (%)', 'number', 'Environmental Checks', true, 5),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF004'), 'water_level', 'Water Level Check', 'checkbox', 'System Checks', true, 6),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF004'), 'ph_level', 'pH Level', 'number', 'Water Quality', true, 7),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF004'), 'ec_level', 'EC Level', 'number', 'Water Quality', true, 8),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF004'), 'dome_cleaned', 'Dome Cleaned and Sanitized', 'checkbox', 'Maintenance', true, 9),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF004'), 'misting_system', 'Misting System Operational', 'checkbox', 'System Checks', true, 10),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF004'), 'clone_health', 'Overall Clone Health Status', 'select', 'Plant Health', true, 11),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF004'), 'corrective_actions', 'Corrective Actions Taken', 'textarea', 'Actions', false, 12),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF004'), 'notes', 'Additional Notes', 'textarea', 'Notes', false, 13),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF004'), 'grower_signature', 'Grower Signature', 'signature', 'Signatures', true, 14);

-- Add options for clone_health select field
UPDATE public.sof_fields SET options = '["Excellent", "Good", "Fair", "Poor"]'::jsonb 
WHERE field_key = 'clone_health' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF004');

-- Populate fields for HVCSOF009 - Batch Record
INSERT INTO public.sof_fields (sof_id, field_key, field_label, field_type, field_group, is_required, sort_order) VALUES
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'batch_number', 'Batch Number', 'text', 'Header', true, 1),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'strain', 'Strain', 'text', 'Header', true, 2),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'mother_id', 'Mother ID', 'text', 'Header', true, 3),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'start_date', 'Start Date', 'date', 'Header', true, 4),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'initial_quantity', 'Initial Quantity', 'number', 'Batch Info', true, 5),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'current_stage', 'Current Lifecycle Stage', 'select', 'Batch Info', true, 6),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'current_location', 'Current Location/Area', 'text', 'Batch Info', true, 7),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'cloning_date', 'Cloning Date', 'date', 'Stage Dates', false, 8),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'rooting_date', 'Rooting Date', 'date', 'Stage Dates', false, 9),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'veg_start_date', 'Veg Start Date', 'date', 'Stage Dates', false, 10),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'flowering_start_date', 'Flowering Start Date', 'date', 'Stage Dates', false, 11),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'harvest_date', 'Harvest Date', 'date', 'Stage Dates', false, 12),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'total_losses', 'Total Losses/Mortalities', 'number', 'Performance', false, 13),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'final_yield_kg', 'Final Yield (kg)', 'number', 'Performance', false, 14),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'notes', 'Batch Notes', 'textarea', 'Notes', false, 15),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009'), 'created_by', 'Created By', 'text', 'Metadata', true, 16);

-- Add options for current_stage select field
UPDATE public.sof_fields SET options = '["Cloning", "Rooting", "Vegetative", "Flowering", "Harvest", "Processing", "Completed"]'::jsonb 
WHERE field_key = 'current_stage' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF009');

-- Populate fields for HVCSOF019 - IPM Chemical Mixing Record
INSERT INTO public.sof_fields (sof_id, field_key, field_label, field_type, field_group, is_required, sort_order) VALUES
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019'), 'mixing_date', 'Mixing Date', 'date', 'Header', true, 1),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019'), 'batch_number', 'Batch Number', 'text', 'Header', true, 2),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019'), 'chemical_name', 'Chemical/Product Name', 'text', 'Chemical Info', true, 3),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019'), 'active_ingredient', 'Active Ingredient', 'text', 'Chemical Info', true, 4),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019'), 'target_pest', 'Target Pest/Disease', 'text', 'Application', true, 5),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019'), 'concentration', 'Concentration/Dilution Rate', 'text', 'Mixing Details', true, 6),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019'), 'volume_mixed', 'Total Volume Mixed (L)', 'number', 'Mixing Details', true, 7),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019'), 'water_volume', 'Water Volume (L)', 'number', 'Mixing Details', true, 8),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019'), 'chemical_volume', 'Chemical Volume (mL)', 'number', 'Mixing Details', true, 9),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019'), 'application_area', 'Application Area', 'text', 'Application', true, 10),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019'), 'application_method', 'Application Method', 'select', 'Application', true, 11),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019'), 'ppe_used', 'PPE Used', 'textarea', 'Safety', true, 12),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019'), 'notes', 'Notes', 'textarea', 'Notes', false, 13),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019'), 'mixed_by_signature', 'Mixed By Signature', 'signature', 'Signatures', true, 14),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019'), 'approved_by_signature', 'Approved By Signature', 'signature', 'Signatures', true, 15);

-- Add options for application_method
UPDATE public.sof_fields SET options = '["Foliar Spray", "Drench", "Soil Application", "Injection"]'::jsonb 
WHERE field_key = 'application_method' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF019');

-- Populate fields for HVCSOF022 - Scouting Report
INSERT INTO public.sof_fields (sof_id, field_key, field_label, field_type, field_group, is_required, sort_order) VALUES
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'scouting_date', 'Scouting Date', 'date', 'Header', true, 1),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'batch_number', 'Batch Number', 'text', 'Header', true, 2),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'area_scouted', 'Area Scouted', 'text', 'Header', true, 3),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'scout_name', 'Scout Name', 'text', 'Header', true, 4),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'plants_inspected', 'Number of Plants Inspected', 'number', 'Inspection Details', true, 5),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'pest_detected', 'Pest Detected', 'checkbox', 'Findings', false, 6),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'pest_type', 'Pest Type/Species', 'text', 'Findings', false, 7),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'infestation_level', 'Infestation Level', 'select', 'Findings', false, 8),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'disease_detected', 'Disease Detected', 'checkbox', 'Findings', false, 9),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'disease_type', 'Disease Type', 'text', 'Findings', false, 10),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'affected_plants', 'Number of Affected Plants', 'number', 'Findings', false, 11),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'action_required', 'Action Required', 'select', 'Response', true, 12),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'recommended_treatment', 'Recommended Treatment', 'textarea', 'Response', false, 13),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'notes', 'Additional Observations', 'textarea', 'Notes', false, 14),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'scout_signature', 'Scout Signature', 'signature', 'Signatures', true, 15),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022'), 'manager_signature', 'Manager Signature', 'signature', 'Signatures', true, 16);

-- Add options for select fields
UPDATE public.sof_fields SET options = '["None", "Low", "Moderate", "High", "Severe"]'::jsonb 
WHERE field_key = 'infestation_level' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022');

UPDATE public.sof_fields SET options = '["None", "Monitor", "Treatment Required", "Quarantine", "Disposal"]'::jsonb 
WHERE field_key = 'action_required' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF022');

-- Populate fields for HVCSOF030 - Fertigation Record
INSERT INTO public.sof_fields (sof_id, field_key, field_label, field_type, field_group, is_required, sort_order) VALUES
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030'), 'application_date', 'Application Date', 'date', 'Header', true, 1),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030'), 'batch_number', 'Batch Number', 'text', 'Header', true, 2),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030'), 'area_applied', 'Area Applied', 'text', 'Header', true, 3),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030'), 'growth_stage', 'Growth Stage', 'select', 'Header', true, 4),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030'), 'fertilizer_type', 'Fertilizer Type/Product', 'text', 'Nutrients', true, 5),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030'), 'npk_ratio', 'NPK Ratio', 'text', 'Nutrients', true, 6),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030'), 'concentration', 'Concentration (ppm/EC)', 'number', 'Solution Details', true, 7),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030'), 'ph_level', 'pH Level', 'number', 'Solution Details', true, 8),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030'), 'volume_applied', 'Volume Applied (L)', 'number', 'Application', true, 9),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030'), 'application_method', 'Application Method', 'select', 'Application', true, 10),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030'), 'water_source', 'Water Source', 'text', 'Water Quality', true, 11),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030'), 'water_temp', 'Water Temperature (°C)', 'number', 'Water Quality', false, 12),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030'), 'notes', 'Notes', 'textarea', 'Notes', false, 13),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030'), 'applied_by_signature', 'Applied By Signature', 'signature', 'Signatures', true, 14),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030'), 'checked_by_signature', 'Checked By Signature', 'signature', 'Signatures', true, 15);

-- Add options for select fields
UPDATE public.sof_fields SET options = '["Cloning", "Vegetative", "Early Flowering", "Mid Flowering", "Late Flowering"]'::jsonb 
WHERE field_key = 'growth_stage' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030');

UPDATE public.sof_fields SET options = '["Drip Irrigation", "Flood/Drain", "Hand Watering", "Spray", "NFT"]'::jsonb 
WHERE field_key = 'application_method' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF030');

-- Populate fields for HVCSOF034 - Fertiliser and Chemical Inventory Check Form
INSERT INTO public.sof_fields (sof_id, field_key, field_label, field_type, field_group, is_required, sort_order) VALUES
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034'), 'check_date', 'Check Date', 'date', 'Header', true, 1),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034'), 'checked_by', 'Checked By', 'text', 'Header', true, 2),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034'), 'product_name', 'Product Name', 'text', 'Product Info', true, 3),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034'), 'product_type', 'Product Type', 'select', 'Product Info', true, 4),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034'), 'batch_lot_number', 'Batch/Lot Number', 'text', 'Product Info', true, 5),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034'), 'current_quantity', 'Current Quantity', 'number', 'Inventory', true, 6),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034'), 'unit_of_measure', 'Unit of Measure', 'select', 'Inventory', true, 7),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034'), 'reorder_level', 'Reorder Level', 'number', 'Inventory', true, 8),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034'), 'expiry_date', 'Expiry Date', 'date', 'Product Info', true, 9),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034'), 'storage_location', 'Storage Location', 'text', 'Storage', true, 10),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034'), 'storage_conditions_ok', 'Storage Conditions Acceptable', 'checkbox', 'Storage', true, 11),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034'), 'container_condition', 'Container Condition', 'select', 'Storage', true, 12),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034'), 'reorder_required', 'Reorder Required', 'checkbox', 'Actions', false, 13),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034'), 'notes', 'Notes', 'textarea', 'Notes', false, 14),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034'), 'checker_signature', 'Checker Signature', 'signature', 'Signatures', true, 15);

-- Add options for select fields
UPDATE public.sof_fields SET options = '["Fertilizer", "Pesticide", "Fungicide", "Growth Regulator", "pH Adjuster", "Other Chemical"]'::jsonb 
WHERE field_key = 'product_type' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034');

UPDATE public.sof_fields SET options = '["kg", "L", "mL", "g", "Units"]'::jsonb 
WHERE field_key = 'unit_of_measure' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034');

UPDATE public.sof_fields SET options = '["Good", "Acceptable", "Damaged", "Requires Replacement"]'::jsonb 
WHERE field_key = 'container_condition' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF034');

-- Populate fields for HVCSOF038 - Chemical and Fertiliser External Delivery Receipt Form
INSERT INTO public.sof_fields (sof_id, field_key, field_label, field_type, field_group, is_required, sort_order) VALUES
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'delivery_date', 'Delivery Date', 'date', 'Header', true, 1),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'received_by', 'Received By', 'text', 'Header', true, 2),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'supplier_name', 'Supplier Name', 'text', 'Supplier Info', true, 3),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'delivery_note_number', 'Delivery Note Number', 'text', 'Supplier Info', true, 4),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'purchase_order_number', 'Purchase Order Number', 'text', 'Order Info', true, 5),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'product_name', 'Product Name', 'text', 'Product Details', true, 6),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'product_type', 'Product Type', 'select', 'Product Details', true, 7),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'batch_lot_number', 'Batch/Lot Number', 'text', 'Product Details', true, 8),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'quantity_ordered', 'Quantity Ordered', 'number', 'Quantity Check', true, 9),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'quantity_received', 'Quantity Received', 'number', 'Quantity Check', true, 10),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'unit_of_measure', 'Unit of Measure', 'select', 'Quantity Check', true, 11),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'expiry_date', 'Expiry Date', 'date', 'Quality Check', true, 12),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'packaging_intact', 'Packaging Intact', 'checkbox', 'Quality Check', true, 13),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'labels_correct', 'Labels Correct and Legible', 'checkbox', 'Quality Check', true, 14),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'sds_provided', 'Safety Data Sheet Provided', 'checkbox', 'Documentation', true, 15),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'storage_location_assigned', 'Storage Location Assigned', 'text', 'Storage', true, 16),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'discrepancies', 'Discrepancies/Issues', 'textarea', 'Notes', false, 17),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'receiver_signature', 'Receiver Signature', 'signature', 'Signatures', true, 18),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038'), 'manager_signature', 'Manager Signature', 'signature', 'Signatures', true, 19);

-- Add options for select fields
UPDATE public.sof_fields SET options = '["Fertilizer", "Pesticide", "Fungicide", "Growth Regulator", "pH Adjuster", "Other Chemical"]'::jsonb 
WHERE field_key = 'product_type' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038');

UPDATE public.sof_fields SET options = '["kg", "L", "mL", "g", "Units"]'::jsonb 
WHERE field_key = 'unit_of_measure' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF038');

-- Populate fields for HVCSOF040 - Soil Moisture Content Records
INSERT INTO public.sof_fields (sof_id, field_key, field_label, field_type, field_group, is_required, sort_order) VALUES
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040'), 'measurement_date', 'Measurement Date', 'date', 'Header', true, 1),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040'), 'batch_number', 'Batch Number', 'text', 'Header', true, 2),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040'), 'measurement_area', 'Measurement Area', 'text', 'Header', true, 3),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040'), 'measured_by', 'Measured By', 'text', 'Header', true, 4),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040'), 'moisture_level_percent', 'Moisture Level (%)', 'number', 'Measurements', true, 5),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040'), 'measurement_depth_cm', 'Measurement Depth (cm)', 'number', 'Measurements', true, 6),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040'), 'substrate_type', 'Substrate Type', 'select', 'Growing Medium', true, 7),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040'), 'target_moisture_min', 'Target Moisture Min (%)', 'number', 'Target Range', true, 8),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040'), 'target_moisture_max', 'Target Moisture Max (%)', 'number', 'Target Range', true, 9),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040'), 'within_target_range', 'Within Target Range', 'checkbox', 'Assessment', true, 10),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040'), 'action_required', 'Action Required', 'select', 'Assessment', false, 11),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040'), 'action_taken', 'Action Taken', 'textarea', 'Actions', false, 12),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040'), 'notes', 'Notes', 'textarea', 'Notes', false, 13),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040'), 'technician_signature', 'Technician Signature', 'signature', 'Signatures', true, 14);

-- Add options for select fields
UPDATE public.sof_fields SET options = '["Coco Coir", "Peat Mix", "Rockwool", "Soil", "Hydroponic", "Other"]'::jsonb 
WHERE field_key = 'substrate_type' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040');

UPDATE public.sof_fields SET options = '["None", "Increase Watering", "Decrease Watering", "Check Drainage", "Adjust Schedule"]'::jsonb 
WHERE field_key = 'action_required' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF040');

-- Populate fields for HVCSOF053 - Pre-Harvest Checklist
INSERT INTO public.sof_fields (sof_id, field_key, field_label, field_type, field_group, is_required, sort_order) VALUES
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'inspection_date', 'Inspection Date', 'date', 'Header', true, 1),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'batch_number', 'Batch Number', 'text', 'Header', true, 2),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'strain', 'Strain', 'text', 'Header', true, 3),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'projected_harvest_date', 'Projected Harvest Date', 'date', 'Header', true, 4),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'trichome_maturity', 'Trichome Maturity Assessment', 'select', 'Plant Readiness', true, 5),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'pistil_color', 'Pistil Color/Maturity', 'select', 'Plant Readiness', true, 6),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'plants_flushed', 'Plants Properly Flushed', 'checkbox', 'Pre-Harvest Prep', true, 7),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'harvest_area_cleaned', 'Harvest Area Cleaned and Sanitized', 'checkbox', 'Pre-Harvest Prep', true, 8),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'drying_area_prepared', 'Drying Area Prepared', 'checkbox', 'Pre-Harvest Prep', true, 9),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'harvest_tools_ready', 'Harvest Tools Ready and Sanitized', 'checkbox', 'Equipment', true, 10),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'drying_racks_available', 'Drying Racks Available', 'checkbox', 'Equipment', true, 11),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'scales_calibrated', 'Scales Calibrated', 'checkbox', 'Equipment', true, 12),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'environmental_conditions_ok', 'Environmental Conditions Acceptable', 'checkbox', 'Environment', true, 13),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'team_briefed', 'Harvest Team Briefed', 'checkbox', 'Team Readiness', true, 14),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'notes', 'Notes', 'textarea', 'Notes', false, 15),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'grower_signature', 'Grower Signature', 'signature', 'Signatures', true, 16),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053'), 'manager_signature', 'Manager Signature', 'signature', 'Signatures', true, 17);

-- Add options for select fields
UPDATE public.sof_fields SET options = '["Clear/Early", "Cloudy/Peak", "Amber/Late", "Mixed"]'::jsonb 
WHERE field_key = 'trichome_maturity' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053');

UPDATE public.sof_fields SET options = '["Mostly White", "50% Brown", "Mostly Brown", "All Brown"]'::jsonb 
WHERE field_key = 'pistil_color' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF053');

-- Populate fields for HVCSOF055 - Harvest Record
INSERT INTO public.sof_fields (sof_id, field_key, field_label, field_type, field_group, is_required, sort_order) VALUES
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'harvest_date', 'Harvest Date', 'date', 'Header', true, 1),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'batch_number', 'Batch Number', 'text', 'Header', true, 2),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'strain', 'Strain', 'text', 'Header', true, 3),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'harvest_area', 'Harvest Area/Table', 'text', 'Header', true, 4),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'total_plants_harvested', 'Total Plants Harvested', 'number', 'Harvest Data', true, 5),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'start_time', 'Harvest Start Time', 'text', 'Timing', true, 6),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'end_time', 'Harvest End Time', 'text', 'Timing', true, 7),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'wet_weight_kg', 'Total Wet Weight (kg)', 'number', 'Weights', true, 8),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'average_plant_weight_g', 'Average Plant Weight (g)', 'number', 'Weights', false, 9),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'harvest_method', 'Harvest Method', 'select', 'Process', true, 10),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'drying_rack_numbers', 'Drying Rack Numbers', 'text', 'Post-Harvest', true, 11),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'drying_area_location', 'Drying Area Location', 'text', 'Post-Harvest', true, 12),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'quality_notes', 'Quality Observations', 'textarea', 'Quality', false, 13),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'issues_encountered', 'Issues Encountered', 'textarea', 'Notes', false, 14),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'harvester_signature', 'Harvester Signature', 'signature', 'Signatures', true, 15),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'grower_signature', 'Grower Signature', 'signature', 'Signatures', true, 16),
((SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055'), 'manager_signature', 'Manager Signature', 'signature', 'Signatures', true, 17);

-- Add options for select fields
UPDATE public.sof_fields SET options = '["Whole Plant", "Branch by Branch", "Wet Trim", "Dry Trim"]'::jsonb 
WHERE field_key = 'harvest_method' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'HVCSOF055');

-- Populate fields for SOF001a - Start of Day Hygiene 22c
INSERT INTO public.sof_fields (sof_id, field_key, field_label, field_type, field_group, is_required, sort_order) VALUES
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001a'), 'check_date', 'Date', 'date', 'Header', true, 1),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001a'), 'shift', 'Shift', 'select', 'Header', true, 2),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001a'), 'employee_name', 'Employee Name', 'text', 'Header', true, 3),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001a'), 'hands_washed', 'Hands Washed with Soap', 'checkbox', 'Personal Hygiene', true, 4),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001a'), 'hands_sanitized', 'Hands Sanitized', 'checkbox', 'Personal Hygiene', true, 5),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001a'), 'clean_work_attire', 'Clean Work Attire', 'checkbox', 'Personal Hygiene', true, 6),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001a'), 'hair_covered', 'Hair Covered/Tied Back', 'checkbox', 'Personal Hygiene', true, 7),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001a'), 'no_jewelry', 'No Jewelry Worn', 'checkbox', 'Personal Hygiene', true, 8),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001a'), 'no_illness_symptoms', 'No Illness Symptoms', 'checkbox', 'Health Check', true, 9),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001a'), 'work_area_clean', 'Work Area Clean', 'checkbox', 'Work Area', true, 10),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001a'), 'equipment_sanitized', 'Equipment Sanitized', 'checkbox', 'Work Area', true, 11),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001a'), 'notes', 'Notes', 'textarea', 'Notes', false, 12),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001a'), 'employee_signature', 'Employee Signature', 'signature', 'Signatures', true, 13),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001a'), 'supervisor_signature', 'Supervisor Signature', 'signature', 'Signatures', true, 14);

-- Add options for shift
UPDATE public.sof_fields SET options = '["Day Shift", "Night Shift", "Morning", "Afternoon"]'::jsonb 
WHERE field_key = 'shift' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'SOF001a');

-- Populate fields for SOF001b - Start of Day Hygiene
INSERT INTO public.sof_fields (sof_id, field_key, field_label, field_type, field_group, is_required, sort_order) VALUES
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001b'), 'check_date', 'Date', 'date', 'Header', true, 1),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001b'), 'shift', 'Shift', 'select', 'Header', true, 2),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001b'), 'employee_name', 'Employee Name', 'text', 'Header', true, 3),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001b'), 'hands_washed', 'Hands Washed with Soap', 'checkbox', 'Personal Hygiene', true, 4),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001b'), 'hands_sanitized', 'Hands Sanitized', 'checkbox', 'Personal Hygiene', true, 5),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001b'), 'clean_work_attire', 'Clean Work Attire', 'checkbox', 'Personal Hygiene', true, 6),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001b'), 'hair_covered', 'Hair Covered/Tied Back', 'checkbox', 'Personal Hygiene', true, 7),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001b'), 'no_jewelry', 'No Jewelry Worn', 'checkbox', 'Personal Hygiene', true, 8),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001b'), 'no_illness_symptoms', 'No Illness Symptoms', 'checkbox', 'Health Check', true, 9),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001b'), 'work_area_clean', 'Work Area Clean', 'checkbox', 'Work Area', true, 10),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001b'), 'equipment_sanitized', 'Equipment Sanitized', 'checkbox', 'Work Area', true, 11),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001b'), 'ppe_available', 'PPE Available and in Good Condition', 'checkbox', 'Safety', true, 12),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001b'), 'notes', 'Notes', 'textarea', 'Notes', false, 13),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001b'), 'employee_signature', 'Employee Signature', 'signature', 'Signatures', true, 14),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF001b'), 'supervisor_signature', 'Supervisor Signature', 'signature', 'Signatures', true, 15);

-- Add options for shift
UPDATE public.sof_fields SET options = '["Day Shift", "Night Shift", "Morning", "Afternoon"]'::jsonb 
WHERE field_key = 'shift' AND sof_id = (SELECT id FROM public.sofs WHERE sof_number = 'SOF001b');

-- Populate fields for SOF065a - Cleaning Checklist 22C Growing
INSERT INTO public.sof_fields (sof_id, field_key, field_label, field_type, field_group, is_required, sort_order) VALUES
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065a'), 'cleaning_date', 'Cleaning Date', 'date', 'Header', true, 1),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065a'), 'area_cleaned', 'Area Cleaned', 'text', 'Header', true, 2),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065a'), 'cleaned_by', 'Cleaned By', 'text', 'Header', true, 3),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065a'), 'floors_swept_mopped', 'Floors Swept and Mopped', 'checkbox', 'Cleaning Tasks', true, 4),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065a'), 'surfaces_wiped', 'All Surfaces Wiped Down', 'checkbox', 'Cleaning Tasks', true, 5),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065a'), 'equipment_cleaned', 'Equipment Cleaned and Sanitized', 'checkbox', 'Cleaning Tasks', true, 6),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065a'), 'tables_racks_cleaned', 'Tables and Racks Cleaned', 'checkbox', 'Cleaning Tasks', true, 7),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065a'), 'waste_removed', 'Waste Properly Removed', 'checkbox', 'Cleaning Tasks', true, 8),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065a'), 'drains_cleaned', 'Drains Cleaned', 'checkbox', 'Cleaning Tasks', true, 9),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065a'), 'walls_cleaned', 'Walls Spot Cleaned', 'checkbox', 'Cleaning Tasks', true, 10),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065a'), 'cleaning_agent_used', 'Cleaning Agent Used', 'text', 'Cleaning Details', true, 11),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065a'), 'sanitizer_used', 'Sanitizer Used', 'text', 'Cleaning Details', true, 12),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065a'), 'issues_found', 'Issues Found During Cleaning', 'textarea', 'Notes', false, 13),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065a'), 'cleaner_signature', 'Cleaner Signature', 'signature', 'Signatures', true, 14),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065a'), 'supervisor_signature', 'Supervisor Signature', 'signature', 'Signatures', true, 15);

-- Populate fields for SOF065b - Cleaning Checklist 22C Processing
INSERT INTO public.sof_fields (sof_id, field_key, field_label, field_type, field_group, is_required, sort_order) VALUES
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'cleaning_date', 'Cleaning Date', 'date', 'Header', true, 1),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'area_cleaned', 'Area Cleaned', 'text', 'Header', true, 2),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'cleaned_by', 'Cleaned By', 'text', 'Header', true, 3),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'floors_swept_mopped', 'Floors Swept and Mopped', 'checkbox', 'Cleaning Tasks', true, 4),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'surfaces_wiped', 'All Surfaces Wiped Down', 'checkbox', 'Cleaning Tasks', true, 5),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'processing_equipment_cleaned', 'Processing Equipment Cleaned', 'checkbox', 'Cleaning Tasks', true, 6),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'trimming_stations_cleaned', 'Trimming Stations Cleaned', 'checkbox', 'Cleaning Tasks', true, 7),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'drying_racks_cleaned', 'Drying Racks Cleaned', 'checkbox', 'Cleaning Tasks', true, 8),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'waste_removed', 'Plant Waste Properly Removed', 'checkbox', 'Cleaning Tasks', true, 9),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'scales_cleaned', 'Scales Cleaned and Calibrated', 'checkbox', 'Cleaning Tasks', true, 10),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'packaging_area_cleaned', 'Packaging Area Cleaned', 'checkbox', 'Cleaning Tasks', true, 11),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'cleaning_agent_used', 'Cleaning Agent Used', 'text', 'Cleaning Details', true, 12),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'sanitizer_used', 'Sanitizer Used', 'text', 'Cleaning Details', true, 13),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'issues_found', 'Issues Found During Cleaning', 'textarea', 'Notes', false, 14),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'cleaner_signature', 'Cleaner Signature', 'signature', 'Signatures', true, 15),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'supervisor_signature', 'Supervisor Signature', 'signature', 'Signatures', true, 16),
((SELECT id FROM public.sofs WHERE sof_number = 'SOF065b'), 'qa_signature', 'QA Signature', 'signature', 'Signatures', true, 17);