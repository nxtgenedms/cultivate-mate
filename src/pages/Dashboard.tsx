import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Loader2, Users, Settings, Leaf } from 'lucide-react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { data: roles, isLoading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleLabels = () => {
    const roleMap: Record<string, string> = {
      assistant_grower: 'Assistant Grower',
      grower: 'Grower',
      manager: 'Manager',
      qa: 'QA',
      supervisor: 'Supervisor',
      it_admin: 'IT Admin',
      business_admin: 'Business Admin',
    };
    return roles?.map(r => roleMap[r]).join(', ') || 'No roles assigned';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to VitaCore CMS - Cannabis Cultivation Management System
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Role(s)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{getRoleLabels()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Modules</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Core cultivation modules</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Configuration</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ready</div>
              <p className="text-xs text-muted-foreground">System configured</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Phase 1 - Foundation & Administration is now complete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">✅ Completed Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>User authentication (login/signup)</li>
                <li>Role-based access control with 7 user roles</li>
                <li>User management for administrators</li>
                <li>Dynamic lookup tables management</li>
                <li>Secure database with Row Level Security</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🚀 Coming Next:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Module 1: Batch & Plant Lifecycle Management</li>
                <li>Module 2: Cultivation Operations & Compliance</li>
                <li>Module 3: IPM & Chemical Management</li>
                <li>Module 4: Hygiene & Sanitation Protocols</li>
                <li>Module 5: Harvest & Post-Processing</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
