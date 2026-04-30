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
  ChevronRight,
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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeItem = menuItems.find(item => location.pathname.startsWith(item.path)) || menuItems[0];

  return (
    <div className="dashboard-layout">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-border flex items-center justify-between px-4 z-50">
        <h2 className="text-xl font-bold text-primary">Catalyst</h2>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center px-4 py-6 mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-primary">Catalyst</h2>
          </div>

          <nav className="space-y-1 flex-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className={`sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                >
                  {Icon && <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />}
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 text-primary/50" />}
                </div>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start transition-colors px-4 py-6"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content pt-16 lg:pt-0">
        <div className="page-container">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                {activeItem && <h1 className="text-3xl font-bold tracking-tight text-foreground">{activeItem.name}</h1>}
                <p className="text-muted-foreground mt-1 text-sm">Welcome back! Here's what's happening with your {activeItem?.name.toLowerCase()}.</p>
              </div>
              <div className="hidden md:block">
                {/* Global actions can go here */}
              </div>
            </div>
          </header>

          <div className="pb-12">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
