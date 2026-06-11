import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResourceAllocation } from '../ResourceAllocationContext';
import { RESOURCE_ALLOCATIONS_API } from '@/api/resource-allocations.api';
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/lib/enum';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Plus,
  Briefcase,
  ListTodo,
  Trash2,
  UserRound,
  CheckCircle2,
  FolderDot,
  Clock,
} from 'lucide-react';
import { TaskCombobox } from './TaskCombobox';

type RowState = {
  id: string;
  projectId: string;
  milestoneId?: string;
  taskId: string;
  desc: string;
  estimatedHours: number | string;
  actualHours: number | string;
};

const AllocationDetails = ({
  date,
  onBack,
}: {
  date: string;
  onBack: () => void;
}) => {
  const { allocations, projects, resources, refreshData } =
    useResourceAllocation();
  const { user } = useAuth();
  const isHR = user?.role === Roles.HR || user?.role === Roles.JR_HR;

  const today = new Date().toDateString();
  const isEditable = date === today && isHR;

  // Flatten state: Resource ID -> Array of Rows
  const [resourceRows, setResourceRows] = useState<Record<string, RowState[]>>(
    () => {
      const dayAllocations = allocations.filter((a) => a.date === date);
      const map: Record<string, RowState[]> = {};

      // Initialize empty array for all resources so they show up
      resources.forEach((r) => {
        map[r.id] = [];
      });

      if (dayAllocations.length > 0) {
        dayAllocations.forEach((alloc) => {
          const rows: RowState[] = [];
          alloc.projects.forEach((proj) => {
            proj.tasks?.forEach((task) => {
              rows.push({
                id: task.id || Math.random().toString(),
                projectId: proj.id.startsWith('note-') ? 'none' : proj.id,
                milestoneId: (task as any).milestoneId || '',
                taskId: task.taskId || '',
                desc: task.taskId ? '' : task.description || '',
                estimatedHours: task.estimatedHours ?? '',
                actualHours: task.actualHours ?? '',
              });
            });
          });
          map[alloc.resourceId] = rows;
        });
      } else if (isEditable) {
        // Pre-populate from previous day to reduce data-entry effort
        const prevDate = [...new Set(allocations.map((a) => a.date))]
          .filter((d) => new Date(d).getTime() < new Date(today).getTime())
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

        if (prevDate) {
          allocations
            .filter((a) => a.date === prevDate)
            .forEach((alloc) => {
              if (!(alloc.resourceId in map)) return;
              const rows: RowState[] = [];
              alloc.projects.forEach((proj) => {
                proj.tasks?.forEach((task) => {
                  const projectId = proj.id.startsWith('note-') ? 'none' : proj.id;
                  let milestoneId = '';
                  if (task.taskId && projectId) {
                    const project = projects.find((p: any) => p.id === projectId);
                    (project?.milestones || []).forEach((m: any) => {
                      if ((m.tasks || []).some((t: any) => t.id === task.taskId)) {
                        milestoneId = m.id;
                      }
                    });
                  }
                  rows.push({
                    id: Math.random().toString(),
                    projectId,
                    milestoneId,
                    taskId: task.taskId || '',
                    desc: task.taskId ? '' : task.description || '',
                    estimatedHours: task.estimatedHours ?? '',
                    actualHours: '',
                  });
                });
              });
              map[alloc.resourceId] = rows;
            });
        }
      }

      return map;
    },
  );

  // Re-sync if date changes
  useEffect(() => {
    if (!isEditable) {
      const dayAllocations = allocations.filter((a) => a.date === date);
      const map: Record<string, RowState[]> = {};
      resources.forEach((r) => {
        map[r.id] = [];
      });
      dayAllocations.forEach((alloc) => {
        const rows: RowState[] = [];
        alloc.projects.forEach((proj) => {
          proj.tasks?.forEach((task) => {
            rows.push({
              id: task.id || Math.random().toString(),
              projectId: proj.id.startsWith('note-') ? 'none' : proj.id,
              milestoneId: (task as any).milestoneId || '',
              taskId: task.taskId || '',
              desc: task.taskId ? '' : task.description || '',
              estimatedHours: task.estimatedHours ?? '',
              actualHours: task.actualHours ?? '',
            });
          });
        });
        map[alloc.resourceId] = rows;
      });
      setResourceRows(map);
    }
  }, [allocations, date, isEditable, resources]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const payload: any[] = [];
    let validationError = '';

    Object.keys(resourceRows).forEach((resId) => {
      resourceRows[resId].forEach((row) => {
        // Skip completely empty rows
        if (!row.projectId && !row.taskId && !row.desc) return;

        if (
          row.desc &&
          !row.taskId &&
          (row.estimatedHours === '' || row.estimatedHours === undefined || row.estimatedHours === null || Number(row.estimatedHours) < 0)
        ) {
          validationError = 'Please provide a valid ETA (>= 0) for all custom tasks.';
        }

        payload.push({
          resourceId: resId,
          projectId: row.projectId === 'none' ? undefined : (row.projectId || undefined),
          milestoneId: row.milestoneId || undefined,
          taskId: row.taskId || undefined,
          desc: row.taskId ? undefined : row.desc || 'Custom Task',
          estimatedHours:
            row.estimatedHours === '' ? undefined : Number(row.estimatedHours),
          actualHours:
            row.actualHours === '' ? undefined : Number(row.actualHours),
          date: new Date(date).toISOString(),
        });
      });
    });

    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await RESOURCE_ALLOCATIONS_API.createResourceAllocations(payload);
      await refreshData();
      onBack();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRow = (resourceId: string) => {
    setResourceRows((prev) => ({
      ...prev,
      [resourceId]: [
        ...prev[resourceId],
        {
          id: Math.random().toString(),
          projectId: '',
          milestoneId: '',
          taskId: '',
          desc: '',
          estimatedHours: '',
          actualHours: '',
        },
      ],
    }));
  };

  const handleRemoveRow = (resourceId: string, rowIndex: number) => {
    setResourceRows((prev) => {
      const updated = [...prev[resourceId]];
      updated.splice(rowIndex, 1);
      return { ...prev, [resourceId]: updated };
    });
  };

  const updateRow = (
    resourceId: string,
    rowIndex: number,
    field: keyof RowState,
    value: any,
  ) => {
    setResourceRows((prev) => {
      const updated = [...prev[resourceId]];
      const row = { ...updated[rowIndex] };

      // @ts-ignore
      row[field] = value;

      // Handle Project Change - reset task
      if (field === 'projectId') {
        row.taskId = '';
        row.milestoneId = '';
        row.desc = '';
        row.estimatedHours = '';
      }

      // Handle Task Change - auto populate ETA and desc
      if (field === 'taskId' || field === 'desc') {
        if (field === 'taskId' && value) {
          row.desc = ''; // clear desc if real task selected

          // Auto populate ETA and milestoneId
          const project = projects.find((p) => p.id === row.projectId);
          if (project) {
            let foundTask: any = null;
            let foundMilestoneId: string = '';
            (project.milestones || []).forEach((m: any) => {
              const t = (m.tasks || []).find((t: any) => t.id === value);
              if (t) {
                foundTask = t;
                foundMilestoneId = m.id;
              }
            });
            if (foundTask && foundTask.estimatedHours) {
              row.estimatedHours = foundTask.estimatedHours;
            }
            if (foundMilestoneId) {
              row.milestoneId = foundMilestoneId;
            }
          }
        } else if (field === 'desc') {
          row.taskId = ''; // clear task id if dummy desc typed
        }
      }

      updated[rowIndex] = row;
      return { ...prev, [resourceId]: updated };
    });
  };

  const renderTaskInput = (
    resourceId: string,
    row: RowState,
    index: number,
    isReadOnly: boolean,
  ) => {
    if (isReadOnly) {
      if (row.taskId) {
        const project = projects.find((p) => p.id === row.projectId);
        let title = 'Unknown Task';
        if (project) {
          (project.milestones || []).forEach((m: any) => {
            const t = (m.tasks || []).find((t: any) => t.id === row.taskId);
            if (t) title = t.title;
          });
        }
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg shadow-sm w-fit max-w-full">
            <ListTodo className="h-4 w-4 shrink-0" />
            <span className="text-sm font-semibold truncate">{title}</span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-lg shadow-sm w-fit max-w-full">
          <FolderDot className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium truncate">{row.desc}</span>
        </div>
      );
    }

    const project = projects.find((p) => p.id === row.projectId);
    const allTasks =
      project?.milestones?.flatMap((m: any) => m.tasks || []) || [];

    return (
      <div className="flex gap-2">
        {row.desc && !row.taskId ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              value={row.desc}
              onChange={(e) =>
                updateRow(resourceId, index, 'desc', e.target.value)
              }
              placeholder="Enter custom task description..."
              className="h-10 w-full shadow-sm border-border bg-background rounded-lg hover:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
            <div className="shrink-0 bg-muted/60 px-2 py-1 rounded-lg text-xs font-bold text-muted-foreground border border-border/60 shadow-sm flex items-center gap-1.5 whitespace-nowrap focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <span>
                <Clock className="h-4 w-4 shrink-0" />
              </span>
              <input
                type="number"
                required
                value={row.estimatedHours || ''}
                onChange={(e) =>
                  updateRow(resourceId, index, 'estimatedHours', e.target.value)
                }
                className="w-10 h-6 bg-transparent outline-none text-foreground text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
                min="0"
                step="0.5"
              />
              <span>h</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center gap-2">
            <div className="flex-1 min-w-0 w-full">
              <TaskCombobox
                allTasks={allTasks}
                selectedTaskId={row.taskId || ''}
                onSelectTask={(val) => {
                  updateRow(resourceId, index, 'taskId', val);
                }}
                onCreateCustomTask={(desc) => {
                  updateRow(resourceId, index, 'taskId', '');
                  updateRow(resourceId, index, 'desc', desc);
                }}
              />
            </div>
            {row.taskId ? (
              <div className="shrink-0 bg-muted/60 px-2 py-1 rounded-lg text-xs font-bold text-muted-foreground border border-border/60 shadow-sm flex items-center gap-1.5 whitespace-nowrap focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                <span>
                  <Clock className="h-4 w-4 shrink-0" />
                </span>
                <input
                  type="number"
                  required
                  value={row.estimatedHours !== undefined && row.estimatedHours !== null ? row.estimatedHours : ''}
                  onChange={(e) =>
                    updateRow(resourceId, index, 'estimatedHours', e.target.value)
                  }
                  className="w-10 h-6 bg-transparent outline-none text-foreground text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
                <span>h</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-card to-card/50 backdrop-blur-xl p-5 rounded-2xl border border-border shadow-lg relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-xl relative z-10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3 bg-background/50 px-5 py-2.5 rounded-xl border border-border/50 shadow-sm relative z-10">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold text-foreground tracking-tight">
            {date}
          </span>
        </div>

        {isEditable ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="shadow-lg shadow-primary/25 min-w-[140px] rounded-xl relative z-10 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span className="font-semibold">Saving...</span>
              </div>
            ) : (
              <span className="font-semibold">Save Allocations</span>
            )}
          </Button>
        ) : (
          <div className="w-[140px] hidden sm:block" />
        )}
      </div>

      <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/60 shadow-xl overflow-hidden flex flex-col">
        {/* Aligned Global Header */}
        {resources.length > 0 && (
          <div className="grid grid-cols-12 gap-4 bg-muted/40 px-[36px] py-3 font-bold text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/60 shrink-0 select-none">
            <div className="col-span-4 flex items-center gap-2 pl-3">
              <Briefcase className="h-3.5 w-3.5 text-primary/70" /> Project
            </div>
            <div className="col-span-7 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ListTodo className="h-3.5 w-3.5 text-primary/70" /> Task
              </div>
              <div className="flex items-center gap-1.5 w-[94px]">
                <Clock className="h-3.5 w-3.5 text-amber-600/70" /> 
                <span className="text-amber-600/70">ETA</span>
              </div>
            </div>
            <div className="col-span-1 text-right pr-2 flex items-center justify-end">Action</div>
          </div>
        )}

        <div className="max-h-[65vh] overflow-y-auto custom-scrollbar p-2 space-y-2">
          {resources.length === 0 ? (
            <div className="text-center text-muted-foreground py-16 flex flex-col items-center justify-center gap-3">
              <UserRound className="h-10 w-10 text-muted-foreground/30" />
              <p className="font-medium text-lg">No resources available</p>
            </div>
          ) : (
            resources.map((resource) => {
              const rows = resourceRows[resource.id] || [];

              if (!isEditable && rows.length === 0) return null;

              return (
                <div
                  key={resource.id}
                  className="group bg-background/40 hover:bg-background/80 transition-all duration-300 rounded-xl p-5 border border-border/40 hover:border-primary/20 shadow-sm hover:shadow-md flex flex-col gap-4"
                >
                  {/* Resource Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-border/30">
                    <div className="flex items-center gap-4">
                      <Avatar
                        name={resource.name}
                        className="h-10 w-10 ring-2 ring-primary/10 shadow-sm"
                      />
                      <div>
                        <h3 className="font-bold text-foreground text-base tracking-tight">
                          {resource.name}
                        </h3>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider mt-1 inline-block">
                          {resource.role.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {isEditable && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 text-xs font-semibold rounded-lg shadow-sm border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                        onClick={() => handleAddRow(resource.id)}
                      >
                        <Plus className="h-4 w-4" /> Add Task
                      </Button>
                    )}
                  </div>

                  {/* Task Rows */}
                  <div className="flex flex-col gap-3">
                    {rows.length === 0 && !isEditable && (
                      <div className="text-sm text-muted-foreground/70 italic px-2">
                        No active tasks assigned for this date.
                      </div>
                    )}
                    {rows.map((row, index) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-12 gap-4 items-center bg-card/60 p-3 rounded-xl border border-border/50 shadow-sm relative overflow-hidden group/row transition-all hover:border-primary/30"
                      >
                        {/* Left subtle indicator */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/40 to-primary/10 rounded-l-xl opacity-0 group-hover/row:opacity-100 transition-opacity" />

                        {/* Project Column */}
                        <div className="col-span-4 pl-3">
                          {isEditable ? (
                            <Select
                              value={row.projectId}
                              onValueChange={(val) =>
                                updateRow(resource.id, index, 'projectId', val)
                              }
                            >
                              <SelectTrigger className="h-10 bg-background shadow-sm rounded-lg border-border hover:border-primary/50 transition-colors">
                                <SelectValue placeholder="Select Project">
                                  {row.projectId && row.projectId !== 'none'
                                    ? projects.find(
                                        (p) => p.id === row.projectId,
                                      )?.name
                                    : row.projectId === 'none'
                                      ? 'None (Misc)'
                                      : undefined}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {projects.map((p) => (
                                  <SelectItem
                                    key={p.id}
                                    value={p.id}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                                      {p.name}
                                    </div>
                                  </SelectItem>
                                ))}
                                <SelectItem
                                  value="none"
                                  className="text-muted-foreground italic cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <FolderDot className="h-4 w-4" />
                                    None (Misc)
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-2.5">
                              <Briefcase className="h-4 w-4 text-muted-foreground/70" />
                              <span className="text-sm font-semibold text-foreground/90">
                                {row.projectId && row.projectId !== 'none'
                                  ? projects.find((p) => p.id === row.projectId)
                                      ?.name
                                  : 'Miscellaneous'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Task Column */}
                        <div className="col-span-7">
                          {renderTaskInput(
                            resource.id,
                            row,
                            index,
                            !isEditable,
                          )}
                        </div>

                        {/* Action Column */}
                        <div className="col-span-1 flex justify-end pr-2">
                          {isEditable && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveRow(resource.id, index)
                              }
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:shadow-sm rounded-lg transition-all"
                              title="Remove Task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AllocationDetails;
