import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Users, Shield, Database, Tag, FileCheck, Link2, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/admin/users', label: 'User Management', icon: Users },
    { path: '/admin/roles', label: 'Role-Based Access', icon: Shield },
    { path: '/admin/lookups', label: 'Lookup Table', icon: Database },
    { path: '/admin/nomenclature', label: 'Nomenclature Templates', icon: Tag },
    { path: '/admin/checklists', label: 'Checklist Management', icon: FileCheck },
    { path: '/admin/approval-workflows', label: 'Approval Workflows', icon: GitBranch },
    { path: '/admin/task-mappings', label: 'Task Field Mappings', icon: Link2 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Admin Tabs */}
        <div className="border-b">
          <div className="flex gap-1">
            {tabs.map((tab) => {
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
