import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/lib/enum';
import { Milestone, PMProject, Status } from './types/types';
import { PROJECT_API } from '@/api/project.api';
import { TASK_API } from '@/api/task.api';
import ProjectSelector from './kanban/ProjectSelector';
import MilestoneSelector from './kanban/MilestoneSelector';
import KanbanBoard from './kanban/KanbanBoard';
import TaskDialog from './dialog/TaskDialog';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
  Plus,
  LayoutGrid,
  Layers,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';

const statusToBackend: Record<Status, string> = {
  todo: 'TODO',
  'in-progress': 'IN_PROGRESS',
  'in-review': 'IN_REVIEW',
  done: 'DONE',
};

export default function ProjectManagement() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<PMProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('');
  const [kanbanItems, setKanbanItems] = useState<Milestone[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Milestone | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const isAssignedRole =
        user?.role === Roles.DEV ||
        user?.role === Roles.TESTER ||
        user?.role === Roles.DESIGNER;

      let data = isAssignedRole
        ? await PROJECT_API.getMyProjectsForPM()
        : await PROJECT_API.getProjectsForPM();

      if (isAssignedRole) {
        data = data.filter((p: PMProject) => p.status === 'Active');
      }

      setProjects(data);
      if (data.length > 0) {
        const firstProject = data[0];
        setSelectedProjectId(firstProject.id);
        if (firstProject.milestones.length > 0) {
          const firstMilestone = firstProject.milestones[0];
          setSelectedMilestoneId(firstMilestone.id);
          setKanbanItems(firstMilestone.tasks);
        }
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedMilestone = selectedProject?.milestones.find(
    (m) => m.id === selectedMilestoneId,
  );

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    const project = projects.find((p) => p.id === projectId);
    if (project && project.milestones.length > 0) {
      const first = project.milestones[0];
      setSelectedMilestoneId(first.id);
      setKanbanItems(first.tasks);
    } else {
      setSelectedMilestoneId('');
      setKanbanItems([]);
    }
  };

  const handleMilestoneChange = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    const milestone = selectedProject?.milestones.find(
      (m) => m.id === milestoneId,
    );
    setKanbanItems(milestone?.tasks ?? []);
  };

  const handleSave = (task: Milestone) => {
    setKanbanItems((prev) => {
      const exists = prev.find((t) => t.id === task.id);
      if (exists) return prev.map((t) => (t.id === task.id ? task : t));
      return [...prev, task];
    });

    // Keep project state in sync
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== selectedProjectId) return p;
        return {
          ...p,
          milestones: p.milestones.map((m) => {
            if (m.id !== selectedMilestoneId) return m;
            const existsInMilestone = m.tasks.find((t) => t.id === task.id);
            return {
              ...m,
              tasks: existsInMilestone
                ? m.tasks.map((t) => (t.id === task.id ? task : t))
                : [...m.tasks, task],
            };
          }),
        };
      }),
    );
  };

  const handleDelete = async (id: string) => {
    try {
      await TASK_API.deleteTask(id);
      setKanbanItems((prev) => prev.filter((t) => t.id !== id));
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== selectedProjectId) return p;
          return {
            ...p,
            milestones: p.milestones.map((m) => ({
              ...m,
              tasks: m.tasks.filter((t) => t.id !== id),
            })),
          };
        }),
      );
    } catch (err) {
      console.error('Delete task failed', err);
    }
  };

  const handleEdit = (task: Milestone) => {
    setSelectedTask(task);
    setOpen(true);
  };

  const handleAdd = () => {
    setSelectedTask(null);
    setOpen(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData) return;

    const items = [...kanbanItems];
    const activeIndex = items.findIndex((m) => m.id === activeId);
    if (activeIndex === -1) return;

    const activeMilestone = items[activeIndex];
    const sourceStatus = activeMilestone.status;
    let destinationStatus: Status = sourceStatus;
    let targetIndex = activeIndex;

    if (overData?.type === 'milestone') {
      destinationStatus = overData.milestone.status;
      const sameColItems = items.filter((m) => m.status === destinationStatus);
      const overIndexInCol = sameColItems.findIndex((m) => m.id === overId);
      const globalIndices = items
        .map((m, i) => (m.status === destinationStatus ? i : -1))
        .filter((i) => i !== -1);
      targetIndex = globalIndices[overIndexInCol];
    }

    if (overData?.type === 'column') {
      destinationStatus = overData.status;
      const indicesInCol = items
        .map((m, i) => (m.status === destinationStatus ? i : -1))
        .filter((i) => i !== -1);
      targetIndex =
        indicesInCol.length > 0
          ? indicesInCol[indicesInCol.length - 1] + 1
          : items.length;
    }

    if (sourceStatus === destinationStatus) {
      setKanbanItems(arrayMove(items, activeIndex, targetIndex));
      return;
    }

    const updated = [...items];
    updated[activeIndex] = { ...activeMilestone, status: destinationStatus };
    setKanbanItems(arrayMove(updated, activeIndex, targetIndex));

    try {
      await TASK_API.updateTask(activeMilestone.id, {
        taskStatus: statusToBackend[destinationStatus],
        milestoneId: activeMilestone.milestoneId!,
      });
    } catch (err) {
      console.error('Status update failed', err);
      // Revert optimistic update
      setKanbanItems(items);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="py-20 text-center bg-card rounded-xl border border-dashed border-border">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mx-auto mb-4">
          <LayoutGrid className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          No projects found
        </h3>
        <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
          Create a project first to start managing tasks and milestones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="p-2 rounded-lg bg-primary/10 text-primary hidden sm:block">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <ProjectSelector
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelect={handleProjectChange}
              />
            </div>

            {selectedProject && selectedProject.milestones.length > 0 && (
              <div className="flex items-center gap-2 w-full">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground hidden sm:block">
                  <Layers className="h-4 w-4" />
                </div>
                <MilestoneSelector
                  milestones={selectedProject.milestones}
                  selectedMilestoneId={selectedMilestoneId}
                  onSelect={handleMilestoneChange}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {selectedMilestone?.bugSheet && (
            <Button
              variant="outline"
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-900/50 dark:hover:bg-indigo-950/30 gap-1.5 shadow-sm w-full sm:w-auto sm:ml-2 "
            >
              <a
                href={selectedMilestone.bugSheet}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2"
              >
                <LinkIcon className="h-4 w-4" />
                Bug Sheet
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </Button>
          )}
          {user?.role === Roles.MANAGER && (
            <Button
              onClick={handleAdd}
              disabled={!selectedMilestoneId}
              className="w-full md:w-auto shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {selectedProject && selectedProject.milestones.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <Layers className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">
              No milestones found
            </h3>
            <p className="text-muted-foreground mt-1">
              Add milestones to this project from the Projects tab to start
              tracking tasks.
            </p>
          </div>
        ) : (
          <KanbanBoard
            milestones={kanbanItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDragEnd={handleDragEnd}
          />
        )}
      </div>

      <TaskDialog
        open={open}
        setOpen={setOpen}
        initialData={selectedTask}
        onSave={handleSave}
        onDelete={handleDelete}
        projectMilestones={selectedProject?.milestones ?? []}
        defaultMilestoneId={selectedMilestoneId}
      />
    </div>
  );
}
