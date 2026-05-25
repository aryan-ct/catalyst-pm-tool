import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/lib/enum';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { PencilRuler, Info, Trash2, Layers, CheckCircle } from 'lucide-react';
import { Milestone, PMBackendMilestone, TaskType } from '../types/types';
import { MilestoneErrors, validateMilestone } from './validate';
import { TASK_API } from '@/api/task.api';
import { RESOURCE_API } from '@/api/resource.api';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import ReactQuill (React 19 compatible RTE)
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialData?: Milestone | null;
  onSave: (milestone: Milestone) => void;
  onDelete?: (id: string) => void; // Optional delete callback
  projectMilestones: PMBackendMilestone[];
  defaultMilestoneId: string;
};

const emptyMilestone = (): Milestone => ({
  id: '',
  milestoneName: '',
  milestoneDescription: '',
  estimatedHours: 0,
  bugSheet: '',
  bugNumber: '',
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
  onDelete,
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
      setMilestone({
        ...initialData,
        bugNumber: initialData.bugNumber ?? '',
      });
      setPickedMilestoneId(initialData.milestoneId ?? defaultMilestoneId);
    } else {
      setMilestone(emptyMilestone());
      setPickedMilestoneId(defaultMilestoneId);
    }
    setErrors({});
  }, [initialData, open, defaultMilestoneId]);

  const handleSubmit = async () => {
    // Rich Text Editor clean check: strip HTML to see if there is actual content
    const rawText = milestone.milestoneDescription
      ? milestone.milestoneDescription.replace(/<[^>]*>/g, '').trim()
      : '';
    const cleanDesc = rawText === '' ? '' : milestone.milestoneDescription;

    const validationErrors = validateMilestone({
      ...milestone,
      milestoneDescription: cleanDesc,
    });
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
          bugNumber: milestone.taskType === 'bug' ? milestone.bugNumber : undefined,
          taskStatus: milestone.status.toUpperCase(),
          milestoneId: initialData.milestoneId ?? targetMilestoneId,
          parentTaskId: milestone.parentTaskId,
          taskType: milestone.taskType?.toUpperCase(),
          assignedTo: milestone.assignedTo?.map((r) => r.id),
        });

        const updatedTask: Milestone = {
          ...milestone,
          milestoneDescription: cleanDesc,
        };
        onSave(updatedTask);
      } else {
        const created = await TASK_API.createTask(targetMilestoneId, {
          title: milestone.milestoneName,
          description: milestone.milestoneDescription,
          estimatedHours: milestone.estimatedHours,
          bugSheet: milestone.bugSheet,
          bugNumber: milestone.taskType === 'bug' ? milestone.bugNumber : undefined,
          taskStatus: milestone.status.toUpperCase(),
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
          bugNumber: created.bugNumber ?? milestone.bugNumber ?? '',
          status: 'todo',
          milestoneId: targetMilestoneId,
          parentTaskId: milestone.parentTaskId,
          parentTaskTitle: milestone.parentTaskTitle,
          taskType: milestone.taskType,
          assignedTo: milestone.assignedTo,
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

  const handleDeleteTask = async () => {
    if (!initialData || !onDelete) return;
    if (window.confirm('Are you sure you want to delete this task?')) {
      setSaving(true);
      try {
        await onDelete(initialData.id);
        setOpen(false);
      } catch (err) {
        console.error('Delete failed', err);
      } finally {
        setSaving(false);
      }
    }
  };

  const selectedMilestoneName = projectMilestones.find(
    (m) => m.id === pickedMilestoneId,
  )?.milestoneName;

  const currentMilestoneId = pickedMilestoneId || defaultMilestoneId;
  const currentMilestoneObj = projectMilestones.find((m) => m.id === currentMilestoneId);
  const allMilestoneTasks = currentMilestoneObj?.tasks ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!fixed !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 !right-0 !bottom-0 h-screen w-screen !max-w-none rounded-none border-none bg-card p-0 gap-0 overflow-hidden flex flex-col animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-12 pt-8 pb-5 border-b border-border bg-muted/20">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold mb-1">
              <Layers className="size-3.5" />
              <span>Project Tasks</span>
              <span>/</span>
              <span className="text-foreground">{selectedMilestoneName || 'General'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <PencilRuler className="size-4 text-primary" />
                </div>
                <DialogTitle className="text-lg font-bold">
                  {initialData ? 'Task Details' : 'Create New Task'}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Drawer Body with Two-Column Layout */}
        <div className="flex-1 overflow-y-auto px-12 py-8 flex gap-10 min-h-0 bg-background/50">
          
          {/* Left Column (Main Fields) */}
          <div className="flex-[2] flex flex-col gap-6 min-w-0 pr-4">
            {/* Task Name */}
            <div className="space-y-1.5">
              <Label htmlFor="task-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Task Name
              </Label>
              <Input
                id="task-name"
                className="text-base font-semibold border border-border focus-visible:ring-1 focus-visible:ring-primary px-3 h-10 w-full bg-background"
                placeholder="Enter a clear, descriptive task name"
                value={milestone.milestoneName}
                disabled={!isManager}
                onChange={(e) =>
                  setMilestone({ ...milestone, milestoneName: e.target.value })
                }
                aria-invalid={!!errors.milestoneName}
              />
              {errors.milestoneName && (
                <p className="text-destructive text-xs font-medium">{errors.milestoneName}</p>
              )}
            </div>

            {/* Rich Text Editor for Description */}
            <div className="space-y-1.5 flex-1 flex flex-col min-h-[300px]">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Description
              </Label>
              <div className="flex-1 rounded-lg border border-border bg-background overflow-hidden flex flex-col">
                <ReactQuill
                  value={milestone.milestoneDescription}
                  onChange={(val) =>
                    setMilestone({ ...milestone, milestoneDescription: val })
                  }
                  readOnly={!isManager}
                  theme="snow"
                  placeholder="Describe what needs to be done..."
                  className="flex-1 flex flex-col [&>.ql-container]:flex-1 [&>.ql-container]:overflow-y-auto [&>.ql-container]:min-h-[180px] [&>.ql-editor]:text-sm [&>.ql-editor]:leading-relaxed"
                />
              </div>
              {errors.milestoneDescription && (
                <p className="text-destructive text-xs font-medium">{errors.milestoneDescription}</p>
              )}
            </div>

            {/* Parent & Children task relationships */}
            <div className="border-t border-border/60 pt-4 space-y-4">
              {/* Parent Task Selector */}
              <div className="space-y-1.5">
                <Label htmlFor="parent-task-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Parent Task
                </Label>
                <Select
                  disabled={!isManager}
                  value={milestone.parentTaskId ?? 'none'}
                  onValueChange={(val) => {
                    const parentId = val === 'none' ? undefined : val;
                    const parentTitle = parentId
                      ? allMilestoneTasks.find((t) => t.id === parentId)?.milestoneName
                      : undefined;
                    setMilestone({
                      ...milestone,
                      parentTaskId: parentId,
                      parentTaskTitle: parentTitle,
                    });
                  }}
                >
                  <SelectTrigger id="parent-task-select" className="w-full h-9 bg-background border-border">
                    <span className="truncate text-sm">
                      {milestone.parentTaskId
                        ? allMilestoneTasks.find((t) => t.id === milestone.parentTaskId)?.milestoneName || 'None'
                        : 'None'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {allMilestoneTasks
                      .filter(
                        (t) =>
                          t.id !== milestone.id &&
                          !t.parentTaskId &&
                          // Prevent circular reference (where this task is the parent of that task)
                          t.tasks?.every((sub) => sub.id !== milestone.id)
                      )
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.milestoneName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Children Tasks (Read-only list) */}
              {milestone.id && milestone.tasks && milestone.tasks.length > 0 && (
                <div className="space-y-2 pt-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="size-3.5 text-primary" />
                    Subtasks / Child Tasks ({milestone.tasks.length})
                  </Label>
                  <div className="space-y-1.5">
                    {milestone.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/40 border border-border/40 hover:bg-muted/60 transition-colors"
                      >
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${
                          task.taskType === 'bug'
                            ? 'text-red-600 bg-red-50 border-red-100'
                            : 'text-blue-600 bg-blue-50 border-blue-100'
                        }`}>
                          {task.taskType}
                        </span>
                        <span className="text-sm text-foreground flex-1 leading-snug truncate">
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Details Column */}
          <div className="w-[320px] shrink-0 flex flex-col gap-5 bg-muted/20 p-6 rounded-xl border border-border/60 h-fit">
            <div className="flex items-center gap-1.5 pb-2 border-b border-border/60">
              <Info className="size-4 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Details Panel</span>
            </div>

            {/* Status Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </Label>
              <Select
                value={milestone.status}
                onValueChange={(val) => setMilestone({ ...milestone, status: val as any })}
              >
                <SelectTrigger className="w-full h-9 bg-background border-border capitalize font-semibold">
                  <span className="truncate">{milestone.status.replace('-', ' ')}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Task Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Task Type
              </Label>
              <Select
                disabled={!isManager}
                value={milestone.taskType ?? 'feature'}
                onValueChange={(val) =>
                  setMilestone({ ...milestone, taskType: val as TaskType })
                }
              >
                <SelectTrigger className="w-full h-9 bg-background border-border capitalize">
                  <span className="truncate font-semibold">{milestone.taskType ?? 'feature'}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bug Number - conditional and optional */}
            {milestone.taskType === 'bug' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <Label htmlFor="bug-number" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Bug Number <span className="text-muted-foreground/60 text-[10px]">(Optional)</span>
                </Label>
                <Input
                  id="bug-number"
                  className="h-9 bg-background border-border"
                  placeholder="e.g. BUG-401"
                  value={milestone.bugNumber ?? ''}
                  disabled={!isManager}
                  onChange={(e) =>
                    setMilestone({ ...milestone, bugNumber: e.target.value })
                  }
                />
              </div>
            )}

            {/* Estimated Hours */}
            <div className="space-y-1.5">
              <Label htmlFor="est-hours" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Estimated Hours
              </Label>
              <Input
                id="est-hours"
                type="number"
                className="h-9 bg-background border-border"
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
                <p className="text-destructive text-xs font-medium">{errors.estimatedHours}</p>
              )}
            </div>

            {/* Assigned Resources */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Assign Resources
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-9 px-3 font-normal text-sm bg-background border-border"
                    disabled={!isManager}
                  >
                    <span className="truncate">
                      {milestone.assignedTo && milestone.assignedTo.length > 0
                        ? `${milestone.assignedTo.length} resource(s) selected`
                        : 'Select resources...'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[220px] max-h-[250px] overflow-y-auto">
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
                    <div className="p-2 text-xs text-muted-foreground">
                      No resources found.
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Display assigned pills */}
              {milestone.assignedTo && milestone.assignedTo.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {milestone.assignedTo.map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center gap-1 bg-secondary pl-1 pr-2 py-0.5 rounded-full text-[11px] font-medium border border-border"
                    >
                      <Avatar name={res.name} className="h-4.5 w-4.5 text-[8px] bg-background" />
                      <span className="truncate max-w-[80px]">{res.name}</span>
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
                          className="text-muted-foreground hover:text-foreground rounded-full p-0.5"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Milestone picker (Only visible on creation) */}
            {!initialData && projectMilestones.length > 0 && (
              <div className="space-y-1.5 border-t border-border/40 pt-3 mt-1">
                <Label htmlFor="milestone-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-bold">
                  Milestone Target
                </Label>
                <Select
                  value={pickedMilestoneId}
                  onValueChange={(val) => val && setPickedMilestoneId(val)}
                >
                  <SelectTrigger id="milestone-select" className="w-full h-9 bg-background border-border text-sm">
                    <span className="truncate">
                      {selectedMilestoneName ?? 'Choose milestone...'}
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
          </div>
        </div>

        {/* Footer */}
        <div className="px-12 py-5 border-t border-border flex items-center justify-between bg-muted/20">
          {/* Delete Button on the bottom-left */}
          <div>
            {isManager && initialData && onDelete && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 shadow-sm font-semibold h-9 px-4 hover:bg-destructive/90"
                disabled={saving}
                onClick={handleDeleteTask}
              >
                <Trash2 className="size-4" />
                Delete Task
              </Button>
            )}
          </div>

          {/* Action buttons on the bottom-right */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={saving}
              className="min-w-[110px] h-9 px-4 font-semibold shadow-sm"
            >
              {saving ? (
                <span className="flex items-center gap-1.5">
                  <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Saving…
                </span>
              ) : initialData ? (
                'Save Changes'
              ) : (
                'Create Task'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
