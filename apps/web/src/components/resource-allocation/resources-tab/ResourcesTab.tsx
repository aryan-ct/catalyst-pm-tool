import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import ResourceTable from './ResourceTable';
import { useResourceAllocation } from '../ResourceAllocationContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

const ResourcesTab = () => {
  const { resources } = useResourceAllocation();
  const [selected, setSelected] = useState<string>('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    if (resources.length > 0 && !selected) {
      setSelected(resources[0].id);
    }
  }, [resources, selected]);

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

  // if (openAllocation) {
  //   return (
  //     <AllocationDetails date={today} onBack={() => setOpenAllocation(false)} />
  //   );
  // }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/50 p-4 rounded-xl border border-border/50">
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
          <Select<string>
            value={roleFilter}
            onValueChange={(value) => {
              if (!value) return;
              setRoleFilter(value);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-card border-border">
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

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resource..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
        </div>
        
        <div className="text-xs font-medium text-muted-foreground px-2">
           {filteredResources.length} resources found
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {filteredResources.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r.id)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 whitespace-nowrap shadow-sm
              ${selected === r.id 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-accent'}`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {filteredResources.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground font-medium text-sm">No resources match your search or filter.</p>
        </div>
      ) : (
        selected && (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <ResourceTable resourceId={selected} />
          </div>
        )
      )}
    </div>
  );
};

export default ResourcesTab;
