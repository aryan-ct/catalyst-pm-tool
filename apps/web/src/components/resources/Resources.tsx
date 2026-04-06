import { useState } from 'react';
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
import { Pencil, Trash2 } from 'lucide-react';
import ConfirmDeleteDialog from '../confirmDeleteDialog/ConfirmDeleteDialog';

type Resource = {
  name: string;
  role: string;
  email: string;
};

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState('All');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<Resource | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

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
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Developer">Developer</SelectItem>
            <SelectItem value="Tester">Tester</SelectItem>
            <SelectItem value="Designer">Designer</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="BDE">BDE</SelectItem>
          </SelectContent>
        </Select>

        <ResourceModal
          setResources={setResources}
          editData={editData}
          editIndex={editIndex}
          setEditData={setEditData}
          setEditIndex={setEditIndex}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((r, i) => (
          <Card key={i} className="relative hover:shadow-md transition">
            <CardContent className="p-4 space-y-1">
              <Button
                className="absolute top-3 right-10 text-gray-400 hover:text-blue-500 mr-4"
                onClick={() => {
                  setEditData(r);
                  setEditIndex(i);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <Button
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                onClick={() => setDeleteIndex(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <h3 className="font-bold text-base">{r.name}</h3>
              <div>
                <p className="text-xs text-gray-500">Role:</p>
                <h3 className="font-semibold">{r.role}</h3>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email:</p>
                <h3 className="font-semibold">{r.email}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDeleteDialog
        open={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={() => {
          setResources((prev) => prev.filter((_, idx) => idx !== deleteIndex));
          setDeleteIndex(null);
        }}
        title="Delete Resource?"
        description="Are you sure you want to delete this resource?"
      />
    </div>
  );
}
