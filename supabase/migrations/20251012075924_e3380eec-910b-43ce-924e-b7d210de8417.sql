-- Add strain_id and dome_no fields to cloning_pre_start_checklists table
ALTER TABLE public.cloning_pre_start_checklists
ADD COLUMN strain_id text,
ADD COLUMN dome_no text;