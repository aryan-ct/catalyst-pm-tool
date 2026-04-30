import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ResourceModal from './ResourceModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '../ui/button';
import { Pencil, Mail, Shield, UserCircle } from 'lucide-react';
import { Roles } from '@/lib/enum';
import { RESOURCE_API } from '@/api/resource.api';

type Resource = {
  id?: string;
  name: string;
  role: Roles;
  email: string;
  isActive: boolean;
};

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState('All');
  const [editData, setEditData] = useState<Resource | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

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

  const filteredResources = resources.filter((r) =>
    filter === 'All' ? true : r.role === filter,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

        <ResourceModal
          setResources={setResources}
          editData={editData}
          editIndex={editIndex}
          setEditData={setEditData}
          setEditIndex={setEditIndex}
          onRefresh={fetchResources}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((r, i) => (
          <Card key={i} className="hover:shadow-md transition-all duration-200 border-border group">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UserCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground line-clamp-1">{r.name}</h3>
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      r.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      {r.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
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

              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => {
                   setEditData(r);
                   setEditIndex(i);
                }}>
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
