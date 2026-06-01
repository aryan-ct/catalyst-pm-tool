import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AllocationSheets from './AllocationSheets';
import ResourcesTab from '../resources-tab/ResourcesTab';
import AllocationDetails from '../allocation/AllocationDetails';
import { ResourceAllocationProvider, useResourceAllocation } from '../ResourceAllocationContext';
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/lib/enum';

const AllocationTabsContent = () => {
  const [activeTab, setActiveTab] = useState<'allocation' | 'resources'>('allocation');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { user } = useAuth();
  const isHR = user?.role === Roles.HR || user?.role === Roles.JR_HR;
  const { allocations } = useResourceAllocation();

  const today = new Date().toDateString();
  const hasTodayAllocation = allocations.some((a) => a.date === today);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex p-1 bg-muted rounded-lg w-full sm:w-auto">
          <button
            className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'allocation' 
                ? 'bg-card text-primary shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('allocation')}
          >
            {isHR ? "Allocation Sheets" : "My Allocation"}
          </button>

          <button
            className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'resources' 
                ? 'bg-card text-primary shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('resources')}
          >
            {isHR ? "Resources" : "Team Allocations"}
          </button>
        </div>

        {isHR && (
          <Button
            onClick={() => setSelectedDate(today)}
            className="w-full sm:w-auto shadow-sm"
          >
            {hasTodayAllocation ? 'Update Allocation for today' : 'Add Allocation for today'}
          </Button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6 min-h-[400px]">
        {activeTab === 'allocation' ? (
          <AllocationSheets onSelectDate={setSelectedDate} />
        ) : (
          <ResourcesTab onSelectDate={setSelectedDate} />
        )}
      </div>
    </div>
  );
};

const AllocationTabs = () => (
  <ResourceAllocationProvider>
    <AllocationTabsContent />
  </ResourceAllocationProvider>
);

export default AllocationTabs;
