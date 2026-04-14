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
import { Milestone, SubTask } from "../types/types";
import { MilestoneErrors, validateMilestone } from "./validate";


type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialData?: Milestone | null;
  onSave: (milestone: Milestone) => void;
};

export default function TaskDialog({
  open,
  setOpen,
  initialData,
  onSave,
}: Props) {
  const [milestone, setMilestone] = useState<Milestone>({
    id: "",
    milestoneName: "",
    milestoneDescription: "",
    estimatedHours: 0,
    bugSheet: "",
    status: "todo",
    tasks: [],
  });

  const [errors, setErrors] = useState<MilestoneErrors>({});

  useEffect(() => {
    if (initialData) {
      setMilestone(initialData);
    } else {
      setMilestone({
        id: crypto.randomUUID(),
        milestoneName: "",
        milestoneDescription: "",
        estimatedHours: 0,
        bugSheet: "",
        status: "todo",
        tasks: [],
      });
    }
    setErrors({});
  }, [initialData, open]);


  const addTask = () => {
    const newTask: SubTask = {
      id: crypto.randomUUID(),
      title: "",
      taskType: "feature",
    };

    setMilestone((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  };

  const updateTask = (
    index: number,
    key: keyof SubTask,
    value: string
  ) => {
    const updatedTasks = [...milestone.tasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      [key]: value,
    };

    setMilestone({
      ...milestone,
      tasks: updatedTasks,
    });
  };


  const removeTask = (index: number) => {
    setMilestone({
      ...milestone,
      tasks: milestone.tasks.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = () => {
    const validationErrors = validateMilestone(milestone);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    onSave(milestone);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="size-10 bg-gray-200 rounded-full flex items-center justify-center">
            <PencilRuler />
          </div>
          <DialogTitle>
            {initialData ? "Edit Milestone" : "New Milestone"}
          </DialogTitle>
          <DialogDescription>
            Create a milestone and add tasks
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium">
                Milestone Name
              </label>
              <input
                className="border p-2 rounded w-full"
                value={milestone.milestoneName}
                onChange={(e) =>
                  setMilestone({
                    ...milestone,
                    milestoneName: e.target.value,
                  })
                }
              />
              {errors.milestoneName && (
                <p className="text-red-500 text-xs">
                  {errors.milestoneName}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">
                Description
              </label>
              <textarea
                className="border p-2 rounded w-full"
                value={milestone.milestoneDescription}
                onChange={(e) =>
                  setMilestone({
                    ...milestone,
                    milestoneDescription: e.target.value,
                  })
                }
              />
              {errors.milestoneDescription && (
                <p className="text-red-500 text-xs">
                  {errors.milestoneDescription}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">
                Estimated Hours
              </label>
              <input
                type="number"
                className="border p-2 rounded w-full"
                value={milestone.estimatedHours}
                onChange={(e) =>
                  setMilestone({
                    ...milestone,
                    estimatedHours: Number(e.target.value),
                  })
                }
              />
              {errors.estimatedHours && (
                <p className="text-red-500 text-xs">
                  {errors.estimatedHours}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Bug Sheet Link
            </label>
            <input
              className="border p-2 rounded w-full"
              value={milestone.bugSheet}
              onChange={(e) =>
                setMilestone({
                  ...milestone,
                  bugSheet: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Tasks</span>
            <Button size="sm" onClick={addTask}>
              + Add Task
            </Button>
          </div>

          {errors.tasks && (
            <p className="text-red-500 text-xs mb-2">
              {errors.tasks}
            </p>
          )}

          <div className="flex flex-col gap-3">
            {milestone.tasks.map((task, index) => (
              <div key={task.id} className="flex gap-2">
                <input
                  className="border p-2 rounded w-full"
                  placeholder="Task title"
                  value={task.title}
                  onChange={(e) =>
                    updateTask(index, "title", e.target.value)
                  }
                />

                <select
                  className="border p-2 rounded"
                  value={task.taskType}
                  onChange={(e) =>
                    updateTask(
                      index,
                      "taskType",
                      e.target.value
                    )
                  }
                >
                  <option value="feature">Feature</option>
                  <option value="bug">Bug</option>
                </select>

                <Button
                  variant="outline"
                  onClick={() => removeTask(index)}
                >
                  <X/>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={handleSubmit}>
            Save Milestone
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}