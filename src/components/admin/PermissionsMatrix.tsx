import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, X, Edit, Save, XCircle } from 'lucide-react';
import { AppRole } from '@/hooks/useUserRoles';
import { PermissionDefinition } from '@/hooks/useUserPermissions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PermissionsMatrixProps {
  permissions: PermissionDefinition[];
}

interface RolePermission {
  role: AppRole;
  permission_key: string;
  is_granted: boolean;
}

export function PermissionsMatrix({ permissions }: PermissionsMatrixProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedPermissions, setEditedPermissions] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const roles: AppRole[] = ['it_admin', 'business_admin', 'supervisor', 'manager', 'qa', 'grower', 'assistant_grower'];

  // Fetch role permissions from database
  const { data: rolePermissionsData, isLoading } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');
      
      if (error) throw error;
      return data as RolePermission[];
    },
  });

  // Build a map of role + permission_key -> is_granted
  const rolePermissions: Record<string, boolean> = {};
  rolePermissionsData?.forEach((rp) => {
    rolePermissions[`${rp.role}:${rp.permission_key}`] = rp.is_granted;
  });

  // Mutation to save permission changes
  const saveMutation = useMutation({
    mutationFn: async (changes: { role: AppRole; permission_key: string; is_granted: boolean }[]) => {
      const promises = changes.map((change) =>
        supabase
          .from('role_permissions')
          .upsert({
            role: change.role,
            permission_key: change.permission_key,
            is_granted: change.is_granted,
          }, { onConflict: 'role,permission_key' })
      );
      
      const results = await Promise.all(promises);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) throw errors[0].error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      setIsEditMode(false);
      setEditedPermissions({});
      toast.success('Permissions updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update permissions', {
        description: error.message,
      });
    },
  });

  const handleSave = () => {
    const changes = Object.entries(editedPermissions).map(([key, is_granted]) => {
      const [role, permission_key] = key.split(':');
      return { role: role as AppRole, permission_key, is_granted };
    });
    
    saveMutation.mutate(changes);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedPermissions({});
  };

  const togglePermission = (role: AppRole, permission_key: string) => {
    const key = `${role}:${permission_key}`;
    const currentValue = editedPermissions[key] ?? rolePermissions[key] ?? false;
    setEditedPermissions({
      ...editedPermissions,
      [key]: !currentValue,
    });
  };

  const getPermissionValue = (role: AppRole, permission_key: string) => {
    const key = `${role}:${permission_key}`;
    if (key in editedPermissions) {
      return editedPermissions[key];
    }
    return rolePermissions[key] ?? false;
  };

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, PermissionDefinition[]>);

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

  if (permissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No permissions defined
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading permissions...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Role Permissions Matrix</CardTitle>
            <CardDescription>
              {isEditMode 
                ? 'Edit permissions for each role. Changes affect all users with that role.'
                : 'View and manage baseline permissions for each role. Individual users can have custom overrides.'
              }
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!isEditMode ? (
              <Button onClick={() => setIsEditMode(true)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <>
                <Button onClick={handleCancel} variant="outline" disabled={saveMutation.isPending}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>
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
                          const hasPermission = getPermissionValue(role, perm.permission_key);
                          return (
                            <td key={role} className="text-center p-3">
                              {isEditMode ? (
                                <Checkbox
                                  checked={hasPermission}
                                  onCheckedChange={() => togglePermission(role, perm.permission_key)}
                                  className="mx-auto"
                                />
                              ) : hasPermission ? (
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
