import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ProjectModal from './ProjectModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash2 } from 'lucide-react';
import ConfirmDeleteDialog from '../confirmDeleteDialog/ConfirmDeleteDialog';
import { PROJECT_API } from '../../api/project.api';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');

  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const fetchProjects = async () => {
    try {
      const data = await PROJECT_API.getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filtered = projects.filter((p) =>
    filter === 'All' ? true : p.status === filter,
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <Select value={filter} onValueChange={(v) => setFilter(v ?? 'All')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <ProjectModal
          setProjects={setProjects}
          fetchProjects={fetchProjects}
          editData={editData}
          editIndex={editIndex}
          setEditData={setEditData}
          setEditIndex={setEditIndex}
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((p, i) => (
          <Card key={i} className="relative hover:shadow-md transition">
            <CardContent className="p-4 space-y-3">
              {/* Edit */}
              <button
                className="absolute top-3 right-4 text-gray-400 hover:text-blue-500 cursor-pointer"
                onClick={() => {
                  setEditData(p);
                  setEditIndex(i);
                }}
              >
                <Pencil className="h-4 w-4" />
              </button>

              {/* Delete */}
              {/* <button
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                onClick={() => setDeleteIndex(i)}
              >
                <Trash2 className="h-4 w-4" />
              </button> */}

              {/* Project Info */}
              <div>
                <p className="text-xs text-gray-500">Project Name:</p>
                <h3 className="font-semibold">{p.name}</h3>
              </div>

              <div>
                <p className="text-xs text-gray-500">Client:</p>
                <p className="text-sm">{p.client}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Status:</p>
                <p className="text-sm">{p.status}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Estimated Hours:</p>
                <p className="text-sm">{p.hours}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Document:</p>
                <a
                  href={p.docLink}
                  className="text-blue-600 text-sm underline"
                  target="_blank"
                >
                  Open Document
                </a>
              </div>

              {/* Milestones */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Milestones:</p>

                <div className="space-y-2">
                  {p.milestones.map((m: any, idx: number) => (
                    <div key={idx} className="border rounded-md p-2 text-sm">
                      <p className="font-medium">
                        {idx + 1}. {m.name}
                      </p>

                      <div
                        className="text-gray-600"
                        dangerouslySetInnerHTML={{ __html: m.desc }}
                      />

                      <p className="text-xs text-gray-500">Hours: {m.hours}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDeleteDialog
        open={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={async () => {
          if (deleteIndex !== null) {
            const project = projects[deleteIndex];
            if (project && project.id) {
              await PROJECT_API.updateProject(project.id, { ...project, status: 'Archived' });
              await fetchProjects();
            } else {
              setProjects((prev) => prev.filter((_, idx) => idx !== deleteIndex));
            }
          }
          setDeleteIndex(null);
        }}
        title="Archive Project?"
        description="Are you sure you want to archive this project?"
      />
    </div>
  );
}
