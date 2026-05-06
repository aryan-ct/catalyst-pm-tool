import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Pencil, Trash, Link as LinkIcon, CheckCircle2, Circle, Clock4, AlertCircle, Bug, Sparkles } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Milestone, Status } from '../types/types';
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/lib/enum';

interface Props {
  milestone: Milestone;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<Status, { icon: React.ElementType; color: string; bg: string; label: string; dot: string }> = {
  'todo': { icon: Circle, color: 'text-slate-500', bg: 'bg-slate-100', label: 'To Do', dot: 'bg-slate-400' },
  'in-progress': { icon: Clock4, color: 'text-blue-600', bg: 'bg-blue-50', label: 'In Progress', dot: 'bg-blue-500' },
  'in-review': { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'In Review', dot: 'bg-amber-500' },
  'done': { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Done', dot: 'bg-emerald-500' },
};

export default function MilestoneCard({ milestone, onEdit, onDelete }: Props) {
  const { user } = useAuth();
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

  const statusStyle = statusConfig[milestone.status];
  const StatusIcon = statusStyle.icon;
  const subtaskCount = milestone.tasks?.length ?? 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing group/card"
    >
      <Card className="bg-card border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
        <CardContent className="p-3.5 space-y-2.5">

          {/* Top row: status badge + actions */}
          <div className="flex items-start justify-between gap-2">
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyle.bg} ${statusStyle.color}`}
            >
              <StatusIcon className="w-3 h-3" />
              {statusStyle.label}
            </div>

            <div className="flex shrink-0 -mr-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
              <Button
                size="icon-xs"
                variant="ghost"
                className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEdit(milestone); }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              {user?.role === Roles.MANAGER && (
                <Button
                  size="icon-xs"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(milestone.id); }}
                >
                  <Trash className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-sm text-foreground group-hover/card:text-primary transition-colors line-clamp-2 leading-snug">
            {milestone.milestoneName}
          </h4>

          {/* Description */}
          {milestone.milestoneDescription && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {milestone.milestoneDescription}
            </p>
          )}

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
              <Clock className="h-2.5 w-2.5" />
              <span>{milestone.estimatedHours}h</span>
            </div>

            {subtaskCount > 0 && (
              <div className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                {subtaskCount} {subtaskCount === 1 ? 'subtask' : 'subtasks'}
              </div>
            )}

            {milestone.bugSheet && (
              <a
                href={milestone.bugSheet}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors px-2 py-0.5 rounded-md"
                onClick={(e) => e.stopPropagation()}
              >
                <LinkIcon className="h-2.5 w-2.5" />
                <span>Bug sheet</span>
              </a>
            )}
          </div>

          {/* Subtask list */}
          {subtaskCount > 0 && (
            <div className="space-y-1 pt-1 border-t border-border/40">
              {milestone.tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 border border-border/20"
                >
                  {task.taskType === 'bug' ? (
                    <Bug className="size-2.5 text-red-500 shrink-0" />
                  ) : (
                    <Sparkles className="size-2.5 text-blue-500 shrink-0" />
                  )}
                  <span className="text-[11px] font-medium text-foreground line-clamp-1 flex-1">
                    {task.title}
                  </span>
                  <span
                    className={`shrink-0 px-1 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${task.taskType === 'bug'
                      ? 'bg-red-50 text-red-500 border border-red-100'
                      : 'bg-blue-50 text-blue-500 border border-blue-100'
                      }`}
                  >
                    {task.taskType}
                  </span>
                </div>
              ))}
              {subtaskCount > 3 && (
                <p className="text-[10px] text-muted-foreground/60 text-center font-medium py-0.5">
                  +{subtaskCount - 3} more
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
