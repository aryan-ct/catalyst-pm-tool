export type Status = "todo" | "in-progress" | "in-review" | "done";
export type TaskType = "bug" | "feature";

export interface SubTask {
  id: string;
  title: string;
  taskType: TaskType;
  _isNew?: boolean;
}

// Kanban card — maps to a backend Task
export interface Milestone {
  id: string;
  milestoneName: string;
  milestoneDescription: string;
  estimatedHours: number;
  bugSheet?: string;
  status: Status;
  milestoneId?: string; // backend Milestone this Task belongs to
  tasks: SubTask[];
}

// Backend Milestone grouping — contains Tasks displayed as Milestone cards
export interface PMBackendMilestone {
  id: string;
  milestoneName: string;
  milestoneDescription: string;
  estimatedHours: number;
  bugSheet?: string;
  tasks: Milestone[];
}

// PM-tab project shape (deep nested)
export interface PMProject {
  id: string;
  name: string;
  description: string;
  milestones: PMBackendMilestone[];
}

// Legacy project type used by other components
export interface Project {
  id: string;
  name: string;
  description: string;
  milestones: Milestone[];
}
