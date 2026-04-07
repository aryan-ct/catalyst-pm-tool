import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Projects from '../projects/Projects';
import Resources from '../resources/Resources';
import Leads from '../leads/Leads';
import ResourceAllocation from '../resource-allocation/ResourceAllocation';
import ProjectManagement from '../project-management/ProjectManagement';

const menuItems = [
  'Projects',
  'Resources',
  'Project Management',
  'Resource Allocation',
  'Leads'
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Projects');

  const renderContent = () => {
    switch (activeTab) {
      case 'Projects':
        return <Projects />;
      case 'Resources':
        return <Resources />;
      case 'Project Management':
        return <ProjectManagement/>;
      case 'Resource Allocation':
        return <ResourceAllocation/>;
        case 'Leads':
        return <Leads/>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-60 bg-white border-r shadow-sm p-4 space-y-3">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">PM Tool</h2>

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
