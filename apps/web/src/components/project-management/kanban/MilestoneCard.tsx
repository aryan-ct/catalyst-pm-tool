import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Pencil, Trash } from 'lucide-react';
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
      className="cursor-grab active:cursor-grabbing"
    >
      <Card className="bg-white shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-base">{milestone.milestoneName}</CardTitle>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEdit(milestone);
              }}
            >
              <Pencil size={16} />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete(milestone.id);
              }}
            >
              <Trash size={16} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            {milestone.milestoneDescription}
          </p>
          <p className="flex gap-2"><Clock className='h-4 w-4'/> {milestone.estimatedHours} hrs</p>

          {milestone.tasks.map((task) => (
            <div
              key={task.id}
              className="flex justify-between border rounded px-2 py-1"
            >
              <span>{task.title}</span>
              <span className="text-xs bg-gray-200 px-2 rounded">
                {task.taskType}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
