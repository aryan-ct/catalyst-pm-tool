import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PencilRuler, X } from "lucide-react";
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
        // Update existing task
        await TASK_API.updateTask(initialData.id, {
          title: milestone.milestoneName,
          description: milestone.milestoneDescription,
          estimatedHours: milestone.estimatedHours,
          milestoneId: initialData.milestoneId ?? targetMilestoneId,
        });

        // Delete removed subtasks
        for (const id of deletedSubtaskIds) {
          await SUBTASK_API.deleteSubtask(id);
        }

        // Create new subtasks
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
        // Create new task
        const created = await TASK_API.createTask(targetMilestoneId, {
          title: milestone.milestoneName,
          description: milestone.milestoneDescription,
          estimatedHours: milestone.estimatedHours,
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
          bugSheet: "",
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="size-10 bg-gray-200 rounded-full flex items-center justify-center">
            <PencilRuler />
          </div>
          <DialogTitle>
            {initialData ? "Edit Task" : "New Task"}
          </DialogTitle>
          <DialogDescription>
            Create a task and add subtasks
          </DialogDescription>
        </DialogHeader>

        {/* Milestone picker (only when creating) */}
        {!initialData && projectMilestones.length > 0 && (
          <div>
            <label className="text-sm font-medium">Milestone</label>
            <select
              className="border p-2 rounded w-full mt-1"
              value={pickedMilestoneId}
              onChange={(e) => setPickedMilestoneId(e.target.value)}
            >
              {projectMilestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.milestoneName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium">Task Name</label>
              <input
                className="border p-2 rounded w-full"
                value={milestone.milestoneName}
                onChange={(e) =>
                  setMilestone({ ...milestone, milestoneName: e.target.value })
                }
              />
              {errors.milestoneName && (
                <p className="text-red-500 text-xs">{errors.milestoneName}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="border p-2 rounded w-full"
                value={milestone.milestoneDescription}
                onChange={(e) =>
                  setMilestone({ ...milestone, milestoneDescription: e.target.value })
                }
              />
              {errors.milestoneDescription && (
                <p className="text-red-500 text-xs">{errors.milestoneDescription}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Estimated Hours</label>
              <input
                type="number"
                className="border p-2 rounded w-full"
                value={milestone.estimatedHours}
                onChange={(e) =>
                  setMilestone({ ...milestone, estimatedHours: Number(e.target.value) })
                }
              />
              {errors.estimatedHours && (
                <p className="text-red-500 text-xs">{errors.estimatedHours}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Bug Sheet Link</label>
            <input
              className="border p-2 rounded w-full"
              value={milestone.bugSheet ?? ""}
              onChange={(e) =>
                setMilestone({ ...milestone, bugSheet: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Subtasks</span>
            <Button size="sm" onClick={addTask}>
              + Add Subtask
            </Button>
          </div>

          {errors.tasks && (
            <p className="text-red-500 text-xs mb-2">{errors.tasks}</p>
          )}

          <div className="flex flex-col gap-3">
            {milestone.tasks.map((task, index) => (
              <div key={task.id} className="flex gap-2">
                <input
                  className="border p-2 rounded w-full"
                  placeholder="Subtask title"
                  value={task.title}
                  onChange={(e) => updateTask(index, "title", e.target.value)}
                />
                <select
                  className="border p-2 rounded"
                  value={task.taskType}
                  onChange={(e) => updateTask(index, "taskType", e.target.value)}
                >
                  <option value="feature">Feature</option>
                  <option value="bug">Bug</option>
                </select>
                <Button variant="outline" onClick={() => removeTask(index)}>
                  <X />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Close
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Save Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
