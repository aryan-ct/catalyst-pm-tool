export type Project = {
  id: string;
  name: string;
  description?: string;
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