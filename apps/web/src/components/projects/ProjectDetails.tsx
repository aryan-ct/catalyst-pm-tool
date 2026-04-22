import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Clock, ExternalLink, FileText, Pencil } from 'lucide-react';
import MilestoneFormDialog from './MilestoneFormDialog';

interface Props {
  project: any;
  onBack: () => void;
}

export default function ProjectDetails({ project, onBack }: Props) {
  const [milestones, setMilestones] = useState<any[]>(project.milestones || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);

  const handleMilestoneCreated = (milestone: any) => {
    setMilestones((prev) => [...prev, milestone]);
  };

  const handleMilestoneUpdated = (updated: any) => {
    setMilestones((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const openAdd = () => {
    setEditingMilestone(null);
    setDialogOpen(true);
  };

  const openEdit = (milestone: any) => {
    setEditingMilestone(milestone);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingMilestone(null);
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 text-gray-600">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Project Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{project.name}</h2>
              <p className="text-gray-500 text-sm mt-1">Client: {project.client}</p>
            </div>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                project.status === 'Active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {project.status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Commencement Date</p>
              <p className="font-medium">{project.date || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Estimated Hours</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                {project.hours || '—'}
              </p>
            </div>
            {project.docLink && (
              <div>
                <p className="text-xs text-gray-400">Document</p>
                <a
                  href={project.docLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 flex items-center gap-1 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Milestones Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Milestones
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({milestones.length})
            </span>
          </h3>
          <Button onClick={openAdd} className="bg-blue-600 text-white">
            + Add Milestone
          </Button>
        </div>

        {milestones.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 border border-dashed rounded-lg">
            <FileText className="h-8 w-8 mb-2" />
            <p className="text-sm">No milestones yet. Add your first milestone.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map((m, idx) => (
              <Card key={m.id ?? idx} className="relative hover:shadow-md transition">
                <CardContent className="p-4 space-y-3">
                  {/* Edit pencil */}
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-blue-500 cursor-pointer"
                    title="Edit milestone"
                    onClick={() => openEdit(m)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <div className="pr-6">
                    <p className="text-xs text-gray-400 mb-0.5">Milestone {idx + 1}</p>
                    <h4 className="font-semibold text-base">{m.milestoneName}</h4>
                  </div>

                  {m.milestoneDescription && (
                    <div
                      className="text-sm text-gray-600 line-clamp-3
                                 [&_ul]:list-disc [&_ul]:pl-4
                                 [&_ol]:list-decimal [&_ol]:pl-4"
                      dangerouslySetInnerHTML={{ __html: m.milestoneDescription }}
                    />
                  )}

                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{m.estimatedHours} hrs</span>
                  </div>

                  {m.bugSheet && (
                    <a
                      href={m.bugSheet}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 text-xs flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Bug Sheet
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <MilestoneFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        projectId={project.id}
        editData={editingMilestone}
        onCreated={handleMilestoneCreated}
        onUpdated={handleMilestoneUpdated}
      />
    </div>
  );
}
