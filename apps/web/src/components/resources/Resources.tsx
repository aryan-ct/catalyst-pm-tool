import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ResourceModal from './ResourceModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '../ui/button';
import { Pencil, Trash2 } from 'lucide-react';

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

              <h3 className="font-semibold text-base">{r.name}</h3>
              <p className="text-sm text-gray-500">Role: {r.role}</p>
              <p className="text-sm text-gray-500">Email: {r.email}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={deleteIndex !== null}
        onOpenChange={() => setDeleteIndex(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resource?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-500">
            Are you sure you want to delete this resource?
          </p>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteIndex(null)}>
              Cancel
            </Button>

            <Button
              className="bg-red-600 text-white"
              onClick={() => {
                setResources((prev) =>
                  prev.filter((_, idx) => idx !== deleteIndex),
                );
                setDeleteIndex(null);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
