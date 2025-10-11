import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useUserRoles';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Settings, LayoutDashboard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', adminOnly: false },
    { icon: Users, label: 'User Management', path: '/admin/users', adminOnly: true },
    { icon: Settings, label: 'Lookup Management', path: '/admin/lookups', adminOnly: true },
  ];

  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6 justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">VitaCore CMS</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card p-4">
          <nav className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
