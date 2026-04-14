import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragEndEvent,
  DragStartEvent,
  MeasuringStrategy,
} from "@dnd-kit/core";
import { useState } from "react";
import KanbanColumn from "./KanbanColumn";
import MilestoneCard from "./MilestoneCard";
import { Milestone, Status } from "../types/types";

const columns: { id: Status; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "in-review", title: "In Review" },
  { id: "done", title: "Done" },
];

interface Props {
  milestones: Milestone[];
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export default function KanbanBoard({
  milestones,
  onEdit,
  onDelete,
  onDragEnd,
}: Props) {
  const [activeMilestone, setActiveMilestone] =
    useState<Milestone | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const milestone = milestones.find(
      (m) => m.id === event.active.id
    );
    if (milestone) setActiveMilestone(milestone);
  };

  const handleDragEndInternal = (event: DragEndEvent) => {
    setActiveMilestone(null);
    onDragEnd(event);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEndInternal}
      measuring={{
      droppable: {
        strategy: MeasuringStrategy.Always,
      },
    }}
    >
      <div className="grid grid-cols-4 gap-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            milestones={milestones.filter(
              (m) => m.status === column.id
            )}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeMilestone ? (
          <div className="w-[320px] rotate-2 shadow-2xl z-[999]">
            <MilestoneCard
              milestone={activeMilestone}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}