import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResourceAllocation } from '../ResourceAllocationContext';
import { RESOURCE_ALLOCATIONS_API } from '@/api/resource-allocations.api';
import { AllocationRow } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CircleX } from 'lucide-react';

const AllocationDetails = ({
  date,
  onBack,
}: {
  date: string;
  onBack: () => void;
}) => {
  const { allocations, projects, resources, refreshData } = useResourceAllocation();
  const PROJECT_OPTIONS = projects.map(p => p.name);

  const today = new Date().toDateString();
  const isEditable = date === today;

  const [rows, setRows] = useState<AllocationRow[]>(() => {
    const dayAllocations = allocations.filter((a) => a.date === date);
    if (!isEditable) return dayAllocations;

    const resourceMap = new Map<string, AllocationRow>();
    dayAllocations.forEach(a => resourceMap.set(a.resourceId, a));

    return resources.map((r) => {
      if (resourceMap.has(r.id)) {
        return resourceMap.get(r.id)!;
      }
      return {
        resourceId: r.id,
        resourceName: r.name,
        date: date,
        projects: [],
      };
    });
  });

  useEffect(() => {
    // Only reset rows on un-editable dates when allocations change
    // If it's editable, we let the user edit the state freely
    if (!isEditable) {
      setRows(allocations.filter((a) => a.date === date));
    }
  }, [allocations, date, isEditable]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const payload = rows.flatMap(row => 
      row.projects.map(p => {
        const project = projects.find(proj => proj.name === p.name);
        return {
          resourceId: row.resourceId,
          projectId: project?.id,
          desc: p.description || ''
        };
      }).filter(item => item.projectId)
    );

    if (payload.length === 0) {
      onBack();
      return;
    }

    setIsSubmitting(true);
    try {
      await RESOURCE_ALLOCATIONS_API.createResourceAllocations(payload as any);
      await refreshData();
      onBack();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProject = (rowIndex: number, projectName: string) => {
    const updated = [...rows];

    updated[rowIndex].projects.push({
      id: Date.now().toString(),
      name: projectName,
      description: '',
    });

    setRows(updated);
  };

  const handleRemoveProject = (rowIndex: number, projectIndex: number) => {
    const updated = [...rows];
    updated[rowIndex].projects.splice(projectIndex, 1);
    setRows(updated);
  };

  const handleDescChange = (
    rowIndex: number,
    projectIndex: number,
    value: string,
  ) => {
    const updated = [...rows];
    updated[rowIndex].projects[projectIndex].description = value;
    setRows(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          ← Back
        </Button>

        <span className="font-semibold">{date}</span>

        {isEditable ? (
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 text-white">
            {isSubmitting ? 'Saving...' : 'Submit'}
          </Button>
        ) : (
          <div className="w-20"></div> /* Spacer for alignment */
        )}
      </div>

      <div className="border rounded-xl p-4">
        <div className="grid grid-cols-3 font-semibold border-b pb-2">
          <span>Resource</span>
          <span>Projects</span>
          <span>Description</span>
        </div>

        {rows.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            No data available
          </div>
        ) : (
          rows.map((row, rowIndex) => (
            <div key={rowIndex} className="border-b py-4">
              {isEditable && (
                <div className="grid grid-cols-3 gap-4 mb-3 items-center">
                  <div className="font-medium">{row.resourceName}</div>

                  <div>
                    <Select<string>
                      onValueChange={(value) => {
                        if (!value) return;
                        handleAddProject(rowIndex, value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>

                      <SelectContent>
                        {PROJECT_OPTIONS.filter(
                          (p) => !row.projects.some((proj) => proj.name === p),
                        ).map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div></div>
                </div>
              )}

              {row.projects.map((p, projectIndex) => (
                <div
                  key={p.id}
                  className="grid grid-cols-3 gap-4 mb-3 items-start"
                >
                  <div className="font-medium">
                    {!isEditable && projectIndex === 0 ? row.resourceName : ''}
                  </div>

                  <div className="flex justify-between border rounded px-3 py-2">
                    <span>{p.name}</span>

                    {isEditable && (
                      <button
                        onClick={() =>
                          handleRemoveProject(rowIndex, projectIndex)
                        }
                        className="text-red-500 hover:cursor-pointer"
                      >
                        <CircleX className='h-4 w-4'/>
                      </button>
                    )}
                  </div>

                  <div>
                    {isEditable ? (
                      <Input
                        placeholder="Description"
                        value={p.description || ''}
                        onChange={(e) =>
                          handleDescChange(
                            rowIndex,
                            projectIndex,
                            e.target.value,
                          )
                        }
                        className="min-h-[40px]"
                      />
                    ) : (
                      <div className="border rounded px-3 py-2 break-words whitespace-pre-wrap">
                        {p.description || '-'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllocationDetails;
