import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ProjectModal from './ProjectModal';
import ProjectDetails from './ProjectDetails';
import { Button } from '@/components/ui/button';
import { Pencil, Eye, ExternalLink, Clock, Milestone } from 'lucide-react';
import ConfirmDeleteDialog from '../confirmDeleteDialog/ConfirmDeleteDialog';
import { PROJECT_API } from '../../api/project.api';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'Active' | 'Archived'>('Active');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [viewingProject, setViewingProject] = useState<any>(null);

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

  const filtered = projects.filter((p) => p.status === activeTab);

  if (viewingProject) {
    return (
      <ProjectDetails
        project={viewingProject}
        onBack={() => setViewingProject(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex p-1 bg-muted rounded-lg w-full sm:w-auto">
          <button
            className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'Active'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('Active')}
          >
            Active Projects
          </button>
          <button
            className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'Archived'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('Archived')}
          >
            Archived Projects
          </button>
        </div>

        <ProjectModal
          setProjects={setProjects}
          fetchProjects={fetchProjects}
          editData={editData}
          editIndex={editIndex}
          setEditData={setEditData}
          setEditIndex={setEditIndex}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p, i) => (
          <Card key={i} className={`hover:shadow-md transition-all duration-200 group ${
            p.status === 'Archived' 
              ? 'bg-muted/40 border-dashed border-border opacity-90' 
              : 'border-border'
          }`}>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{p.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{p.client}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => {
                    setEditData(p);
                    setEditIndex(i);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  p.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground'
                }`}>
                  {p.status}
                </span>
                {p.docLink && (
                  <a
                    href={p.docLink}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Docs
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Est. Hours</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{p.hours}h</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Milestone className="h-3.5 w-3.5" />
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Milestones</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{p.milestones?.length ?? 0}</p>
                </div>
              </div>

              <Button
                className="w-full shadow-sm"
                onClick={() => setViewingProject(p)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Project
              </Button>
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
              await PROJECT_API.updateProject(project.id, {
                ...project,
                status: 'Archived',
              });
              await fetchProjects();
            } else {
              setProjects((prev) =>
                prev.filter((_, idx) => idx !== deleteIndex),
              );
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
