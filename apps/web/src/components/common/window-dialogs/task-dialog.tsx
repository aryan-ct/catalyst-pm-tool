// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { PencilRuler } from "lucide-react";
// import TaskName from "./sub-components/Taskname";
// import TaskDescription from "./sub-components/TaskDescription";
// import PriorityList from "./sub-components/PriorityList";
// import ProjectsList from "./sub-components/ProjectsList";

// export default function TaskDialog(){
//     return (
//         <Dialog>
//             <DialogTrigger className="rounded-3xl px-5">
//                 Add New Task
//             </DialogTrigger>
//             <DialogContent className="max-w-3xl">
//                 <DialogHeader>
//                     <div className="size-10 brg-gray-200 rounded-full flex justify-center items-center">
//                         <PencilRuler className="text-xl text-gray-700"/>
//                     </div>

//                     <div className="pt-2">
//                         <DialogTitle className="text-lg p-0 h-7">New Task</DialogTitle>
//                         <DialogDescription className="p-0">Fill in the form to create or modify a task</DialogDescription>
//                     </div>
//                 </DialogHeader>
//                 <div className="grid grid-cols-2 gap-6 mt-8">
//                     <div className="flex flex-col gap-3">
//                         <TaskName/>
//                         <TaskDescription/>
//                     </div>
//                     <div className="flex flex-col gap-[53px]">
//                 <ProjectsList/>
//                 <PriorityList/>
//                     </div>
//                 </div>
//                 <div className="flex gap-1 justify-end mt-6">
//                     <Button>Close</Button>
//                     <Button className="ml-5 px-5">Add New Task</Button>
//                 </div>
//             </DialogContent>
//         </Dialog>
//     )
// }

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { PencilRuler } from "lucide-react";
// import TaskName from "./sub-components/Taskname";
// import TaskDescription from "./sub-components/TaskDescription";
// import PriorityList from "./sub-components/PriorityList";
// import ProjectsList from "./sub-components/ProjectsList";

// export default function TaskDialog({ open, setOpen }: any) {
//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogContent className="max-w-3xl">
//         <DialogHeader>
//           <div className="size-10 bg-gray-200 rounded-full flex justify-center items-center">
//             <PencilRuler className="text-xl text-gray-700" />
//           </div>

//           <div className="pt-2">
//             <DialogTitle className="text-lg">New Task</DialogTitle>
//             <DialogDescription>
//               Fill in the form to create or modify a task
//             </DialogDescription>
//           </div>
//         </DialogHeader>

//         <div className="grid grid-cols-2 gap-6 mt-8">
//           <div className="flex flex-col gap-3">
//             <TaskName />
//             <TaskDescription />
//           </div>

//           <div className="flex flex-col gap-[53px]">
//             <ProjectsList />
//             <PriorityList />
//           </div>
//         </div>

//         <div className="flex gap-2 justify-end mt-6">
//           <Button variant="outline" onClick={() => setOpen(false)}>
//             Close
//           </Button>
//           <Button className="px-5">Add New Task</Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PencilRuler } from "lucide-react";

// TYPES
type TaskType = "bug" | "feature";

type SubTask = {
  title: string;
  taskType: TaskType;
};

type Milestone = {
  milestoneName: string;
  milestoneDescription: string;
  estimatedHours: number;
  bugSheet?: string;
  tasks: SubTask[];
};

type Errors = {
  milestoneName?: string;
  milestoneDescription?: string;
  estimatedHours?: string;
  tasks?: string;
};

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function TaskDialog({ open, setOpen }: Props) {
  const [milestone, setMilestone] = useState<Milestone>({
    milestoneName: "",
    milestoneDescription: "",
    estimatedHours: 0,
    bugSheet: "",
    tasks: [],
  });

  const [errors, setErrors] = useState<Errors>({});

  // ADD TASK
  const addTask = () => {
    setMilestone((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { title: "", taskType: "feature" }],
    }));
  };

  // UPDATE TASK
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

    setMilestone({ ...milestone, tasks: updatedTasks });
  };

  // REMOVE TASK
  const removeTask = (index: number) => {
    const updated = milestone.tasks.filter((_, i) => i !== index);
    setMilestone({ ...milestone, tasks: updated });
  };

  // VALIDATION
  const validate = () => {
    const newErrors: Errors = {};

    if (!milestone.milestoneName.trim()) {
      newErrors.milestoneName = "Milestone name is required";
    }

    if (!milestone.milestoneDescription.trim()) {
      newErrors.milestoneDescription = "Description is required";
    }

    if (!milestone.estimatedHours || milestone.estimatedHours <= 0) {
      newErrors.estimatedHours = "Enter valid hours";
    }

    milestone.tasks.forEach((task, index) => {
      if (!task.title.trim()) {
        newErrors.tasks = `Task ${index + 1} title is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleSubmit = () => {
    if (!validate()) return;

    console.log("Milestone Data:", milestone);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="size-10 bg-gray-200 rounded-full flex justify-center items-center">
            <PencilRuler className="text-xl text-gray-700" />
          </div>

          <div className="pt-2">
            <DialogTitle className="text-lg">New Milestone</DialogTitle>
            <DialogDescription>
              Create a milestone and add tasks
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* MILESTONE FIELDS */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="flex flex-col gap-3">

            {/* NAME */}
            <div>
              <label className="text-sm font-medium">Milestone Name</label>
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.milestoneName}
                </p>
              )}
            </div>

            {/* DESCRIPTION */}
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.milestoneDescription}
                </p>
              )}
            </div>

            {/* HOURS */}
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.estimatedHours}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col gap-3">
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
        </div>

        {/* TASKS */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
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
            {milestone.tasks.length === 0 && (
              <span className="text-sm text-gray-400">
                No tasks added yet
              </span>
            )}

            {milestone.tasks.map((task, index) => (
              <div
                key={index}
                className="flex gap-2 items-center"
              >
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
                      e.target.value as TaskType
                    )
                  }
                >
                  <option value="feature">Feature</option>
                  <option value="bug">Bug</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTask(index)}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-2 justify-end mt-6">
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