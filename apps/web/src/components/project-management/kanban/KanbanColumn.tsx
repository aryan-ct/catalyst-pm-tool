import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import MilestoneCard from "./MilestoneCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Milestone, Status } from "../types/types";

interface Props {
  id: Status;
  title: string;
  milestones: Milestone[];
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
}

export default function KanbanColumn({
  id,
  title,
  milestones,
  onEdit,
  onDelete,
}: Props) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <Card className="bg-muted/30 flex flex-col min-h-[450px] h-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent
        ref={setNodeRef}
        className="flex flex-col gap-3 p-3 flex-grow min-h-[200px] h-auto overflow-visible"
      >
        <SortableContext
          items={milestones.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          {milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}