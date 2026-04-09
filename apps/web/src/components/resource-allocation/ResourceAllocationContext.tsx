import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { RESOURCE_API } from '@/api/resource.api';
import { RESOURCE_ALLOCATIONS_API } from '@/api/resource-allocations.api';
import { PROJECT_API } from '@/api/project.api';
import { AllocationRow, Resource, Project } from './types';

interface ContextType {
  resources: Resource[];
  allocations: AllocationRow[];
  projects: Project[];
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
  const [resourcesRaw, setResourcesRaw] = useState<any[]>([]);
  const [allocationsRaw, setAllocationsRaw] = useState<any[]>([]);
  const [projectsRaw, setProjectsRaw] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
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
  }, []);

  const data = useMemo(() => {
    const resources: Resource[] = resourcesRaw.map(r => ({
      id: r.id,
      name: r.name,
      role: r.role,
    }));

    const map = new Map<string, AllocationRow>();

    allocationsRaw.forEach((ra: any) => {
      const date = new Date(ra.createdAt).toDateString();
      const key = `${ra.resourceId}-${date}`;
      
      let row = map.get(key);
      if(!row) {
          row = {
              resourceId: ra.resourceId,
              resourceName: ra.resourceName || resources.find(r => r.id === ra.resourceId)?.name || 'Unknown',
              date: date,
              projects: []
          };
          map.set(key, row);
      }

      const project = projectsRaw.find(p => p.id === ra.projectId);
      row.projects.push({
          id: ra.projectId,
          name: project ? project.name : 'Unknown Project',
          description: ra.desc
      });
    });

    return {
      resources,
      allocations: Array.from(map.values()),
      projects: projectsRaw.map(p => ({ id: p.id, name: p.name })),
    };
  }, [resourcesRaw, allocationsRaw, projectsRaw]);

  return (
    <ResourceAllocationContext.Provider value={{...data, refreshData: fetchData, isLoading}}>
      {children}
    </ResourceAllocationContext.Provider>
  );
};
