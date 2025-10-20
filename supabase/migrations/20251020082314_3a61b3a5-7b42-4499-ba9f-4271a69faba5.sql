-- Create role_permissions table to store which permissions each role has
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_key text NOT NULL,
  is_granted boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(role, permission_key)
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Everyone can view role permissions
CREATE POLICY "Everyone can view role permissions"
ON public.role_permissions
FOR SELECT
USING (true);

-- Only admins can manage role permissions
CREATE POLICY "Admins can manage role permissions"
ON public.role_permissions
FOR ALL
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_role_permissions_updated_at
BEFORE UPDATE ON public.role_permissions
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Insert default permissions based on current logic
INSERT INTO public.role_permissions (role, permission_key, is_granted) VALUES
-- IT Admin and Business Admin - all permissions
('it_admin', 'view_all_tasks', true),
('it_admin', 'create_tasks', true),
('it_admin', 'edit_all_tasks', true),
('it_admin', 'delete_tasks', true),
('it_admin', 'approve_tasks', true),
('it_admin', 'view_all_batches', true),
('it_admin', 'create_batches', true),
('it_admin', 'edit_batches', true),
('it_admin', 'delete_batches', true),
('it_admin', 'manage_inventory', true),
('it_admin', 'view_inventory_reports', true),
('it_admin', 'view_reports', true),
('it_admin', 'export_reports', true),
('it_admin', 'manage_users', true),
('it_admin', 'manage_permissions', true),
('it_admin', 'manage_lookups', true),
('it_admin', 'manage_nomenclature', true),
('it_admin', 'view_system_settings', true),

('business_admin', 'view_all_tasks', true),
('business_admin', 'create_tasks', true),
('business_admin', 'edit_all_tasks', true),
('business_admin', 'delete_tasks', true),
('business_admin', 'approve_tasks', true),
('business_admin', 'view_all_batches', true),
('business_admin', 'create_batches', true),
('business_admin', 'edit_batches', true),
('business_admin', 'delete_batches', true),
('business_admin', 'manage_inventory', true),
('business_admin', 'view_inventory_reports', true),
('business_admin', 'view_reports', true),
('business_admin', 'export_reports', true),
('business_admin', 'manage_users', true),
('business_admin', 'manage_permissions', true),
('business_admin', 'manage_lookups', true),
('business_admin', 'manage_nomenclature', true),
('business_admin', 'view_system_settings', true),

-- Manager and Supervisor - most permissions except system management
('manager', 'view_all_tasks', true),
('manager', 'create_tasks', true),
('manager', 'edit_all_tasks', true),
('manager', 'delete_tasks', true),
('manager', 'approve_tasks', true),
('manager', 'view_all_batches', true),
('manager', 'create_batches', true),
('manager', 'edit_batches', true),
('manager', 'delete_batches', true),
('manager', 'manage_inventory', true),
('manager', 'view_inventory_reports', true),
('manager', 'view_reports', true),
('manager', 'export_reports', true),
('manager', 'manage_lookups', true),
('manager', 'manage_nomenclature', true),
('manager', 'view_system_settings', true),

('supervisor', 'view_all_tasks', true),
('supervisor', 'create_tasks', true),
('supervisor', 'edit_all_tasks', true),
('supervisor', 'delete_tasks', true),
('supervisor', 'approve_tasks', true),
('supervisor', 'view_all_batches', true),
('supervisor', 'create_batches', true),
('supervisor', 'edit_batches', true),
('supervisor', 'delete_batches', true),
('supervisor', 'manage_inventory', true),
('supervisor', 'view_inventory_reports', true),
('supervisor', 'view_reports', true),
('supervisor', 'export_reports', true),
('supervisor', 'manage_lookups', true),
('supervisor', 'manage_nomenclature', true),
('supervisor', 'view_system_settings', true),

-- QA - view and approve tasks, view batches and inventory
('qa', 'view_all_tasks', true),
('qa', 'approve_tasks', true),
('qa', 'view_all_batches', true),
('qa', 'view_inventory_reports', true),
('qa', 'view_reports', true),

-- Grower - create tasks and batches, manage inventory
('grower', 'create_tasks', true),
('grower', 'create_batches', true),
('grower', 'edit_batches', true),
('grower', 'manage_inventory', true),
('grower', 'view_reports', true),

-- Assistant Grower - limited permissions
('assistant_grower', 'create_tasks', true),
('assistant_grower', 'manage_inventory', true);

-- Update has_permission function to use the new table
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission_key text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  override_granted BOOLEAN;
  user_role app_role;
  role_has_permission BOOLEAN;
BEGIN
  -- Check if there's an override for this user and permission
  SELECT is_granted INTO override_granted
  FROM public.user_permission_overrides
  WHERE user_id = _user_id AND permission_key = _permission_key;
  
  -- If override exists, return that value
  IF FOUND THEN
    RETURN override_granted;
  END IF;
  
  -- Get the user's highest role
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'it_admin' THEN 1
      WHEN 'business_admin' THEN 2
      WHEN 'supervisor' THEN 3
      WHEN 'manager' THEN 4
      WHEN 'qa' THEN 5
      WHEN 'grower' THEN 6
      WHEN 'assistant_grower' THEN 7
    END
  LIMIT 1;
  
  -- If no role found, no permissions
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check role_permissions table
  SELECT is_granted INTO role_has_permission
  FROM public.role_permissions
  WHERE role = user_role AND permission_key = _permission_key;
  
  -- Return the result (defaults to false if not found)
  RETURN COALESCE(role_has_permission, false);
END;
$function$;