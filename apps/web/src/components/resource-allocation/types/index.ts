export type Project = {
  id: string;
  name: string;
  description?: string;
  isNote?: boolean;
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