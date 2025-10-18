import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { LayoutDashboard, List } from 'lucide-react';
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
                    'flex items-center gap-1.5 min-w-fit py-1.5 px-2.5 rounded-lg transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium text-xs leading-tight">{item.label}</span>
                    <span className="text-[10px] opacity-70 leading-tight">{item.description}</span>
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
