export type Status = "todo" | "in-progress" | "in-review" | "done";
export type TaskType = "bug" | "feature";

export interface SubTask {
  id: string;
  title: string;
  taskType: TaskType;
}

export interface Milestone {
  id: string;
  milestoneName: string;
  milestoneDescription: string;
  estimatedHours: number;
  bugSheet?: string;
  status: Status;
  tasks: SubTask[];
}

export interface Project {
  id: string;
  name: string;
  description:string;
  milestones: Milestone[];
}