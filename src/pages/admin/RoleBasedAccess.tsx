import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Search, Settings, Eye } from 'lucide-react';
import { UserPermissionsModal } from '@/components/admin/UserPermissionsModal';
import { PermissionsMatrix } from '@/components/admin/PermissionsMatrix';
import { AppRole } from '@/hooks/useUserRoles';

interface UserWithRoles {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  roles: { role: AppRole }[];
  permission_overrides: { permission_key: string; is_granted: boolean }[];
}

export default function RoleBasedAccess() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-with-permissions'],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_active')
        .order('full_name');

      if (profileError) throw profileError;

      // Then get roles and permission overrides for each user
      const usersWithData = await Promise.all(
        profiles.map(async (profile) => {
          const [rolesResult, overridesResult] = await Promise.all([
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', profile.id),
            supabase
              .from('user_permission_overrides')
              .select('permission_key, is_granted')
              .eq('user_id', profile.id),
          ]);

          return {
            ...profile,
            roles: rolesResult.data || [],
            permission_overrides: overridesResult.data || [],
          };
        })
      );

      return usersWithData as UserWithRoles[];
    },
  });

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.roles.some((r) => r.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const handleManagePermissions = (user: UserWithRoles) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Role-Based Access Control
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage role permissions and grant custom user access
          </p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users">
              <Settings className="h-4 w-4 mr-2" />
              User Permissions
            </TabsTrigger>
            <TabsTrigger value="matrix">
              <Eye className="h-4 w-4 mr-2" />
              Permissions Matrix
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Permissions Management</CardTitle>
                <CardDescription>
                  View and manage custom permissions for individual users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Loading users...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{user.full_name}</h3>
                            {!user.is_active && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {user.roles.map((r, idx) => (
                              <Badge key={idx} variant="outline">
                                {getRoleLabel(r.role)}
                              </Badge>
                            ))}
                            {user.permission_overrides.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {user.permission_overrides.length} custom permission
                                {user.permission_overrides.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManagePermissions(user)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Permissions
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matrix">
            <PermissionsMatrix />
          </TabsContent>
        </Tabs>
      </div>

      {selectedUser && (
        <UserPermissionsModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          userId={selectedUser.id}
          userName={selectedUser.full_name}
          userRole={selectedUser.roles[0]?.role || 'No role assigned'}
        />
      )}
    </AdminLayout>
  );
}
