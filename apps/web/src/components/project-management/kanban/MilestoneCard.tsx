import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Clock,
  Pencil,
  Trash,
  Link as LinkIcon,
  CheckCircle2,
  Circle,
  Clock4,
  AlertCircle,
  Bug,
  Sparkles,
  Eye,
  ExternalLink,
  Hash,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Milestone, SubTask, Status } from '../types/types';
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/lib/enum';
import { Avatar } from '@/components/ui/avatar';

interface Props {
  milestone: Milestone;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<
  Status,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    label: string;
    border: string;
  }
> = {
  todo: {
    icon: Circle,
    color: 'text-slate-500',
    bg: 'bg-slate-100',
    label: 'To Do',
    border: 'border-slate-200',
  },
  'in-progress': {
    icon: Clock4,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    label: 'In Progress',
    border: 'border-blue-200',
  },
  'in-review': {
    icon: AlertCircle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    label: 'In Review',
    border: 'border-amber-200',
  },
  done: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    label: 'Done',
    border: 'border-emerald-200',
  },
};

const taskTypeConfig = {
  bug: {
    icon: Bug,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-100',
    label: 'Bug',
  },
  feature: {
    icon: Sparkles,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    label: 'Feature',
  },
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

  const [taskViewOpen, setTaskViewOpen] = useState(false);
  const [viewingSubtask, setViewingSubtask] = useState<SubTask | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const statusStyle = statusConfig[milestone.status];
  const StatusIcon = statusStyle.icon;
  const subtaskCount = milestone.tasks?.length ?? 0;

  const stopEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <>
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

              <div className="flex shrink-0 -mr-1">
                {/* Edit + Delete — hover only */}
                <div className="flex opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={(e) => {
                      stopEvent(e);
                      onEdit(milestone);
                    }}
                    title="Edit task"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  {user?.role === Roles.MANAGER && (
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        stopEvent(e);
                        onDelete(milestone.id);
                      }}
                      title="Delete task"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <h4 className="font-semibold text-sm text-foreground group-hover/card:text-primary transition-colors line-clamp-2 leading-snug">
              {milestone.milestoneName}
            </h4>

            {/* Parent Task reference if applicable */}
            {/* {milestone.parentTaskTitle && (
              <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                <span className="font-medium bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">Subtask of</span>
                <span className="text-xs line-clamp-1">{milestone.parentTaskTitle}</span>
              </div>
            )} */}

            {/* Description */}
            {milestone.milestoneDescription && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {milestone.milestoneDescription}
              </p>
            )}

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
                  onClick={stopEvent}
                >
                  <LinkIcon className="h-2.5 w-2.5" />
                  <span>Bug sheet</span>
                </a>
              )}
            </div>

            {/* View button */}
            <div className="pt-1 border-t border-border/40">
              <Button
                size="sm"
                className="w-full gap-1.5 shadow-sm"
                onClick={(e) => {
                  stopEvent(e);
                  setTaskViewOpen(true);
                }}
              >
                <Eye className="h-3.5 w-3.5" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Task view dialog ──────────────────────────────────────── */}
      <Dialog open={taskViewOpen} onOpenChange={setTaskViewOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusStyle.bg} ${statusStyle.color} border ${statusStyle.border}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {statusStyle.label}
              </div>
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl leading-snug text-left">
                {milestone.milestoneName}
              </DialogTitle>
            </DialogHeader>

            {milestone.parentTaskTitle && (
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <span className="font-medium bg-muted/60 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border border-border/50">
                  Subtask of
                </span>
                <span className="text-sm font-medium text-foreground">
                  {milestone.parentTaskTitle}
                </span>
              </div>
            )}

            {/* Stat chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="font-semibold text-foreground">
                  {milestone.estimatedHours}
                </span>
                <span className="text-muted-foreground">hrs</span>
              </div>
              {subtaskCount > 0 && (
                <div className="flex items-center gap-1.5 bg-primary/10 rounded-lg px-3 py-1.5 text-sm text-primary font-semibold">
                  <Hash className="h-3.5 w-3.5 shrink-0" />
                  {subtaskCount} {subtaskCount === 1 ? 'subtask' : 'subtasks'}
                </div>
              )}
              {milestone.bugSheet && (
                <a
                  href={milestone.bugSheet}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5 text-sm text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                  Bug Sheet
                  <ExternalLink className="h-3 w-3 opacity-60 shrink-0" />
                </a>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Description */}
            {milestone.milestoneDescription ? (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                  Description
                </p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {milestone.milestoneDescription}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No description provided.
              </p>
            )}

            {/* Assigned Resources in Dialog */}
            {milestone.assignedTo && milestone.assignedTo.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                  Assigned To
                </p>
                <div className="flex flex-wrap gap-2">
                  {milestone.assignedTo.map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center gap-1.5 px-2 py-1 bg-secondary rounded-full text-xs font-semibold border border-border"
                    >
                      <Avatar name={res.name} className="h-5 w-5 text-[9px] bg-background" />
                      {res.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subtasks */}
            {subtaskCount > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                  Subtasks ({subtaskCount})
                </p>
                <div className="space-y-1.5">
                  {milestone.tasks.map((task) => {
                    const tc = taskTypeConfig[task.taskType];
                    const TypeIcon = tc.icon;
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/40 border border-border/40"
                      >
                        <div
                          className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${tc.bg} border ${tc.border}`}
                        >
                          <TypeIcon className={`h-3.5 w-3.5 ${tc.color}`} />
                        </div>
                        <span className="text-sm text-foreground flex-1 leading-snug">
                          {task.title}
                        </span>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${tc.bg} ${tc.color} border ${tc.border}`}
                        >
                          {tc.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Subtask view dialog ───────────────────────────────────── */}
      <Dialog
        open={!!viewingSubtask}
        onOpenChange={(open) => !open && setViewingSubtask(null)}
      >
        <DialogContent className="max-w-sm p-0">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-border">
            {viewingSubtask &&
              (() => {
                const tc = taskTypeConfig[viewingSubtask.taskType];
                const TypeIcon = tc.icon;
                return (
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${tc.bg} border ${tc.border}`}
                    >
                      <TypeIcon className={`h-5 w-5 ${tc.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${tc.color}`}
                      >
                        {tc.label}
                      </p>
                      <DialogHeader>
                        <DialogTitle className="text-base leading-snug text-left line-clamp-2">
                          {viewingSubtask.title}
                        </DialogTitle>
                      </DialogHeader>
                    </div>
                  </div>
                );
              })()}
          </div>

          {/* Context */}
          <div className="px-6 py-4 space-y-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                Part of task
              </p>
              <p className="text-sm font-medium text-foreground">
                {milestone.milestoneName}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                Task status
              </p>
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusStyle.bg} ${statusStyle.color}`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusStyle.label}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
