import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Milestone, PMProject, Status } from "./types/types";
import { PROJECT_API } from "@/api/project.api";
import { TASK_API } from "@/api/task.api";
import ProjectSelector from "./kanban/ProjectSelector";
import MilestoneSelector from "./kanban/MilestoneSelector";
import KanbanBoard from "./kanban/KanbanBoard";
import TaskDialog from "./dialog/TaskDialog";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

const statusToBackend: Record<Status, string> = {
  "todo": "TODO",
  "in-progress": "IN_PROGRESS",
  "in-review": "IN_REVIEW",
  "done": "DONE",
};

export default function ProjectManagement() {
  const [projects, setProjects] = useState<PMProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("");
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
      const data = await PROJECT_API.getProjectsForPM();
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
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    const project = projects.find((p) => p.id === projectId);
    if (project && project.milestones.length > 0) {
      const first = project.milestones[0];
      setSelectedMilestoneId(first.id);
      setKanbanItems(first.tasks);
    } else {
      setSelectedMilestoneId("");
      setKanbanItems([]);
    }
  };

  const handleMilestoneChange = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    const milestone = selectedProject?.milestones.find((m) => m.id === milestoneId);
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
      })
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
        })
      );
    } catch (err) {
      console.error("Delete task failed", err);
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

    if (overData?.type === "milestone") {
      destinationStatus = overData.milestone.status;
      const sameColItems = items.filter((m) => m.status === destinationStatus);
      const overIndexInCol = sameColItems.findIndex((m) => m.id === overId);
      const globalIndices = items
        .map((m, i) => (m.status === destinationStatus ? i : -1))
        .filter((i) => i !== -1);
      targetIndex = globalIndices[overIndexInCol];
    }

    if (overData?.type === "column") {
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
      console.error("Status update failed", err);
      // Revert optimistic update
      setKanbanItems(items);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64 text-muted-foreground">
        Loading projects...
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-64 text-muted-foreground">
        No projects found. Create a project first.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelect={handleProjectChange}
          />
          {selectedProject && selectedProject.milestones.length > 0 && (
            <MilestoneSelector
              milestones={selectedProject.milestones}
              selectedMilestoneId={selectedMilestoneId}
              onSelect={handleMilestoneChange}
            />
          )}
        </div>
        <Button
          onClick={handleAdd}
          disabled={!selectedMilestoneId}
        >
          + Add Task
        </Button>
      </div>

      {selectedProject && selectedProject.milestones.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No milestones in this project. Add milestones from the Projects tab.
        </div>
      ) : (
        <KanbanBoard
          milestones={kanbanItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDragEnd={handleDragEnd}
        />
      )}

      <TaskDialog
        open={open}
        setOpen={setOpen}
        initialData={selectedTask}
        onSave={handleSave}
        projectMilestones={selectedProject?.milestones ?? []}
        defaultMilestoneId={selectedMilestoneId}
      />
    </div>
  );
}
