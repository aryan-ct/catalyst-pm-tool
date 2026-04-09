import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import AllocationSheets from './AllocationSheets';
import ResourcesTab from '../resources-tab/ResourcesTab';
import AllocationDetails from '../allocation/AllocationDetails';
import { RESOURCE_API } from '@/api/resource.api';
import { RESOURCE_ALLOCATIONS_API } from '@/api/resource-allocations.api';

const AllocationTabs = () => {
  const [activeTab, setActiveTab] = useState<'allocation' | 'resources'>(
    'allocation',
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [resources, setResoueces] = useState();
  const [resourceAllocations, setResoueceAllocations] = useState();

  const today = new Date().toDateString();

  const fetchResources = async () => {
    try {
      const resourcesData = await RESOURCE_API.findAllResources();
      setResoueces(resourcesData);
    } catch (error: any) {
      console.log('Failed to fetch resources.');
    }
  };

  const fetchResourceAllocations = async () => {
    try {
      const resourceAllocationsData =
        await RESOURCE_ALLOCATIONS_API.getAllResourceAllocations();
      setResoueceAllocations(resourceAllocationsData);
    } catch (error) {
      console.log('Failed to fetch resource allocations');
    }
  };

  useEffect(() => {
    fetchResources();
    fetchResourceAllocations();
  }, []);

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

export default AllocationTabs;
