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
import { CircleX, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <Button variant="ghost" onClick={onBack} disabled={isSubmitting} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold text-foreground">{date}</span>
        </div>

        {isEditable ? (
          <Button onClick={handleSubmit} disabled={isSubmitting} className="shadow-lg shadow-primary/20 min-w-[100px]">
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving
              </div>
            ) : 'Submit Changes'}
          </Button>
        ) : (
          <div className="w-20"></div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-md overflow-hidden">
        <div className="grid grid-cols-12 bg-muted/50 p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
          <div className="col-span-3">Resource</div>
          <div className="col-span-4">Assigned Projects</div>
          <div className="col-span-5 text-right">Activity / Description</div>
        </div>

        {rows.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            No data available
          </div>
        ) : (
          rows.map((row, rowIndex) => (
            <div key={rowIndex} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors p-4">
              {isEditable && (
                <div className="grid grid-cols-12 gap-6 px-4 items-center mb-2">
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {row.resourceName.charAt(0)}
                      </div>
                      <span className="font-semibold text-foreground">{row.resourceName}</span>
                    </div>
                  </div>

                  <div className="col-span-4">
                    <Select<string>
                      onValueChange={(value) => {
                        if (!value) return;
                        handleAddProject(rowIndex, value);
                      }}
                    >
                      <SelectTrigger className="w-full bg-card border-border shadow-sm">
                        <SelectValue placeholder="+ Add Project" />
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

                  <div className="col-span-5"></div>
                </div>
              )}

              {row.projects.map((p, projectIndex) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 gap-6 px-4 pb-2 items-start"
                >
                  <div className="col-span-3">
                    <div className="font-medium text-sm text-foreground pl-11">
                      {!isEditable && projectIndex === 0 ? (
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold -ml-11">
                            {row.resourceName.charAt(0)}
                          </div>
                          <span className="font-semibold">{row.resourceName}</span>
                        </div>
                      ) : ''}
                    </div>
                  </div>

                  <div className="col-span-4">
                    <div className="flex justify-between items-center border border-primary/20 bg-primary/5 rounded-lg px-3 py-2 text-sm text-primary font-medium">
                      <span>{p.name}</span>

                      {isEditable && (
                        <button
                          onClick={() =>
                            handleRemoveProject(rowIndex, projectIndex)
                          }
                          className="text-primary hover:text-destructive transition-colors"
                        >
                          <CircleX className='h-4 w-4' />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="col-span-5">
                    {isEditable ? (
                      <Input
                        placeholder="What are they working on?"
                        value={p.description || ''}
                        onChange={(e) =>
                          handleDescChange(
                            rowIndex,
                            projectIndex,
                            e.target.value,
                          )
                        }
                        className="h-10 bg-card border-border shadow-sm focus:ring-1 focus:ring-primary"
                      />
                    ) : (
                      <div className="border border-border/50 bg-muted/20 rounded-lg px-4 py-2 text-sm text-muted-foreground italic break-words whitespace-pre-wrap min-h-[40px] flex items-center justify-end">
                        {p.description || 'No description provided'}
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
