import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Milestone } from '../types/types';
import { Avatar } from '@/components/ui/avatar';

interface Props {
  milestone: Milestone;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
}

export default function MilestoneCard({ milestone, onEdit }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: milestone.id,
    data: { type: 'milestone', milestone },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing group/card select-none"
    >
      <Card
        onClick={() => onEdit(milestone)}
        className="bg-card border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer"
      >
        <CardContent className="p-3.5 space-y-2.5">
          {/* Title */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm text-foreground group-hover/card:text-primary transition-colors line-clamp-2 leading-snug pt-0.5">
              {milestone.milestoneName}
            </h4>
          </div>

          {/* Assigned Resources */}
          {milestone.assignedTo && milestone.assignedTo.length > 0 && (
            <div className="flex items-center mt-2 -space-x-1.5">
              {milestone.assignedTo.map((res) => (
                <Avatar
                  key={res.id}
                  name={res.name}
                  className="h-6 w-6 text-[9px] border-2 border-card shadow-sm"
                />
              ))}
            </div>
          )}

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
              <Clock className="h-2.5 w-2.5" />
              <span>{milestone.estimatedHours}h</span>
            </div>
            {milestone.taskType && (
              <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                milestone.taskType === 'bug'
                  ? 'text-red-600 bg-red-50 border-red-100'
                  : 'text-blue-600 bg-blue-50 border-blue-100'
              }`}>
                {milestone.taskType}
              </div>
            )}
            {milestone.taskType === 'bug' && milestone.bugNumber && (
              <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/40">
                <span>#{milestone.bugNumber}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
