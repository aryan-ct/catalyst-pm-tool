import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Bug, Sparkles, MessageSquare } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Milestone } from '../types/types';
import { Avatar } from '@/components/ui/avatar';
import { TASK_COMMENT_API, TaskComment } from '@/api/task-comment.api';
import TaskCommentsDrawer from '../comments/TaskCommentsDrawer';

interface Props {
  milestone: Milestone;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
  onCommentsCountChange?: (taskId: string, count: number) => void;
}

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500 text-white',
    'bg-emerald-500 text-white',
    'bg-amber-500 text-white',
    'bg-violet-500 text-white',
    'bg-pink-500 text-white',
    'bg-rose-500 text-white',
    'bg-cyan-500 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function MilestoneCard({ milestone, onEdit, onCommentsCountChange }: Props) {
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

  const isBug = milestone.taskType === 'bug';

  const [comments, setComments] = useState<TaskComment[] | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const ensureCommentsLoaded = async () => {
    if (comments !== null) return;
    setCommentsLoading(true);
    try {
      const data = await TASK_COMMENT_API.getComments(milestone.id);
      setComments(data);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (content: string) => {
    const created = await TASK_COMMENT_API.addComment(milestone.id, content);
    const next = [...(comments ?? []), created];
    setComments(next);
    onCommentsCountChange?.(milestone.id, next.length);
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    const updated = await TASK_COMMENT_API.updateComment(commentId, content);
    setComments(
      (prev) => prev?.map((c) => (c.id === commentId ? updated : c)) ?? prev,
    );
  };

  const handleDeleteComment = async (commentId: string) => {
    await TASK_COMMENT_API.deleteComment(commentId);
    const next = (comments ?? []).filter((c) => c.id !== commentId);
    setComments(next);
    onCommentsCountChange?.(milestone.id, next.length);
  };

  const commentCount = comments?.length ?? milestone.commentsCount ?? 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing group/card select-none py-1"
    >
      <Card
        onClick={() => onEdit(milestone)}
        className={`bg-card shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary/45 transition-all duration-300 cursor-pointer overflow-hidden border-l-4 ${
          isBug 
            ? 'border-l-red-500/80 border-t-border border-r-border border-b-border' 
            : 'border-l-blue-500/80 border-t-border border-r-border border-b-border'
        }`}
      >
        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-semibold text-sm text-foreground group-hover/card:text-primary transition-colors leading-relaxed tracking-tight line-clamp-2">
              {milestone.milestoneName}
            </h4>
          </div>

          {/* Assigned Resources & Hours Row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {/* Avatars Stack */}
            {milestone.assignedTo && milestone.assignedTo.length > 0 ? (
              <div className="flex items-center -space-x-2.5">
                {milestone.assignedTo.map((res) => (
                  <Avatar
                    key={res.id}
                    name={res.name}
                    className={`h-8 w-8 text-[10px] border-2 border-card shadow-sm transition-transform hover:scale-110 hover:z-10 ${getAvatarColor(res.name)}`}
                  />
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-muted-foreground/60 italic font-medium">Unassigned</div>
            )}

            {/* Estimated Hours Pill */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-muted/70 px-2.5 py-1 rounded-full border border-border/40 shadow-xs">
              <Clock className="h-3 w-3 text-muted-foreground/80 shrink-0" />
              <span>{milestone.estimatedHours} hrs</span>
            </div>
          </div>

          {/* Task Type Badges + Comments Footer Row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-border/40">
            {milestone.taskType && (
              <div className={`flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-2xs ${
                isBug
                  ? 'text-red-600 bg-red-50 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
                  : 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
              }`}>
                {isBug ? (
                  <Bug className="h-2.5 w-2.5 text-red-500 shrink-0" />
                ) : (
                  <Sparkles className="h-2.5 w-2.5 text-blue-500 shrink-0" />
                )}
                <span>{milestone.taskType}</span>
              </div>
            )}

            {isBug && milestone.bugNumber && (
              <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-md border border-border/50 shadow-2xs">
                <span>#{milestone.bugNumber}</span>
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDrawerOpen(true);
                ensureCommentsLoaded();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="ml-auto flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted/70 hover:bg-muted px-2.5 py-1 rounded-full border border-border/40 shadow-xs transition-colors"
            >
              <MessageSquare className="h-3 w-3 shrink-0" />
              {commentCount > 0 && <span>{commentCount}</span>}
            </button>
          </div>
        </CardContent>
      </Card>

      <TaskCommentsDrawer
        taskTitle={milestone.milestoneName}
        open={drawerOpen}
        onOpenChange={(next) => {
          setDrawerOpen(next);
          if (next) ensureCommentsLoaded();
        }}
        comments={comments}
        loading={commentsLoading}
        onAdd={handleAddComment}
        onUpdate={handleUpdateComment}
        onDelete={handleDeleteComment}
      />
    </div>
  );
}
