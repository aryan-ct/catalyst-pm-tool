import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare, Pencil, Trash2, X, Check } from 'lucide-react';
import { TaskComment } from '@/api/task-comment.api';

type Props = {
  taskTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comments: TaskComment[] | null;
  loading: boolean;
  onAdd: (content: string) => Promise<void>;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
};

const formatTimestamp = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function TaskCommentsDrawer({
  taskTitle,
  open,
  onOpenChange,
  comments,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}: Props) {
  const { user } = useAuth();
  const listRef = useRef<HTMLDivElement>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, comments]);

  const startEdit = (commentId: string, content: string) => {
    setEditingId(commentId);
    setEditingText(content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const submitNew = async () => {
    const content = newComment.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      await onAdd(content);
      setNewComment('');
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async (commentId: string) => {
    const content = editingText.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      await onUpdate(commentId, content);
      cancelEdit();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (window.confirm('Delete this comment?')) {
      await onDelete(commentId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!fixed !right-0 !top-0 !left-auto !translate-x-0 !translate-y-0 h-screen w-[420px] max-w-none rounded-none border-l border-border bg-card p-0 gap-0 flex flex-col"
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="size-4 text-primary shrink-0" />
            <DialogTitle className="text-sm font-bold truncate">
              Comments — {taskTitle}
            </DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
          {loading && (
            <p className="text-xs text-muted-foreground text-center py-6">
              Loading comments…
            </p>
          )}
          {!loading && comments && comments.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              No comments yet. Be the first to comment.
            </p>
          )}
          {!loading &&
            comments?.map((comment) => {
              const isOwn = !!user?.id && comment.authorId === user.id;
              const isEditing = editingId === comment.id;
              return (
                <div key={comment.id} className="flex items-start gap-2.5 group">
                  <Avatar name={comment.author?.name ?? '?'} className="h-7 w-7 text-[10px] mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {comment.author?.name ?? 'Unknown'}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatTimestamp(comment.createdAt)}
                      </span>
                      {comment.updatedAt !== comment.createdAt && (
                        <span className="text-[10px] text-muted-foreground/70 italic shrink-0">edited</span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-1.5 space-y-1.5">
                        <Textarea
                          autoFocus
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="text-sm min-h-16"
                        />
                        <div className="flex gap-1.5">
                          <Button size="icon-xs" onClick={() => submitEdit(comment.id)} disabled={submitting}>
                            <Check className="size-3" />
                          </Button>
                          <Button size="icon-xs" variant="outline" onClick={cancelEdit} disabled={submitting}>
                            <X className="size-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words mt-0.5">
                        {comment.content}
                      </p>
                    )}
                  </div>

                  {isOwn && !isEditing && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => startEdit(comment.id, comment.content)}
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        className="hover:text-destructive"
                        onClick={() => handleDelete(comment.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        <div className="px-5 py-4 border-t border-border bg-muted/20 flex gap-2 items-end">
          <Textarea
            placeholder="Write a comment…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="text-sm min-h-10 max-h-32"
          />
          <Button size="sm" onClick={submitNew} disabled={submitting || !newComment.trim()}>
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
