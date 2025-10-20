import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { AppRole } from '@/hooks/useUserRoles';

interface RolePermission {
  role: AppRole;
  permissions: Record<string, boolean>;
}

export function PermissionsMatrix() {
  const { data: permissions = [] } = useQuery({
    queryKey: ['all-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permission_definitions')
        .select('*')
        .eq('is_active', true)
        .order('category, permission_name');

      if (error) throw error;
      return data;
    },
  });

  // Define default permissions for each role (matches the database function logic)
  const rolePermissions: Record<AppRole, string[]> = {
    it_admin: permissions.map((p) => p.permission_key), // All permissions
    business_admin: permissions.map((p) => p.permission_key), // All permissions
    supervisor: permissions.filter((p) => p.permission_key !== 'manage_permissions').map((p) => p.permission_key),
    manager: permissions.filter((p) => p.permission_key !== 'manage_permissions').map((p) => p.permission_key),
    qa: ['view_all_tasks', 'approve_tasks', 'view_all_batches', 'view_inventory_reports', 'view_reports'],
    grower: ['create_tasks', 'create_batches', 'edit_batches', 'manage_inventory', 'view_reports'],
    assistant_grower: ['create_tasks', 'manage_inventory'],
  };

  const roles: AppRole[] = ['it_admin', 'business_admin', 'supervisor', 'manager', 'qa', 'grower', 'assistant_grower'];

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, any[]>);

  const getRoleLabel = (role: AppRole) => {
    const labels: Record<AppRole, string> = {
      it_admin: 'IT Admin',
      business_admin: 'Business Admin',
      supervisor: 'Supervisor',
      manager: 'Manager',
      qa: 'QA',
      grower: 'Grower',
      assistant_grower: 'Assistant Grower',
    };
    return labels[role];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Default Role Permissions Matrix</CardTitle>
        <CardDescription>
          This shows the baseline permissions for each role. Individual users can have custom overrides.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <div key={category} className="mb-8">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                {category}
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-medium sticky left-0 bg-muted/50 z-10 min-w-[200px]">
                        Permission
                      </th>
                      {roles.map((role) => (
                        <th key={role} className="text-center p-3 font-medium min-w-[100px]">
                          <Badge variant="outline" className="whitespace-nowrap">
                            {getRoleLabel(role)}
                          </Badge>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {perms.map((perm, idx) => (
                      <tr
                        key={perm.id}
                        className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                      >
                        <td className="p-3 font-medium sticky left-0 bg-inherit z-10">
                          <div>
                            <div className="font-medium">{perm.permission_name}</div>
                            {perm.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {perm.description}
                              </div>
                            )}
                          </div>
                        </td>
                        {roles.map((role) => {
                          const hasPermission = rolePermissions[role]?.includes(perm.permission_key);
                          return (
                            <td key={role} className="text-center p-3">
                              {hasPermission ? (
                                <Check className="h-5 w-5 text-success mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
