import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import MilestoneCard from "./MilestoneCard";
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
  data: {
    type: "column",
    status: id,
  },
}); 

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-xl border border-slate-200">
      <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-white/50 rounded-t-xl">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          {title}
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold tracking-wider">
            {milestones.length}
          </span>
        </h3>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-col gap-4 p-4 flex-grow min-h-[500px] transition-colors"
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
      </div>
    </div>
  );
}