import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AllocationSheets from './AllocationSheets';
import ResourcesTab from '../resources-tab/ResourcesTab';
import AllocationDetails from '../allocation/AllocationDetails';
import { ResourceAllocationProvider } from '../ResourceAllocationContext';

const AllocationTabsContent = () => {
  const [activeTab, setActiveTab] = useState<'allocation' | 'resources'>('allocation');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date().toDateString();

  if (selectedDate) {
    return (
      <div className="p-6">
        <AllocationDetails
          date={selectedDate}
          onBack={() => setSelectedDate(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Button
            variant={activeTab === 'allocation' ? 'default' : 'outline'}
            onClick={() => setActiveTab('allocation')}
          >
            Allocation Sheets
          </Button>

          <Button
            variant={activeTab === 'resources' ? 'default' : 'outline'}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </Button>
        </div>

        <Button
          onClick={() => setSelectedDate(today)}
          className="bg-blue-600 text-white"
        >
          Add Allocation for today
        </Button>
      </div>

      {activeTab === 'allocation' ? (
        <AllocationSheets onSelectDate={setSelectedDate} />
      ) : (
        <ResourcesTab />
      )}
    </div>
  );
};

const AllocationTabs = () => (
  <ResourceAllocationProvider>
    <AllocationTabsContent />
  </ResourceAllocationProvider>
);

export default AllocationTabs;
