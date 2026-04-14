import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Milestone, Project, Status } from "./types/types";
import { projectsData } from "./data/projectsData";
import ProjectSelector from "./kanban/ProjectSelector";
import KanbanBoard from "./kanban/KanbanBoard";
import TaskDialog from "./dialog/TaskDialog";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";


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
  const overId = over.id as string;

  const activeData = active.data.current;
  const overData = over.data.current;

  if (!activeData) return;

  setProjects((prevProjects) =>
    prevProjects.map((project) => {
      if (project.id !== selectedProjectId) return project;

      const milestones = [...project.milestones];

      const activeIndex = milestones.findIndex(
        (m) => m.id === activeId
      );
      if (activeIndex === -1) return project;

      const activeMilestone = milestones[activeIndex];
      const sourceStatus = activeMilestone.status;

      let destinationStatus: Status = sourceStatus;
      let targetIndex = activeIndex;

      // Case 1: Dropped over another milestone
      if (overData?.type === "milestone") {
        const overMilestone = overData.milestone;
        destinationStatus = overMilestone.status;

        const sameColumnMilestones = milestones.filter(
          (m) => m.status === destinationStatus
        );

        const overIndexInColumn = sameColumnMilestones.findIndex(
          (m) => m.id === overId
        );

        const globalIndices = milestones
          .map((m, index) =>
            m.status === destinationStatus ? index : -1
          )
          .filter((index) => index !== -1);

        targetIndex = globalIndices[overIndexInColumn];
      }

      // Case 2: Dropped over a column
      if (overData?.type === "column") {
        destinationStatus = overData.status;

        const indicesInColumn = milestones
          .map((m, index) =>
            m.status === destinationStatus ? index : -1
          )
          .filter((index) => index !== -1);

        targetIndex =
          indicesInColumn.length > 0
            ? indicesInColumn[indicesInColumn.length - 1] + 1
            : milestones.length;
      }

      // Reordering within the same column
      if (sourceStatus === destinationStatus) {
        return {
          ...project,
          milestones: arrayMove(milestones, activeIndex, targetIndex),
        };
      }

      // Moving to a different column
      const updatedMilestones = [...milestones];
      updatedMilestones[activeIndex] = {
        ...activeMilestone,
        status: destinationStatus,
      };

      return {
        ...project,
        milestones: arrayMove(
          updatedMilestones,
          activeIndex,
          targetIndex
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