import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/lib/enum';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  LayoutGrid,
  Zap,
  Users,
  Calendar,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getMenuItems = () => {
    if (!user) return [];
    switch (user.role) {
      case Roles.MANAGER:
        return [
          { name: 'Projects', path: '/projects', icon: Briefcase },
          { name: 'Project Management', path: '/project-management', icon: LayoutGrid },
          { name: 'Leads', path: '/leads', icon: Zap }
        ];
      case Roles.HR:
        return [
          { name: 'Resources', path: '/resources', icon: Users },
          { name: 'Resource Allocation', path: '/resource-allocation', icon: Calendar }
        ];
      case Roles.BDE:
        return [
          { name: 'Leads', path: '/leads', icon: Zap }
        ];
      case Roles.DEV:
        return [
          { name: 'Project Management', path: '/project-management', icon: LayoutGrid }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  useEffect(() => {
    if (!loading && user && menuItems.length > 0) {
      if (location.pathname === '/') {
        navigate(menuItems[0].path, { replace: true });
      }
    }
  }, [user, loading, location.pathname, menuItems, navigate]);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  const activeItem = menuItems.find(item => location.pathname.startsWith(item.path)) || menuItems[0];

  return (
    <div className="dashboard-layout">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-12 bg-background border-b border-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary" />
          <span className="text-sm font-semibold text-foreground">Catalyst</span>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="flex items-center gap-2 px-3 h-12 border-b border-border shrink-0">
            <div className="size-2 rounded-full bg-primary" />
            <span className="text-sm font-semibold text-foreground">Catalyst</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className={`sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'} flex items-center gap-2`}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                >
                  {Icon && (
                    <Icon className={`size-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                  <span className="flex-1 truncate">{item.name}</span>
                </div>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="shrink-0 px-2 py-3 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-3 gap-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content pt-12 lg:pt-0">
        <div className="page-container">
          <header className="flex items-center justify-between border-b border-border pb-4 mb-6">
            {activeItem && (
              <h1 className="text-lg font-semibold text-foreground">{activeItem.name}</h1>
            )}
          </header>

          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
