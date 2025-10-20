-- Create permission definitions table
CREATE TABLE public.permission_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_key TEXT NOT NULL UNIQUE,
  permission_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user permission overrides table
CREATE TABLE public.user_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  is_granted BOOLEAN NOT NULL DEFAULT true,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, permission_key)
);

-- Enable RLS
ALTER TABLE public.permission_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permission_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permission_definitions
CREATE POLICY "Everyone can view active permissions"
  ON public.permission_definitions
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage permissions"
  ON public.permission_definitions
  FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for user_permission_overrides
CREATE POLICY "Admins can view all overrides"
  ON public.user_permission_overrides
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own overrides"
  ON public.user_permission_overrides
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage overrides"
  ON public.user_permission_overrides
  FOR ALL
  USING (is_admin(auth.uid()));

-- Add updated_at triggers
CREATE TRIGGER update_permission_definitions_updated_at
  BEFORE UPDATE ON public.permission_definitions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_permission_overrides_updated_at
  BEFORE UPDATE ON public.user_permission_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default permission definitions
INSERT INTO public.permission_definitions (permission_key, permission_name, category, description) VALUES
-- Task Permissions
('view_all_tasks', 'View All Tasks', 'tasks', 'Ability to see all tasks in the system, not just assigned tasks'),
('create_tasks', 'Create Tasks', 'tasks', 'Ability to create new tasks'),
('edit_all_tasks', 'Edit All Tasks', 'tasks', 'Ability to edit any task in the system'),
('delete_tasks', 'Delete Tasks', 'tasks', 'Ability to delete tasks'),
('approve_tasks', 'Approve Tasks', 'tasks', 'Ability to approve task submissions'),

-- Batch Permissions
('view_all_batches', 'View All Batches', 'batches', 'Ability to view all batch records'),
('create_batches', 'Create Batches', 'batches', 'Ability to create new batches'),
('edit_batches', 'Edit Batches', 'batches', 'Ability to edit batch lifecycle data'),
('delete_batches', 'Delete Batches', 'batches', 'Ability to delete batches'),

-- Inventory Permissions
('manage_inventory', 'Manage Inventory', 'inventory', 'Ability to manage inventory receipts and usage'),
('view_inventory_reports', 'View Inventory Reports', 'inventory', 'Ability to view inventory reports'),

-- Reports Permissions
('view_reports', 'View Reports', 'reports', 'Ability to view system reports'),
('export_reports', 'Export Reports', 'reports', 'Ability to export reports'),

-- Admin Permissions
('manage_users', 'Manage Users', 'admin', 'Ability to create and edit users'),
('manage_permissions', 'Manage Permissions', 'admin', 'Ability to modify user permissions'),
('manage_lookups', 'Manage Lookups', 'admin', 'Ability to manage lookup values'),
('manage_nomenclature', 'Manage Nomenclature', 'admin', 'Ability to manage nomenclature templates'),
('view_system_settings', 'View System Settings', 'admin', 'Ability to access admin settings');

-- Create helper function to check user permissions
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_override BOOLEAN;
  override_granted BOOLEAN;
  user_role app_role;
BEGIN
  -- Check if there's an override for this user and permission
  SELECT is_granted INTO override_granted
  FROM public.user_permission_overrides
  WHERE user_id = _user_id AND permission_key = _permission_key;
  
  -- If override exists, return that value
  IF FOUND THEN
    RETURN override_granted;
  END IF;
  
  -- Otherwise, check default role-based permissions
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
  
  -- Define default permissions based on role
  CASE user_role
    WHEN 'it_admin', 'business_admin' THEN
      -- Admins have all permissions
      RETURN true;
    
    WHEN 'manager', 'supervisor' THEN
      -- Managers/Supervisors have most permissions except system admin
      RETURN _permission_key != 'manage_permissions';
    
    WHEN 'qa' THEN
      -- QA can view and approve tasks, view batches and inventory
      RETURN _permission_key IN (
        'view_all_tasks', 'approve_tasks', 
        'view_all_batches', 'view_inventory_reports', 'view_reports'
      );
    
    WHEN 'grower' THEN
      -- Growers can create tasks and batches, manage inventory
      RETURN _permission_key IN (
        'create_tasks', 'create_batches', 'edit_batches', 'manage_inventory', 'view_reports'
      );
    
    WHEN 'assistant_grower' THEN
      -- Assistant growers have limited permissions
      RETURN _permission_key IN (
        'create_tasks', 'manage_inventory'
      );
    
    ELSE
      -- Default: no permissions
      RETURN false;
  END CASE;
END;
$$;