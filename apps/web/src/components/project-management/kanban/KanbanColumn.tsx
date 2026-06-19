import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import MilestoneCard from "./MilestoneCard";
import { Milestone, Status } from "../types/types";
import { Circle, Clock4, AlertCircle, CheckCircle2, InboxIcon } from "lucide-react";

interface Props {
  id: Status;
  title: string;
  milestones: Milestone[];
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
  onCommentsCountChange?: (taskId: string, count: number) => void;
}

const columnConfig: Record<
  Status,
  { accent: string; headerBg: string; countBg: string; countText: string; icon: React.ElementType; emptyColor: string }
> = {
  "todo": {
    accent: "border-t-slate-400",
    headerBg: "bg-slate-50",
    countBg: "bg-slate-100",
    countText: "text-slate-500",
    icon: Circle,
    emptyColor: "text-slate-400",
  },
  "in-progress": {
    accent: "border-t-blue-500",
    headerBg: "bg-blue-50/60",
    countBg: "bg-blue-100",
    countText: "text-blue-600",
    icon: Clock4,
    emptyColor: "text-blue-300",
  },
  "in-review": {
    accent: "border-t-amber-500",
    headerBg: "bg-amber-50/60",
    countBg: "bg-amber-100",
    countText: "text-amber-600",
    icon: AlertCircle,
    emptyColor: "text-amber-300",
  },
  "done": {
    accent: "border-t-emerald-500",
    headerBg: "bg-emerald-50/60",
    countBg: "bg-emerald-100",
    countText: "text-emerald-600",
    icon: CheckCircle2,
    emptyColor: "text-emerald-300",
  },
};

export default function KanbanColumn({ id, title, milestones, onEdit, onDelete, onCommentsCountChange }: Props) {
  const { setNodeRef } = useDroppable({
    id,
    data: { type: "column", status: id },
  });

  const config = columnConfig[id];
  const StatusIcon = config.icon;

  return (
    <div
      className={`flex flex-col rounded-xl border border-slate-200 border-t-2 ${config.accent} overflow-hidden max-h-[calc(100vh-14rem)]`}
    >
      {/* Column header */}
      <div className={`px-4 py-3 flex items-center justify-between ${config.headerBg} border-b border-slate-100`}>
        <div className="flex items-center gap-2">
          <StatusIcon className={`size-3.5 ${config.countText}`} />
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${config.countBg} ${config.countText}`}
        >
          {milestones.length}
        </span>
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className="flex flex-col gap-3 p-3 flex-1 overflow-y-auto min-h-[200px] bg-slate-50/50 transition-colors"
      >
        <SortableContext items={milestones.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          {milestones.map((milestone) => (
            <MilestoneCard key={milestone.id} milestone={milestone} onEdit={onEdit} onDelete={onDelete} onCommentsCountChange={onCommentsCountChange} />
          ))}
        </SortableContext>

        {milestones.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 py-10 text-center">
            <InboxIcon className={`size-6 opacity-30 ${config.emptyColor}`} />
            <p className="text-[11px] text-muted-foreground/60 font-medium">No tasks here</p>
            <p className="text-[10px] text-muted-foreground/40">Drag cards or create a new task</p>
          </div>
        )}
      </div>
    </div>
  );
}
