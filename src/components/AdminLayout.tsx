import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Users, Shield, Database, Tag, FileCheck, Link2, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserPermissions, PermissionKey } from '@/hooks/useUserPermissions';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: permissions = {} } = useUserPermissions();

  const tabs = [
    { 
      path: '/admin/users', 
      label: 'User Management', 
      icon: Users,
      requiredPermission: 'manage_users' as PermissionKey
    },
    { 
      path: '/admin/roles', 
      label: 'Role-Based Access', 
      icon: Shield,
      requiredPermission: 'manage_permissions' as PermissionKey
    },
    { 
      path: '/admin/lookups', 
      label: 'Lookup Table', 
      icon: Database,
      requiredPermission: 'manage_lookups' as PermissionKey
    },
    { 
      path: '/admin/nomenclature', 
      label: 'Nomenclature Templates', 
      icon: Tag,
      requiredPermission: 'manage_nomenclature' as PermissionKey
    },
    { 
      path: '/admin/checklists', 
      label: 'Checklist Management', 
      icon: FileCheck,
      requiredPermission: 'manage_checklists' as PermissionKey
    },
    { 
      path: '/admin/approval-workflows', 
      label: 'Approval Workflows', 
      icon: GitBranch,
      requiredPermission: 'manage_approval_workflows' as PermissionKey
    },
    { 
      path: '/admin/task-mappings', 
      label: 'Task Field Mappings', 
      icon: Link2,
      requiredPermission: 'manage_task_field_mappings' as PermissionKey
    },
  ];

  // Filter tabs based on permissions
  const filteredTabs = tabs.filter(tab => (permissions as any)[tab.requiredPermission]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Admin Tabs */}
        <div className="border-b">
          <div className="flex gap-1">
            {filteredTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {children}
      </div>
    </Layout>
  );
}
