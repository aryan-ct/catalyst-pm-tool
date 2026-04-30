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
import { Search, Users2, UserX, SlidersHorizontal } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Users2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground leading-tight">Team Resources</h3>
            <p className="text-sm text-muted-foreground">View individual allocation history per resource.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:w-auto">
          <div className="flex items-center gap-2 text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
            <Select<string>
              value={roleFilter}
              onValueChange={(value) => {
                if (!value) return;
                setRoleFilter(value);
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px] bg-card border-border h-9 text-sm">
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
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search resource..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border h-9 text-sm"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full self-start sm:self-auto whitespace-nowrap">
            <Users2 className="h-3.5 w-3.5" />
            {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'}
          </div>
        </div>
      </div>

      {/* Resource selector pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filteredResources.map((r) => {
          const isSelected = selected === r.id;
          const initials = r.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className={`group flex items-center gap-2.5 pl-2.5 pr-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0
                ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                    : 'bg-card text-foreground border-border hover:border-primary/50 hover:shadow-sm hover:-translate-y-0.5'
                }`}
            >
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-primary/10 text-primary'
                }`}
              >
                {initials}
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span>{r.name}</span>
                <span
                  className={`text-[10px] font-normal ${
                    isSelected ? 'text-white/70' : 'text-muted-foreground'
                  }`}
                >
                  {r.role}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredResources.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mx-auto mb-4">
            <UserX className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-foreground mb-1">No resources found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        selected && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ResourceTable resourceId={selected} />
          </div>
        )
      )}
    </div>
  );
};

export default ResourcesTab;
