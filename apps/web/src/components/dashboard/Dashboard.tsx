import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/lib/enum';
import { Card, CardContent } from '@/components/ui/card';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    if (!user) return [];
    switch (user.role) {
      case Roles.MANAGER:
        return [
          { name: 'Projects', path: '/projects' },
          { name: 'Project Management', path: '/project-management' },
          { name: 'Leads', path: '/leads' }
        ];
      case Roles.HR:
        return [
          { name: 'Resources', path: '/resources' },
          { name: 'Resource Allocation', path: '/resource-allocation' }
        ];
      case Roles.BDE:
        return [
          { name: 'Leads', path: '/leads' }
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
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  const activeItem = menuItems.find(item => location.pathname.startsWith(item.path)) || menuItems[0];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-60 bg-white border-r shadow-sm p-4 flex flex-col h-full">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">PM Tool</h2>

        <div className="space-y-3 flex-1">
          {menuItems.map((item) => (
            <Button
              key={item.name}
              variant={location.pathname.startsWith(item.path) ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                location.pathname.startsWith(item.path) ? 'bg-blue-600 text-white' : ''
              }`}
              onClick={() => navigate(item.path)}
            >
              {item.name}
            </Button>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 justify-start"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6">
        <Card className="h-full shadow-md">
          <CardContent className="p-6 h-full overflow-y-auto">
            {activeItem && <h2 className="text-xl font-semibold mb-4">{activeItem.name}</h2>}
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
