import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Milestone, Project, Status } from "./types/types";
import { projectsData } from "./data/projectsData";
import ProjectSelector from "./kanban/ProjectSelector";
import KanbanBoard from "./kanban/KanbanBoard";
import TaskDialog from "./dialog/TaskDialog";
import { DragEndEvent } from "@dnd-kit/core";


export default function ProjectManagement() {
  const [projects, setProjects] =
    useState<Project[]>(projectsData);

  const [selectedProjectId, setSelectedProjectId] =
    useState<string>(projectsData[0].id);

  const [open, setOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] =
    useState<Milestone | null>(null);

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );

  const handleSave = (milestone: Milestone) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === selectedProjectId
          ? {
              ...project,
              milestones: selectedMilestone
                ? project.milestones.map((m) =>
                    m.id === milestone.id ? milestone : m
                  )
                : [...project.milestones, milestone],
            }
          : project
      )
    );
  };

  const handleDelete = (id: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === selectedProjectId
          ? {
              ...project,
              milestones: project.milestones.filter(
                (m) => m.id !== id
              ),
            }
          : project
      )
    );
  };

  const handleEdit = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setOpen(true);
  };

  const handleAdd = () => {
    setSelectedMilestone(null);
    setOpen(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (!over) return;

  const activeId = active.id as string;
  const newStatus = over.id as Status;

  setProjects((prev) =>
    prev.map((project) => {
      if (project.id !== selectedProjectId) return project;

      return {
        ...project,
        milestones: project.milestones.map((milestone) =>
          milestone.id === activeId
            ? { ...milestone, status: newStatus }
            : milestone
        ),
      };
    })
  );
};

  if (!selectedProject) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <ProjectSelector
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelect={setSelectedProjectId}
        />
        <Button onClick={handleAdd}>+ Add Milestone</Button>
      </div>

     <KanbanBoard
        milestones={selectedProject.milestones}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDragEnd={handleDragEnd}
      />

      <TaskDialog
        open={open}
        setOpen={setOpen}
        initialData={selectedMilestone}
        onSave={handleSave}
      />
    </div>
  );
}