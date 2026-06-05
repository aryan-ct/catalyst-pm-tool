import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ProjectModal from './ProjectModal';
import ProjectDetails from './ProjectDetails';
import { Button } from '@/components/ui/button';
import { Pencil, Eye, ExternalLink, Clock, Milestone, Loader2, CalendarCheck, Briefcase } from 'lucide-react';
import ConfirmDeleteDialog from '../confirmDeleteDialog/ConfirmDeleteDialog';
import { PROJECT_API } from '../../api/project.api';
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/lib/enum';
import { RESOURCE_ALLOCATIONS_API } from '@/api/resource-allocations.api';

type ManagerTab = 'MyToday' | 'Active';

export default function Projects() {
  const { user } = useAuth();
  const isManager = user?.role === Roles.MANAGER;
  const isDevOrTester = user?.role === Roles.DEV || user?.role === Roles.TESTER;

  const [projects, setProjects] = useState<any[]>([]);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [viewingProject, setViewingProject] = useState<any>(null);

  // Manager tab state
  const [managerTab, setManagerTab] = useState<ManagerTab>('MyToday');

  // Allocation state (used by manager + dev/tester)
  const [todayProjectIds, setTodayProjectIds] = useState<string[]>([]);
  const [previousProjectIds, setPreviousProjectIds] = useState<string[]>([]);
  const [allocationsLoading, setAllocationsLoading] = useState(false);

  // Legacy tab state for HR / BDE / DESIGNER
  const [legacyTab, setLegacyTab] = useState<'Active' | 'Archived'>('Active');

  const fetchProjects = async () => {
    try {
      const data = await PROJECT_API.getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  };

  const fetchMyAllocations = async () => {
    setAllocationsLoading(true);
    try {
      const allocations = await RESOURCE_ALLOCATIONS_API.getMyAllocations();

      if (!allocations || allocations.length === 0) {
        setTodayProjectIds([]);
        setPreviousProjectIds([]);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayIds: string[] = [];
      const previousIdsSet = new Set<string>();

      for (const a of allocations) {
        if (!a.projectId) continue; // skip note-only entries
        const d = new Date(a.createdAt);
        d.setHours(0, 0, 0, 0);
        if (d.getTime() === today.getTime()) {
          todayIds.push(a.projectId);
        } else {
          previousIdsSet.add(a.projectId);
        }
      }

      setTodayProjectIds(todayIds);
      setPreviousProjectIds([...previousIdsSet]);
    } catch {
      setTodayProjectIds([]);
      setPreviousProjectIds([]);
    } finally {
      setAllocationsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (isManager || isDevOrTester) {
      fetchMyAllocations();
    }
  }, []);

  if (viewingProject) {
    return (
      <ProjectDetails
        project={viewingProject}
        onBack={() => setViewingProject(null)}
      />
    );
  }

  // ── Project card ──────────────────────────────────────────────────────────
  const renderCard = (p: any, i: number) => (
    <Card
      key={i}
      className="hover:shadow-md transition-all duration-200 group border-border"
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {p.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">{p.client}</p>
          </div>
          {isManager && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => { setEditData(p); setEditIndex(i); }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
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

        <Button className="w-full shadow-sm" onClick={() => setViewingProject(p)}>
          <Eye className="h-4 w-4 mr-2" />
          View Project
        </Button>
      </CardContent>
    </Card>
  );

  const renderGrid = (filtered: any[], loading: boolean, emptyMessage: string, emptySubMessage?: string) => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm animate-pulse">Loading projects...</p>
        </div>
      );
    }
    if (filtered.length === 0) {
      return (
        <div className="py-14 text-center bg-card rounded-xl border border-dashed border-border/50 flex flex-col items-center justify-center">
          <div className="h-14 w-14 rounded-full bg-primary/5 flex items-center justify-center mb-4">
            <CalendarCheck className="h-7 w-7 text-primary/40" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">{emptyMessage}</h3>
          {emptySubMessage && (
            <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">{emptySubMessage}</p>
          )}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p, i) => renderCard(p, i))}
      </div>
    );
  };

  // ── MANAGER layout (tabs) ─────────────────────────────────────────────────
  if (isManager) {
    const managerTabs: { key: ManagerTab; label: string }[] = [
      { key: 'MyToday', label: 'My Projects' },
      { key: 'Active', label: 'Active Projects' },
    ];

    const todayProjects = projects.filter(
      (p) => todayProjectIds.includes(p.id) && p.status !== 'Archived'
    );
    const activeProjects = projects.filter((p) => p.status === 'Active');

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex p-1 bg-muted rounded-lg w-full sm:w-auto">
            {managerTabs.map((tab) => (
              <button
                key={tab.key}
                className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  managerTab === tab.key
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setManagerTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
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

        {managerTab === 'MyToday' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg w-fit border border-border">
            <CalendarCheck className="h-4 w-4 text-primary" />
            <span>
              Showing today's allocation:{' '}
              <strong className="text-foreground">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </strong>
            </span>
          </div>
        )}

        {managerTab === 'MyToday'
          ? renderGrid(todayProjects, allocationsLoading, "No Allocations Today", "You haven't been allocated to any projects today.")
          : renderGrid(activeProjects, false, "No Active Projects", "There are currently no active projects.")}

        <ConfirmDeleteDialog
          open={deleteIndex !== null}
          onClose={() => setDeleteIndex(null)}
          onConfirm={async () => {
            if (deleteIndex !== null) {
              const project = projects[deleteIndex];
              if (project?.id) {
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

  // ── DEV / TESTER layout (two vertical sections, no tabs) ─────────────────
  if (isDevOrTester) {
    const todayProjects = projects.filter(
      (p) => todayProjectIds.includes(p.id) && p.status !== 'Archived'
    );
    const previousProjects = projects.filter(
      (p) => previousProjectIds.includes(p.id) && p.status !== 'Archived'
    );

    return (
      <div className="space-y-10 overflow-x-hidden">
        {/* Section 1 — Today's Allocations */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">Today's Allocations</h2>
              <p className="text-xs text-muted-foreground truncate">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          {renderGrid(
            todayProjects,
            allocationsLoading,
            'No Allocations Today',
            "You haven't been assigned to any projects in today's allocation."
          )}
        </section>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Section 2 — My Projects */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">My Projects</h2>
              <p className="text-xs text-muted-foreground">Projects from all previous resource allocations</p>
            </div>
          </div>
          {renderGrid(
            previousProjects,
            allocationsLoading,
            'No Previous Projects',
            "You haven't been allocated to any projects in past allocations."
          )}
        </section>
      </div>
    );
  }

  // ── Legacy layout (HR / BDE / DESIGNER) ──────────────────────────────────
  const legacyTabs: { key: 'Active' | 'Archived'; label: string }[] = [
    { key: 'Active', label: 'Active Projects' },
    { key: 'Archived', label: 'Archived Projects' },
  ];
  const legacyFiltered = projects.filter((p) => p.status === legacyTab);

  return (
    <div className="space-y-6">
      <div className="flex p-1 bg-muted rounded-lg w-full sm:w-auto">
        {legacyTabs.map((tab) => (
          <button
            key={tab.key}
            className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              legacyTab === tab.key
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setLegacyTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {legacyFiltered.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-card rounded-xl border border-dashed border-border/50 flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <CalendarCheck className="h-8 w-8 text-primary/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No Projects Found</h3>
            <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
              There are currently no projects in the {legacyTab.toLowerCase()} category.
            </p>
          </div>
        ) : (
          legacyFiltered.map((p, i) => renderCard(p, i))
        )}
      </div>
    </div>
  );
}
