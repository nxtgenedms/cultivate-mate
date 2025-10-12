import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { LayoutDashboard, List, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BatchLayoutProps {
  children: ReactNode;
}

export function BatchLayout({ children }: BatchLayoutProps) {
  const location = useLocation();

  const navItems = [
    { 
      path: '/batch/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      description: 'Overview & Stats' 
    },
    { 
      path: '/batch/master-record', 
      label: 'All Batches', 
      icon: List,
      description: 'Master Records' 
    },
    { 
      path: '/batch/analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      description: 'Reports & Insights' 
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Modern Navigation */}
        <div className="border-b bg-card">
          <nav className="flex space-x-1 overflow-x-auto p-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 min-w-fit py-3 px-4 rounded-lg transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{item.label}</span>
                    <span className="text-xs opacity-70">{item.description}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Page content */}
        {children}
      </div>
    </Layout>
  );
}
