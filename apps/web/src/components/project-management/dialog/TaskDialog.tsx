import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Roles } from "@/lib/enum";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { PencilRuler, Plus, X, Bug, Sparkles, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import { Milestone, PMBackendMilestone, SubTask, TaskType } from "../types/types";
import { MilestoneErrors, validateMilestone } from "./validate";
import { TASK_API } from "@/api/task.api";
import { SUBTASK_API } from "@/api/subtask.api";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialData?: Milestone | null;
  onSave: (milestone: Milestone) => void;
  projectMilestones: PMBackendMilestone[];
  defaultMilestoneId: string;
};

const emptyMilestone = (): Milestone => ({
  id: "",
  milestoneName: "",
  milestoneDescription: "",
  estimatedHours: 0,
  bugSheet: "",
  status: "todo",
  milestoneId: "",
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
  const [pickedMilestoneId, setPickedMilestoneId] = useState<string>("");
  const [deletedSubtaskIds, setDeletedSubtaskIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<MilestoneErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setMilestone(initialData);
      setPickedMilestoneId(initialData.milestoneId ?? defaultMilestoneId);
    } else {
      setMilestone(emptyMilestone());
      setPickedMilestoneId(defaultMilestoneId);
    }
    setDeletedSubtaskIds([]);
    setErrors({});
  }, [initialData, open, defaultMilestoneId]);

  const addTask = () => {
    const newTask: SubTask = {
      id: `_new_${crypto.randomUUID()}`,
      title: "",
      taskType: "feature",
      _isNew: true,
    };
    setMilestone((prev) => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  };

  const updateTask = (index: number, key: keyof SubTask, value: string) => {
    const updated = [...milestone.tasks];
    updated[index] = { ...updated[index], [key]: value };
    setMilestone({ ...milestone, tasks: updated });
  };

  const removeTask = (index: number) => {
    const task = milestone.tasks[index];
    if (!task._isNew) {
      setDeletedSubtaskIds((prev) => [...prev, task.id]);
    }
    setMilestone({ ...milestone, tasks: milestone.tasks.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    const validationErrors = validateMilestone(milestone);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const targetMilestoneId = pickedMilestoneId || defaultMilestoneId;
    if (!targetMilestoneId) {
      setErrors({ milestoneName: "Please select a milestone first." });
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
        });

        for (const id of deletedSubtaskIds) {
          await SUBTASK_API.deleteSubtask(id);
        }

        const newSubtasks: SubTask[] = [];
        for (const st of milestone.tasks.filter((t) => t._isNew)) {
          const created = await SUBTASK_API.createSubtask(initialData.id, {
            title: st.title,
            taskType: st.taskType,
          });
          newSubtasks.push({
            id: created.id,
            title: created.title,
            taskType: (created.taskType as string).toLowerCase() as TaskType,
          });
        }

        const persistedSubtasks = milestone.tasks
          .filter((t) => !t._isNew)
          .map(({ _isNew: _, ...rest }) => rest);

        const updatedTask: Milestone = {
          ...milestone,
          tasks: [...persistedSubtasks, ...newSubtasks],
        };
        onSave(updatedTask);
      } else {
        const created = await TASK_API.createTask(targetMilestoneId, {
          title: milestone.milestoneName,
          description: milestone.milestoneDescription,
          estimatedHours: milestone.estimatedHours,
          bugSheet: milestone.bugSheet,
        });

        const createdSubtasks: SubTask[] = [];
        for (const st of milestone.tasks) {
          const createdSt = await SUBTASK_API.createSubtask(created.id, {
            title: st.title,
            taskType: st.taskType,
          });
          createdSubtasks.push({
            id: createdSt.id,
            title: createdSt.title,
            taskType: (createdSt.taskType as string).toLowerCase() as TaskType,
          });
        }

        const newKanbanItem: Milestone = {
          id: created.id,
          milestoneName: created.title,
          milestoneDescription: created.description,
          estimatedHours: created.estimatedHours,
          bugSheet: created.bugSheet ?? milestone.bugSheet ?? "",
          status: "todo",
          milestoneId: targetMilestoneId,
          tasks: createdSubtasks,
        };
        onSave(newKanbanItem);
      }

      setOpen(false);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const selectedMilestoneName = projectMilestones.find(
    (m) => m.id === pickedMilestoneId
  )?.milestoneName;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border bg-muted/30">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <PencilRuler className="size-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base">
                  {initialData ? "Edit Task" : "Create New Task"}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {initialData
                    ? "Update task details and subtasks"
                    : "Fill in the details below to create a new task"}
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
                      <span className="text-muted-foreground">Choose a milestone…</span>
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
                setMilestone({ ...milestone, milestoneDescription: e.target.value })
              }
              aria-invalid={!!errors.milestoneDescription}
            />
            {errors.milestoneDescription && (
              <p className="text-destructive text-xs">{errors.milestoneDescription}</p>
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
                value={milestone.estimatedHours || ""}
                disabled={!isManager}
                onChange={(e) =>
                  setMilestone({ ...milestone, estimatedHours: Number(e.target.value) })
                }
                aria-invalid={!!errors.estimatedHours}
              />
              {errors.estimatedHours && (
                <p className="text-destructive text-xs">{errors.estimatedHours}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bug-sheet">Bug Sheet Link</Label>
              <Input
                id="bug-sheet"
                className="h-9"
                placeholder="https://…"
                value={milestone.bugSheet ?? ""}
                disabled={!isManager}
                onChange={(e) =>
                  setMilestone({ ...milestone, bugSheet: e.target.value })
                }
              />
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="mb-0">Subtasks</Label>
                {milestone.tasks.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {milestone.tasks.length}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1 px-2.5"
                onClick={addTask}
              >
                <Plus className="size-3" />
                Add Subtask
              </Button>
            </div>

            {errors.tasks && (
              <p className="text-destructive text-xs">{errors.tasks}</p>
            )}

            {milestone.tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 rounded-lg border border-dashed border-border text-muted-foreground gap-2">
                <ListTodo className="size-5 opacity-40" />
                <p className="text-xs">No subtasks yet. Add one to break down the work.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {milestone.tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/50"
                  >
                    {/* Type toggle */}
                    <div className="flex rounded-md border border-border overflow-hidden shrink-0">
                      <button
                        type="button"
                        onClick={() => updateTask(index, "taskType", "feature")}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
                          task.taskType === "feature"
                            ? "bg-blue-500 text-white"
                            : "bg-transparent text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <Sparkles className="size-2.5" />
                        Feat
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTask(index, "taskType", "bug")}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors border-l border-border",
                          task.taskType === "bug"
                            ? "bg-red-500 text-white"
                            : "bg-transparent text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <Bug className="size-2.5" />
                        Bug
                      </button>
                    </div>

                    <Input
                      className="h-7 text-xs flex-1 bg-background"
                      placeholder="Subtask title…"
                      value={task.title}
                      onChange={(e) => updateTask(index, "title", e.target.value)}
                    />

                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="shrink-0 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
          <Button size="sm" onClick={handleSubmit} disabled={saving} className="min-w-[90px]">
            {saving ? (
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Saving…
              </span>
            ) : (
              initialData ? "Save Changes" : "Create Task"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
