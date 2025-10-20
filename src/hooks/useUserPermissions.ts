import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type PermissionKey =
  | 'view_all_tasks'
  | 'create_tasks'
  | 'edit_all_tasks'
  | 'delete_tasks'
  | 'approve_tasks'
  | 'view_all_batches'
  | 'create_batches'
  | 'edit_batches'
  | 'delete_batches'
  | 'manage_inventory'
  | 'view_inventory_reports'
  | 'view_reports'
  | 'export_reports'
  | 'manage_users'
  | 'manage_permissions'
  | 'manage_lookups'
  | 'manage_nomenclature'
  | 'view_system_settings';

export interface PermissionDefinition {
  id: string;
  permission_key: PermissionKey;
  permission_name: string;
  category: string;
  description: string | null;
  is_active: boolean;
}

export interface UserPermissionOverride {
  id: string;
  user_id: string;
  permission_key: PermissionKey;
  is_granted: boolean;
  granted_by: string | null;
  granted_at: string;
  notes: string | null;
}

export const useUserPermissions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return {};

      // Fetch all permission definitions
      const { data: permissions, error: permError } = await supabase
        .from('permission_definitions')
        .select('*')
        .eq('is_active', true);

      if (permError) throw permError;

      // Fetch user's permission overrides
      const { data: overrides, error: overrideError } = await supabase
        .from('user_permission_overrides')
        .select('*')
        .eq('user_id', user.id);

      if (overrideError) throw overrideError;

      // Create a map of permissions
      const permissionMap: Record<PermissionKey, boolean> = {} as any;

      // Check each permission using the database function
      for (const perm of permissions || []) {
        const { data, error } = await supabase.rpc('has_permission', {
          _user_id: user.id,
          _permission_key: perm.permission_key,
        });

        if (!error && data !== null) {
          permissionMap[perm.permission_key as PermissionKey] = data;
        }
      }

      return permissionMap;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useHasPermission = (permission: PermissionKey) => {
  const { data: permissions = {} } = useUserPermissions();
  return permissions[permission] || false;
};

export const useAllPermissions = () => {
  return useQuery({
    queryKey: ['all-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permission_definitions')
        .select('*')
        .eq('is_active', true)
        .order('category, permission_name');

      if (error) throw error;
      return data as PermissionDefinition[];
    },
  });
};
