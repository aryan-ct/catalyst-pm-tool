export type ProjectTask = {
  id?: string; // DailyTaskAllocation ID
  taskId?: string; // Real Task ID if applicable
  taskTitle?: string;
  taskDescription?: string; // Description from the project task definition
  description?: string; // For dummy tasks
  estimatedHours?: number;
  actualHours?: number;
};

export type Project = {
  id: string; // Project ID
  name: string; // Project Name
  tasks: ProjectTask[];
};

export type AllocationRow = {
  resourceId: string;
  resourceName: string;
  projects: Project[];
  date: string;
};

export type Resource = {
  id: string;
  name: string;
  role: string;
};