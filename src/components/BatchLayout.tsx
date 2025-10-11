import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ClipboardCheck, ClipboardList, Skull, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BatchLayoutProps {
  children: ReactNode;
}

export function BatchLayout({ children }: BatchLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/batch/cloning-checklist', label: 'Cloning Pre-Start', icon: ClipboardCheck, sof: 'HVCSOF0011' },
    { path: '/batch/transplant-log', label: 'Cloning & Transplant', icon: ClipboardList, sof: 'HVCSOF0012' },
    { path: '/batch/mortality', label: 'Mortality & Discard', icon: Skull, sof: 'HVCSOF0015' },
    { path: '/batch/master-record', label: 'Master Record', icon: BarChart3, sof: 'HVCSOF009' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Batch Management Header */}
        <div>
          <h1 className="text-3xl font-bold">Batch & Plant Lifecycle Management</h1>
          <p className="text-muted-foreground">Central tracking from cloning through final disposition</p>
        </div>

        {/* Batch Tabs */}
        <div className="border-b">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{tab.label}</span>
                  <span className="text-xs text-muted-foreground">{tab.sof}</span>
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
