import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPermissions, PermissionKey } from '@/hooks/useUserPermissions';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: PermissionKey;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission,
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { data: permissions = {}, isLoading: permissionsLoading } = useUserPermissions();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth if not logged in and auth is required
    if (!loading && !user && requireAuth) {
      navigate('/auth');
    }
  }, [user, loading, requireAuth, navigate]);

  // Show loading state while checking auth and permissions
  if (loading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (requireAuth && !user) {
    return null;
  }

  // Check if user has required permission
  if (requiredPermission && !(permissions as any)[requiredPermission]) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access this page. Please contact an administrator if you believe this is an error.
              </p>
            </div>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
