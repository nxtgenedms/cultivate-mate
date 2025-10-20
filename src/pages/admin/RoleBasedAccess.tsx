import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Search, Settings, Eye, Users, Grid3x3 } from 'lucide-react';
import { UserPermissionsModal } from '@/components/admin/UserPermissionsModal';
import { PermissionsMatrix } from '@/components/admin/PermissionsMatrix';
import { useAllPermissions, useUsersWithPermissions } from '@/hooks/useUserPermissions';
import { AppRole } from '@/hooks/useUserRoles';

export default function RoleBasedAccess() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: permissions = [], isLoading: permissionsLoading } = useAllPermissions();
  const { data: users = [], isLoading: usersLoading } = useUsersWithPermissions();

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.roles.some((role: string) => role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      it_admin: 'IT Admin',
      business_admin: 'Business Admin',
      supervisor: 'Supervisor',
      manager: 'Manager',
      qa: 'QA',
      grower: 'Grower',
      assistant_grower: 'Assistant Grower',
    };
    return labels[role] || role;
  };

  const handleManagePermissions = (user: any) => {
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
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Permissions
            </TabsTrigger>
            <TabsTrigger value="matrix" className="flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              Permissions Matrix
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Permissions Management</CardTitle>
                <CardDescription>
                  View and manage custom permissions for individual users. Custom permissions override default role-based permissions.
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

                {usersLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Loading users...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user: any) => (
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
                            {user.roles.map((role: string, idx: number) => (
                              <Badge key={idx} variant="outline">
                                {getRoleLabel(role)}
                              </Badge>
                            ))}
                            {user.roles.length === 0 && (
                              <Badge variant="outline" className="text-muted-foreground">
                                No Role
                              </Badge>
                            )}
                            {user.overrides.length > 0 && (
                              <Badge variant="default" className="ml-2">
                                {user.overrides.length} Custom
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

          <TabsContent value="matrix" className="space-y-4">
            <PermissionsMatrix />
          </TabsContent>
        </Tabs>

        {selectedUser && (
          <UserPermissionsModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            userId={selectedUser.id}
            userName={selectedUser.full_name}
            userRole={selectedUser.roles[0] || 'No role'}
          />
        )}
      </div>
    </AdminLayout>
  );
}
