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
import { Pencil } from 'lucide-react';
// import ConfirmDeleteDialog from '../confirmDeleteDialog/ConfirmDeleteDialog';
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
  // const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
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
      <div className="flex justify-between items-center">
        <Select
          value={filter}
          onValueChange={(value) => setFilter(value ?? 'All')}
        >
          <SelectTrigger className="w-[180px]">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((r, i) => (
          <Card key={i} className="relative hover:shadow-md transition">
            <CardContent className="p-4 space-y-1">
              <Button
                className="absolute top-3 right-1 text-gray-400 hover:text-blue-500 mr-4"
                onClick={() => {
                  setEditData(r);
                  setEditIndex(i);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              {/* <Button
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                onClick={() => setDeleteIndex(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button> */}

              <h3 className="font-bold text-base">{r.name}</h3>
              <div>
                <p className="text-xs text-gray-500">Role:</p>
                <h3 className="font-semibold">{r.role}</h3>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email:</p>
                <h3 className="font-semibold">{r.email}</h3>
              </div>

              <div
                className={`w-full text-center mt-3 mb-0 px-3 py-2 rounded-md ${r.isActive ? 'bg-green-300' : 'bg-gray-200'}`}
              >
                {r.isActive ? 'Active' : 'In active'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* <ConfirmDeleteDialog
        open={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={async () => {
          if (deleteIndex !== null) {
            // const resourceToDelete = resources[deleteIndex];
            // assuming there's an API for this: await axiosInstance.delete(`/resources/${resourceToDelete.id}`)
            // if not, we just refresh
            setResources((prev) =>
              prev.filter((_, idx) => idx !== deleteIndex),
            );
            setDeleteIndex(null);
          }
        }}
        title="Delete Resource?"
        description="Are you sure you want to delete this resource?"
      /> */}
    </div>
  );
}
