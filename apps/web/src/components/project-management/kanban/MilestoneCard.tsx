import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Pencil, Trash, MoreVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Milestone } from '../types/types';

interface Props {
  milestone: Milestone;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
}

export default function MilestoneCard({ milestone, onEdit, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: milestone.id,
    data: {
      type: 'milestone',
      milestone,
    },
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
      className="cursor-grab active:cursor-grabbing group/card"
    >
      <Card className="bg-card border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-semibold text-foreground group-hover/card:text-primary transition-colors line-clamp-2 leading-tight">
              {milestone.milestoneName}
            </h4>
            <div className="flex shrink-0">
               <Button
                size="icon-xs"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onEdit(milestone);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete(milestone.id);
                }}
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {milestone.milestoneDescription && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {milestone.milestoneDescription}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
             <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                <Clock className="h-3 w-3" />
                <span>{milestone.estimatedHours}h</span>
             </div>
             
             {milestone.tasks && milestone.tasks.length > 0 && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">
                  {milestone.tasks.length} Tasks
                </div>
             )}
          </div>

          {milestone.tasks && milestone.tasks.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-border/50">
              {milestone.tasks.slice(0, 2).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-2 bg-muted/30 px-2 py-1.5 rounded-lg border border-border/20"
                >
                  <span className="text-[11px] font-medium text-foreground line-clamp-1">{task.title}</span>
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter bg-card border border-border text-muted-foreground">
                    {task.taskType}
                  </span>
                </div>
              ))}
              {milestone.tasks.length > 2 && (
                <p className="text-[10px] text-slate-400 text-center font-medium pt-1">
                  +{milestone.tasks.length - 2} more tasks
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
