import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/lib/enum';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import ConfirmDeleteDialog from '@/components/confirmDeleteDialog/ConfirmDeleteDialog';
import {
  Briefcase,
  LayoutGrid,
  Zap,
  Users,
  Calendar,
  LogOut,
  Menu,
  X,
  KeyRound,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import catalystLogo from '@/assets/catalyst-logo.svg';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const getMenuItems = () => {
    if (!user) return [];
    
    let items: any[] = [];
    switch (user.role) {
      case Roles.MANAGER:
        items = [
          {
            name: 'Task Management',
            path: '/task-management',
            icon: LayoutGrid,
          },
          { name: 'Leads', path: '/leads', icon: Zap },
        ];
        break;
      case Roles.HR:
      case Roles.JR_HR:
        items = [
          { name: 'Resources', path: '/resources', icon: Users },
        ];
        break;
      case Roles.BDE:
        items = [
          { name: 'Leads', path: '/leads', icon: Zap },
        ];
        break;
      case Roles.DEV:
      case Roles.TESTER:
      case Roles.DESIGNER:
        items = [
          {
            name: 'Task Management',
            path: '/task-management',
            icon: LayoutGrid,
          },
        ];
        break;
    }
    
    // Items accessible by everyone
    items.unshift({ name: 'Projects', path: '/projects', icon: Briefcase });

    items.push({
      name: 'Resource Allocation',
      path: '/resource-allocation',
      icon: Calendar,
    });

    return items;
  };

  const menuItems = getMenuItems();

  const settingsItem = { name: 'Change Password', path: '/settings', icon: KeyRound };
  const navItems = (user?.role === Roles.HR || user?.role === Roles.JR_HR) ? menuItems : [...menuItems, settingsItem];

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

  const activeItem =
    navItems.find((item) =>
      location.pathname.startsWith(item.path),
    ) || menuItems[0];

  return (
    <div className="dashboard-layout">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-12 bg-background border-b border-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <img src={catalystLogo} alt="Catalyst" className="h-6 w-6" />
          <span className="text-sm font-semibold text-foreground">Catalyst</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <X className="size-4" />
          ) : (
            <Menu className="size-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`sidebar ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="flex items-center gap-2 px-3 h-12 border-b border-border shrink-0">
            <img src={catalystLogo} alt="Catalyst" className="h-6 w-6" />
            <span className="text-sm font-semibold text-foreground">Catalyst</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
            {navItems.map((item) => {
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
                    <Icon
                      className={`size-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                    />
                  )}
                  <span className="flex-1 truncate">{item.name}</span>
                </div>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          {user && (
            <div className="px-4 py-4 border-t border-border">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={user?.name || 'HR'} className="border border-primary/20" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground truncate capitalize">
                      {user.name || "HR"}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 truncate">
                      {user.role}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => setIsLogoutDialogOpen(true)}
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Confirmation Modal */}
      <ConfirmDeleteDialog
        open={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        description="Are you sure you want to log out of your account?"
        confirmText="Logout"
      />

      {/* Main Content */}
      <main className="main-content pt-12 lg:pt-0">
        <div className="page-container">
          <header className="flex items-center justify-between border-b border-border pb-4 mb-6">
            {activeItem && (
              <h1 className="text-lg font-semibold text-foreground">
                {activeItem.name}
              </h1>
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
