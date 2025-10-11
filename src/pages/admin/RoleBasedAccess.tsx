import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function RoleBasedAccess() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Role-Based Access</h1>
          <p className="text-muted-foreground">Manage role permissions and access controls</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Role Permissions</CardTitle>
            </div>
            <CardDescription>
              Configure what each role can access and modify in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              Role-based access configuration will be implemented here
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
