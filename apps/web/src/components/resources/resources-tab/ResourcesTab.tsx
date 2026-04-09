import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ResourceTable from './ResourceTable';
import { resources } from '../data/mockData';
import AllocationDetails from '../allocation/AllocationDetails';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ResourcesTab = () => {
  const [selected, setSelected] = useState<string>('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [openAllocation, setOpenAllocation] = useState(false);

  const today = new Date().toDateString();

  useEffect(() => {
    if (resources.length) {
      setSelected(resources[0].id);
    }
  }, []);

  const roles = ['all', ...new Set(resources.map((r) => r.role))];

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || r.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    if (filteredResources.length === 0) {
      setSelected('');
    } else {
      const exists = filteredResources.some((r) => r.id === selected);

      if (!exists) {
        setSelected(filteredResources[0].id);
      }
    }
  }, [search, roleFilter, filteredResources, selected]);

  if (openAllocation) {
    return (
      <AllocationDetails date={today} onBack={() => setOpenAllocation(false)} />
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex justify-between items-center gap-4">
        {/* Filters */}
        <div className="flex gap-3 items-center">
          <Select<string>
            value={roleFilter}
            onValueChange={(value) => {
              if (!value) return;
              setRoleFilter(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>

            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
          <Input
            placeholder="Search by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>

        {/* Add Allocation */}
        <Button
          onClick={() => setOpenAllocation(true)}
          className="bg-blue-600 text-white"
        >
          Add Allocation for today
        </Button>
      </div>

      {/* Resource List */}
      <div className="flex flex-wrap gap-2 overflow-x-auto">
        {filteredResources.map((r) => (
          <div
            key={r.id}
            onClick={() => setSelected(r.id)}
            className={`px-3 py-1 rounded-full border cursor-pointer whitespace-nowrap
              ${selected === r.id ? 'bg-primary text-white' : 'bg-muted'}`}
          >
            {r.name}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="text-center text-muted-foreground py-6">
          No resources found
        </div>
      )}

      {/* Table */}
      {selected && filteredResources.length > 0 && (
        <ResourceTable resourceId={selected} />
      )}
    </div>
  );
};

export default ResourcesTab;
