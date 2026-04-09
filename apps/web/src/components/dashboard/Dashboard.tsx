import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/lib/enum';
import { Card, CardContent } from '@/components/ui/card';
import Projects from '../projects/Projects';
import Resources from '../resources/Resources';
import Leads from '../leads/Leads';
import ProjectManagement from '../project-management/ProjectManagement';
import AllocationTabs from '../resource-allocation/allocation/AllocationTabs';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();

  const getMenuItems = () => {
    if (!user) return [];
    switch (user.role) {
      case Roles.MANAGER:
        return ['Projects', 'Project Management', 'Leads'];
      case Roles.HR:
        return ['Resources', 'Resource Allocation'];
      case Roles.BDE:
        return ['Leads'];
      default:
        return [];
    }
  };

  const getInitialActiveTab = () => {
    if (!user) return '';
    switch (user.role) {
      case Roles.MANAGER:
        return 'Projects';
      case Roles.HR:
        return 'Resources';
      case Roles.BDE:
        return 'Leads';
      default:
        return '';
    }
  };

  const menuItems = getMenuItems();
  const initialActiveTab = getInitialActiveTab();
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  useEffect(() => {
    if (
      menuItems.length > 0 &&
      (!activeTab || !menuItems.includes(activeTab))
    ) {
      setActiveTab(menuItems[0]);
    }
  }, [menuItems, activeTab]);

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

  const renderContent = () => {
    switch (activeTab) {
      case 'Projects':
        return <Projects />;
      case 'Resources':
        return <Resources />;
      case 'Project Management':
        return <ProjectManagement />;
      case 'Resource Allocation':
        return <AllocationTabs />;
      case 'Leads':
        return <Leads />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-60 bg-white border-r shadow-sm p-4 flex flex-col h-full">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">PM Tool</h2>

        <div className="space-y-3 flex-1">
          {menuItems.map((item) => (
            <Button
              key={item}
              variant={activeTab === item ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                activeTab === item ? 'bg-blue-600 text-white' : ''
              }`}
              onClick={() => setActiveTab(item)}
            >
              {item}
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
            <h2 className="text-xl font-semibold mb-4">{activeTab}</h2>

            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
