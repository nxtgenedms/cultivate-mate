import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useUserRoles';
import { useUserPermissions, PermissionKey } from '@/hooks/useUserPermissions';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Settings, LayoutDashboard, Leaf, ClipboardList, Bug, Droplets, Package, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/tasks/NotificationBell';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const isAdmin = useIsAdmin();
  const { data: permissions = {} } = useUserPermissions();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user has any admin permissions
  const hasAdminAccess = isAdmin || 
    !!(permissions as any)?.manage_users ||
    !!(permissions as any)?.manage_permissions ||
    !!(permissions as any)?.manage_lookups ||
    !!(permissions as any)?.manage_nomenclature ||
    !!(permissions as any)?.manage_checklists ||
    !!(permissions as any)?.manage_approval_workflows ||
    !!(permissions as any)?.manage_task_field_mappings ||
    !!(permissions as any)?.view_system_settings;

  // Determine first accessible admin page
  const getFirstAdminPath = () => {
    if ((permissions as any)?.manage_users) return '/admin/users';
    if ((permissions as any)?.manage_permissions) return '/admin/roles';
    if ((permissions as any)?.manage_lookups) return '/admin/lookups';
    if ((permissions as any)?.manage_nomenclature) return '/admin/nomenclature';
    if ((permissions as any)?.manage_checklists) return '/admin/checklists';
    if ((permissions as any)?.manage_approval_workflows) return '/admin/approval-workflows';
    if ((permissions as any)?.manage_task_field_mappings) return '/admin/task-mappings';
    if ((permissions as any)?.view_system_settings) return '/admin/checklists';
    return '/admin/users'; // fallback
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', permission: null },
    { icon: Leaf, label: 'Batch', path: '/batch/dashboard', permission: 'view_all_batches' as PermissionKey },
    { icon: ClipboardList, label: 'Tasks', path: '/tasks', permission: 'view_all_tasks' as PermissionKey },
    { icon: Package, label: 'Inventory', path: '/inventory', permission: 'manage_inventory' as PermissionKey },
    { icon: BarChart3, label: 'Reports', path: '/reports', permission: 'view_reports' as PermissionKey },
    { icon: Settings, label: 'Administration', path: getFirstAdminPath(), permission: null },
  ];

  // Filter menu items based on permissions
  const filteredMenuItems = menuItems.filter(item => {
    // Dashboard is always visible
    if (!item.permission) {
      // For Administration, check if user has any admin access
      if (item.path.startsWith('/admin')) {
        return hasAdminAccess;
      }
      return true;
    }
    // Check specific permission
    return (permissions as any)[item.permission];
  });

  const isActivePath = (path: string) => {
    if (path.startsWith('/admin')) {
      return location.pathname.startsWith('/admin');
    }
    if (path === '/batch/dashboard') {
      return location.pathname.startsWith('/batch');
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Tab Navigation */}
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-6 h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">VitaCore CMS</h1>
              <p className="text-xs text-muted-foreground">Cultivation System</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex gap-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info & Sign Out */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium leading-tight">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? 'System Admin' : 'User'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
