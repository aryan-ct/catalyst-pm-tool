import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { RESOURCE_API } from '@/api/resource.api';
import { RESOURCE_ALLOCATIONS_API } from '@/api/resource-allocations.api';
import { PROJECT_API } from '@/api/project.api';
import { AllocationRow, Resource, Project, ProjectTask } from './types';
import { useAuth } from '@/context/AuthContext';

interface ContextType {
  resources: Resource[];
  allocations: AllocationRow[];
  projects: any[]; // Raw projects containing milestones and tasks for autocomplete
  refreshData: () => void;
  isLoading: boolean;
}

export const ResourceAllocationContext = createContext<ContextType>({
  resources: [],
  allocations: [],
  projects: [],
  refreshData: () => {},
  isLoading: true,
});

export const useResourceAllocation = () => useContext(ResourceAllocationContext);

export const ResourceAllocationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [resourcesRaw, setResourcesRaw] = useState<any[]>([]);
  const [allocationsRaw, setAllocationsRaw] = useState<any[]>([]);
  const [projectsRaw, setProjectsRaw] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [resData, allocData, projData] = await Promise.all([
        RESOURCE_API.findAllResources(),
        RESOURCE_ALLOCATIONS_API.getAllResourceAllocations(),
        PROJECT_API.getAllProjects(),
      ]);
      setResourcesRaw(resData || []);
      setAllocationsRaw(allocData || []);
      setProjectsRaw(projData || []);
    } catch (error) {
      console.error('Failed to fetch resource allocation data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id, user?.role]);

  const data = useMemo(() => {
    const resources: Resource[] = resourcesRaw.map(r => ({
      id: r.id,
      name: r.name,
      role: r.role,
    }));

    // Flatten all tasks from all projects to easily look up task titles and descriptions
    const taskMap = new Map<string, string>();
    const taskDescMap = new Map<string, string>();
    projectsRaw.forEach(p => {
      (p.milestones || []).forEach((m: any) => {
        (m.tasks || []).forEach((t: any) => {
          taskMap.set(t.id, t.title);
          if (t.description) taskDescMap.set(t.id, t.description);
        });
      });
    });

    const map = new Map<string, AllocationRow>();

    allocationsRaw.forEach((ra: any) => {
      // ra represents a DailyTaskAllocation
      const date = new Date(ra.date).toDateString();
      const key = `${ra.resourceId}-${date}`;
      
      let row = map.get(key);
      if(!row) {
          row = {
              resourceId: ra.resourceId,
              resourceName: resources.find(r => r.id === ra.resourceId)?.name || 'Unknown',
              date: date,
              projects: []
          };
          map.set(key, row);
      }

      // Find if this project already exists in the row
      let projectEntry = row.projects.find(p => p.id === ra.projectId);
      if (!projectEntry) {
        const rawProj = projectsRaw.find(p => p.id === ra.projectId);
        
        // Handle "Notes" or custom non-project entries (where projectId is null)
        if (!ra.projectId) {
           let pseudoId = `note-${ra.id}`;
           let name = 'Generate Leads';
           
           if (ra.desc === 'Generate Leads' || (ra.desc && ra.desc.startsWith('Generate Leads::'))) {
             name = 'Generate Leads';
           } else {
             name = 'Misc task';
           }
           
           projectEntry = {
              id: pseudoId,
              name: name,
              tasks: [],
           };
        } else {
           projectEntry = {
              id: ra.projectId,
              name: rawProj ? rawProj.name : 'Unknown Project',
              tasks: [],
           };
        }
        row.projects.push(projectEntry);
      }

      // Add the task to the project entry
      const taskTitle = ra.taskId ? taskMap.get(ra.taskId) || 'Unknown Task' : undefined;
      const taskDescription = ra.taskId ? taskDescMap.get(ra.taskId) : undefined;

      // Parse description for "Generate Leads" legacy format
      let desc = ra.desc;
      if (!ra.projectId && ra.desc?.startsWith('Generate Leads::')) {
          desc = ra.desc.substring('Generate Leads::'.length);
      }

      const taskEntry: ProjectTask = {
        id: ra.id,
        taskId: ra.taskId,
        taskTitle,
        taskDescription,
        description: desc,
        customDescription: ra.taskId ? undefined : ra.description,
        estimatedHours: ra.estimatedHours,
        actualHours: ra.actualHours,
      };

      projectEntry.tasks.push(taskEntry);
    });

    return {
      resources,
      allocations: Array.from(map.values()),
      projects: projectsRaw, // pass raw projects so AllocationDetails can access milestones/tasks
    };
  }, [resourcesRaw, allocationsRaw, projectsRaw]);

  return (
    <ResourceAllocationContext.Provider value={{...data, refreshData: fetchData, isLoading}}>
      {children}
    </ResourceAllocationContext.Provider>
  );
};
