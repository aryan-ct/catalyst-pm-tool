import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ProjectModal from './ProjectModal';
import ProjectDetails from './ProjectDetails';
import { Button } from '@/components/ui/button';
import { Pencil, Eye, ExternalLink, Clock, Milestone, Loader2, CalendarCheck } from 'lucide-react';
import ConfirmDeleteDialog from '../confirmDeleteDialog/ConfirmDeleteDialog';
import { PROJECT_API } from '../../api/project.api';
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/lib/enum';
import { RESOURCE_ALLOCATIONS_API } from '@/api/resource-allocations.api';

type MainTab = 'Active' | 'Archived' | 'My';

export default function Projects() {
  const { user } = useAuth();
  const isManager = user?.role === Roles.MANAGER;
  const isHR = user?.role === Roles.HR;

  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<MainTab>(isHR ? 'Active' : 'My');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [viewingProject, setViewingProject] = useState<any>(null);

  // My Projects state
  const [myProjectIds, setMyProjectIds] = useState<string[]>([]);
  const [myProjectsLoading, setMyProjectsLoading] = useState(false);
  const [myProjectsDate, setMyProjectsDate] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const data = await PROJECT_API.getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  };

  const fetchMyAllocations = async () => {
    setMyProjectsLoading(true);
    try {
      const allocations = await RESOURCE_ALLOCATIONS_API.getMyAllocations();

      if (!allocations || allocations.length === 0) {
        setMyProjectIds([]);
        setMyProjectsDate(null);
        return;
      }

      // Find today's allocations first
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayAllocations = allocations.filter((a: any) => {
        const d = new Date(a.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });

      let relevantAllocations = todayAllocations;
      let relevantDate = 'Today';

      if (todayAllocations.length === 0) {
        // Find the most recent past allocation date
        const sorted = [...allocations].sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const latestDate = new Date(sorted[0].createdAt);
        latestDate.setHours(0, 0, 0, 0);

        relevantAllocations = allocations.filter((a: any) => {
          const d = new Date(a.createdAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === latestDate.getTime();
        });

        relevantDate = latestDate.toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric'
        });
      }

      setMyProjectIds(relevantAllocations.map((a: any) => a.projectId));
      setMyProjectsDate(relevantDate);
    } catch (error) {
      // If 404 (no allocations), gracefully show empty state
      setMyProjectIds([]);
      setMyProjectsDate(null);
    } finally {
      setMyProjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (activeTab === 'My') {
      fetchMyAllocations();
    }
  }, [activeTab]);

  const getFilteredProjects = () => {
    if (activeTab === 'My') {
      return projects.filter((p) => myProjectIds.includes(p.id));
    }
    return projects.filter((p) => p.status === activeTab);
  };

  const filtered = getFilteredProjects();

  if (viewingProject) {
    return (
      <ProjectDetails
        project={viewingProject}
        onBack={() => setViewingProject(null)}
      />
    );
  }

  const tabs: { key: MainTab; label: string }[] = [
    ...(!isHR ? [{ key: 'My' as MainTab, label: 'My Projects' }] : []),
    { key: 'Active', label: 'Active Projects' },
    { key: 'Archived', label: 'Archived Projects' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex p-1 bg-muted rounded-lg w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isManager && (
          <ProjectModal
            setProjects={setProjects}
            fetchProjects={fetchProjects}
            editData={editData}
            editIndex={editIndex}
            setEditData={setEditData}
            setEditIndex={setEditIndex}
          />
        )}
      </div>

      {/* My Projects date badge */}
      {activeTab === 'My' && myProjectsDate && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg w-fit border border-border">
          <CalendarCheck className="h-4 w-4 text-primary" />
          <span>Showing allocation from: <strong className="text-foreground">{myProjectsDate}</strong></span>
        </div>
      )}

      {/* Grid */}
      {activeTab === 'My' && myProjectsLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm animate-pulse">Loading your projects...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-card rounded-xl border border-dashed border-border/50 flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <CalendarCheck className="h-8 w-8 text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {activeTab === 'My' ? 'No Assignments Yet' : 'No Projects Found'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                {activeTab === 'My'
                  ? "It looks like you haven't been assigned to any projects in the latest resource allocation yet."
                  : `There are currently no projects in the ${activeTab.toLowerCase()} category.`}
              </p>
              {activeTab === 'My' && (
                <p className="text-xs text-muted-foreground/60 mt-4 italic">
                  Contact HR if you believe this is an error.
                </p>
              )}
            </div>
          ) : (
            filtered.map((p, i) => (
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
                    {isManager && (
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
                    )}
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
            ))
          )}
        </div>
      )}

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
