import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ResourceModal from './ResourceModal';
import ResetPasswordModal from './ResetPasswordModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Pencil, Mail, Shield, UserCircle, Search, KeyRound } from 'lucide-react';
import { Roles } from '@/lib/enum';
import { RESOURCE_API } from '@/api/resource.api';
import { useAuth } from '@/context/AuthContext';

type Resource = {
  id?: string;
  name: string;
  role: Roles;
  email: string;
  isActive: boolean;
};

type ActiveTab = 'active' | 'inactive';

export default function Resources() {
  const { user } = useAuth();
  const isHR = user?.role === Roles.HR;
  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState('All');
  const [nameSearch, setNameSearch] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('active');
  const [editData, setEditData] = useState<Resource | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchResources = async () => {
    try {
      const result = await RESOURCE_API.findAllResources();
      setResources(result);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const filteredResources = resources.filter((r) => {
    const matchesTab = activeTab === 'active' ? r.isActive : !r.isActive;
    const matchesRole = filter === 'All' || r.role === filter;
    const matchesName = r.name.toLowerCase().includes(nameSearch.toLowerCase());
    return matchesTab && matchesRole && matchesName;
  });

  const activeCount = resources.filter((r) => r.isActive).length;
  const inactiveCount = resources.filter((r) => !r.isActive).length;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {(['active', 'inactive'] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'active' ? 'Active' : 'Inactive'}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              activeTab === tab ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {tab === 'active' ? activeCount : inactiveCount}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Name search */}
          <div className="relative w-full sm:w-[220px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name..."
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className="pl-8 bg-white"
            />
          </div>

          {/* Role filter */}
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value ?? 'All')}
          >
            <SelectTrigger className="w-full sm:w-[200px] bg-white">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="All">All Roles</SelectItem>
              <SelectItem value={Roles.MANAGER}>MANAGER</SelectItem>
              <SelectItem value={Roles.DEV}>DEV</SelectItem>
              <SelectItem value={Roles.TESTER}>TESTER</SelectItem>
              <SelectItem value={Roles.DESIGNER}>DESIGNER</SelectItem>
              <SelectItem value={Roles.HR}>HR</SelectItem>
              <SelectItem value={Roles.BDE}>BDE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isHR && (
          <ResourceModal
            setResources={setResources}
            editData={editData}
            editIndex={editIndex}
            setEditData={setEditData}
            setEditIndex={setEditIndex}
            onRefresh={fetchResources}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No {activeTab} resources found.
          </div>
        ) : filteredResources.map((r, i) => (
          <Card key={i} className="hover:shadow-md transition-all duration-200 border-border group">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar name={r.name} className="h-12 w-12 text-base" />
                  <div>
                    <h3 className="font-semibold text-lg text-foreground line-clamp-1">{r.name}</h3>
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      r.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      {r.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
                {isHR && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    onClick={() => {
                      setEditData(r);
                      setEditIndex(i);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{r.role}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm line-clamp-1">{r.email}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                {isHR ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => {
                       setEditData(r);
                       setEditIndex(i);
                    }}>
                      View / Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => setResetTarget({ id: r.id!, name: r.name })}
                    >
                      <KeyRound className="size-3" />
                      Reset
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1 text-xs" disabled>
                    View Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {resetTarget && (
        <ResetPasswordModal
          resourceId={resetTarget.id}
          resourceName={resetTarget.name}
          open={!!resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}
    </div>
  );
}

