import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/lib/enum';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { PencilRuler } from 'lucide-react';
import { Milestone, PMBackendMilestone, TaskType } from '../types/types';
import { MilestoneErrors, validateMilestone } from './validate';
import { TASK_API } from '@/api/task.api';
import { RESOURCE_API } from '@/api/resource.api';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialData?: Milestone | null;
  onSave: (milestone: Milestone) => void;
  projectMilestones: PMBackendMilestone[];
  defaultMilestoneId: string;
};

const emptyMilestone = (): Milestone => ({
  id: '',
  milestoneName: '',
  milestoneDescription: '',
  estimatedHours: 0,
  bugSheet: '',
  status: 'todo',
  milestoneId: '',
  parentTaskId: undefined,
  taskType: 'feature',
  assignedTo: [],
  tasks: [],
});

export default function TaskDialog({
  open,
  setOpen,
  initialData,
  onSave,
  projectMilestones,
  defaultMilestoneId,
}: Props) {
  const { user } = useAuth();
  const isManager = user?.role === Roles.MANAGER;
  const [milestone, setMilestone] = useState<Milestone>(emptyMilestone());
  const [pickedMilestoneId, setPickedMilestoneId] = useState<string>('');
  const [errors, setErrors] = useState<MilestoneErrors>({});
  const [saving, setSaving] = useState(false);
  const [availableResources, setAvailableResources] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (open) {
      RESOURCE_API.findAllResources()
        .then((res) => setAvailableResources(res))
        .catch((err) => console.error('Failed to load resources', err));
    }
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setMilestone(initialData);
      setPickedMilestoneId(initialData.milestoneId ?? defaultMilestoneId);
    } else {
      setMilestone(emptyMilestone());
      setPickedMilestoneId(defaultMilestoneId);
    }
    setErrors({});
  }, [initialData, open, defaultMilestoneId]);

  const handleSubmit = async () => {
    const validationErrors = validateMilestone(milestone);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const targetMilestoneId = pickedMilestoneId || defaultMilestoneId;
    if (!targetMilestoneId) {
      setErrors({ milestoneName: 'Please select a milestone first.' });
      return;
    }

    setSaving(true);
    try {
      if (initialData) {
        await TASK_API.updateTask(initialData.id, {
          title: milestone.milestoneName,
          description: milestone.milestoneDescription,
          estimatedHours: milestone.estimatedHours,
          bugSheet: milestone.bugSheet,
          milestoneId: initialData.milestoneId ?? targetMilestoneId,
          parentTaskId: milestone.parentTaskId,
          taskType: milestone.taskType?.toUpperCase(),
          assignedTo: milestone.assignedTo?.map((r) => r.id),
        });

        const updatedTask: Milestone = {
          ...milestone,
        };
        onSave(updatedTask);
      } else {
        const created = await TASK_API.createTask(targetMilestoneId, {
          title: milestone.milestoneName,
          description: milestone.milestoneDescription,
          estimatedHours: milestone.estimatedHours,
          bugSheet: milestone.bugSheet,
          parentTaskId: milestone.parentTaskId,
          taskType: milestone.taskType?.toUpperCase(),
          assignedTo: milestone.assignedTo?.map((r) => r.id),
        });

        const newKanbanItem: Milestone = {
          id: created.id,
          milestoneName: created.title,
          milestoneDescription: created.description,
          estimatedHours: created.estimatedHours,
          bugSheet: created.bugSheet ?? milestone.bugSheet ?? '',
          status: 'todo',
          milestoneId: targetMilestoneId,
          parentTaskId: milestone.parentTaskId,
          taskType: milestone.taskType,
          tasks: [],
        };
        onSave(newKanbanItem);
      }

      setOpen(false);
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  const selectedMilestoneName = projectMilestones.find(
    (m) => m.id === pickedMilestoneId,
  )?.milestoneName;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!min-w-[600px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border bg-muted/30">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <PencilRuler className="size-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base">
                  {initialData ? 'Edit Task' : 'Create New Task'}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {initialData
                    ? 'Update task details and subtasks'
                    : 'Fill in the details below to create a new task'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[65vh]">
          {/* Milestone picker */}
          {!initialData && projectMilestones.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="milestone-select">Milestone</Label>
              <Select
                value={pickedMilestoneId}
                onValueChange={(val) => val && setPickedMilestoneId(val)}
              >
                <SelectTrigger id="milestone-select" className="w-full h-9">
                  <span className="flex flex-1 text-left text-sm truncate">
                    {selectedMilestoneName ?? (
                      <span className="text-muted-foreground">
                        Choose a milestone…
                      </span>
                    )}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {projectMilestones.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.milestoneName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Task name */}
          <div className="space-y-1.5">
            <Label htmlFor="task-name">Task Name</Label>
            <Input
              id="task-name"
              className="h-9"
              placeholder="Enter a clear, descriptive task name"
              value={milestone.milestoneName}
              disabled={!isManager}
              onChange={(e) =>
                setMilestone({ ...milestone, milestoneName: e.target.value })
              }
              aria-invalid={!!errors.milestoneName}
            />
            {errors.milestoneName && (
              <p className="text-destructive text-xs">{errors.milestoneName}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              placeholder="Describe what needs to be done…"
              className="min-h-[80px] resize-none"
              value={milestone.milestoneDescription}
              disabled={!isManager}
              onChange={(e) =>
                setMilestone({
                  ...milestone,
                  milestoneDescription: e.target.value,
                })
              }
              aria-invalid={!!errors.milestoneDescription}
            />
            {errors.milestoneDescription && (
              <p className="text-destructive text-xs">
                {errors.milestoneDescription}
              </p>
            )}
          </div>

          {/* Estimated hours + Bug sheet side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="est-hours">Estimated Hours</Label>
              <Input
                id="est-hours"
                type="number"
                className="h-9"
                min={0}
                placeholder="0"
                value={milestone.estimatedHours || ''}
                disabled={!isManager}
                onChange={(e) =>
                  setMilestone({
                    ...milestone,
                    estimatedHours: Number(e.target.value),
                  })
                }
                aria-invalid={!!errors.estimatedHours}
              />
              {errors.estimatedHours && (
                <p className="text-destructive text-xs">
                  {errors.estimatedHours}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bug-sheet">Bug Sheet Link</Label>
              <Input
                id="bug-sheet"
                className="h-9"
                placeholder="https://…"
                value={milestone.bugSheet ?? ''}
                disabled={!isManager}
                onChange={(e) =>
                  setMilestone({ ...milestone, bugSheet: e.target.value })
                }
              />
            </div>
          </div>

          {/* Assigned Resources */}
          <div className="space-y-1.5">
            <Label>Assign Resources</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start h-9 px-3 font-normal text-sm"
                  disabled={!isManager}
                >
                  {milestone.assignedTo && milestone.assignedTo.length > 0
                    ? `${milestone.assignedTo.length} resource(s) selected`
                    : 'Select resources...'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px] max-h-[300px] overflow-y-auto">
                {availableResources.length > 0 ? (
                  availableResources.map((resource) => {
                    const isChecked = !!milestone.assignedTo?.find(
                      (r) => r.id === resource.id,
                    );
                    return (
                      <DropdownMenuCheckboxItem
                        key={resource.id}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const current = milestone.assignedTo || [];
                          if (checked) {
                            setMilestone({
                              ...milestone,
                              assignedTo: [...current, resource],
                            });
                          } else {
                            setMilestone({
                              ...milestone,
                              assignedTo: current.filter((r) => r.id !== resource.id),
                            });
                          }
                        }}
                      >
                        {resource.name}
                      </DropdownMenuCheckboxItem>
                    );
                  })
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    No resources found.
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Display assigned pills */}
            {milestone.assignedTo && milestone.assignedTo.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {milestone.assignedTo.map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-full text-xs font-medium"
                  >
                    {res.name}
                    {isManager && (
                      <button
                        onClick={() =>
                          setMilestone({
                            ...milestone,
                            assignedTo: milestone.assignedTo?.filter(
                              (r) => r.id !== res.id,
                            ),
                          })
                        }
                        className="text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full p-0.5 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Parent Task & Task Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="parent-task-select">Parent Task</Label>
              <Select
                value={milestone.parentTaskId ?? 'none'}
                onValueChange={(val) =>
                  setMilestone({
                    ...milestone,
                    parentTaskId: val === 'none' ? undefined : val,
                  })
                }
              >
                <SelectTrigger id="parent-task-select" className="w-full h-9">
                  <span className="flex flex-1 text-left text-sm truncate">
                    {milestone.parentTaskId && pickedMilestoneId
                      ? projectMilestones
                          .find((m) => m.id === pickedMilestoneId)
                          ?.tasks?.find((t) => t.id === milestone.parentTaskId)
                          ?.milestoneName || 'None'
                      : 'None'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {pickedMilestoneId &&
                    projectMilestones
                      .find((m) => m.id === pickedMilestoneId)
                      ?.tasks?.filter(
                        (t) => t.id !== milestone.id && !t.parentTaskId,
                      )
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.milestoneName}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-type-select">Task Type</Label>
              <Select
                value={milestone.taskType ?? 'feature'}
                onValueChange={(val) =>
                  setMilestone({ ...milestone, taskType: val as TaskType })
                }
              >
                <SelectTrigger id="task-type-select" className="w-full h-9">
                  <span className="flex flex-1 text-left text-sm truncate capitalize">
                    {milestone.taskType ?? 'feature'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-2 bg-muted/20">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={saving}
            className="min-w-[90px]"
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Saving…
              </span>
            ) : initialData ? (
              'Save Changes'
            ) : (
              'Create Task'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
