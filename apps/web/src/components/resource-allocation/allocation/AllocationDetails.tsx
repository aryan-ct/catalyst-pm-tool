import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResourceAllocation } from '../ResourceAllocationContext';
import { RESOURCE_ALLOCATIONS_API } from '@/api/resource-allocations.api';
import { AllocationRow } from '../types';
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
import { CircleX, ArrowLeft, Calendar as CalendarIcon, Plus, StickyNote } from 'lucide-react';

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
  const isHR = user?.role === Roles.HR;

  const PROJECT_OPTIONS = projects.map((p) => p.name);

  const today = new Date().toDateString();
  const isEditable = date === today && isHR;

  const [rows, setRows] = useState<AllocationRow[]>(() => {
    const dayAllocations = allocations.filter((a) => a.date === date);
    if (!isEditable) return dayAllocations;

    const seedMap = new Map<string, AllocationRow>();

    if (dayAllocations.length > 0) {
      dayAllocations.forEach((a) => seedMap.set(a.resourceId, a));
    } else {
      const pastTimes = allocations
        .filter((a) => a.date !== date)
        .map((a) => new Date(a.date).getTime());

      if (pastTimes.length > 0) {
        const lastDate = new Date(Math.max(...pastTimes)).toDateString();
        allocations
          .filter((a) => a.date === lastDate)
          .forEach((a) => seedMap.set(a.resourceId, a));
      }
    }

    return resources.map((r) => {
      const seed = seedMap.get(r.id);
      return {
        resourceId: r.id,
        resourceName: r.name,
        date: date,
        projects: seed
          ? seed.projects.map((p) => ({ ...p, id: `${Date.now()}-${Math.random()}` }))
          : [],
      };
    });
  });

  // Per-resource note input values keyed by resourceId
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEditable) {
      setRows(allocations.filter((a) => a.date === date));
    }
  }, [allocations, date, isEditable]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const payload = rows.flatMap((row) =>
      row.projects
        .map((p) => {
          if (p.isNote) {
            return { resourceId: row.resourceId, desc: p.name };
          }

          if (p.name === 'Generate Leads' && !p.isNote) {
            const descStr = p.description ? `Generate Leads::${p.description}` : 'Generate Leads';
            return { resourceId: row.resourceId, desc: descStr };
          }

          const project = projects.find((proj) => proj.name === p.name);
          if (!project) return null;
          return { resourceId: row.resourceId, projectId: project.id, desc: p.description || '' };
        })
        .filter(Boolean),
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
      isNote: false,
    });
    setRows(updated);
  };

  const handleAddNote = (rowIndex: number) => {
    const resourceId = rows[rowIndex].resourceId;
    const text = (noteInputs[resourceId] || '').trim();
    if (!text) return;

    const updated = [...rows];
    updated[rowIndex].projects.push({
      id: `note-${Date.now()}`,
      name: text,
      description: '',
      isNote: true,
    });
    setRows(updated);
    setNoteInputs((prev) => ({ ...prev, [resourceId]: '' }));
  };

  const handleRemoveEntry = (rowIndex: number, entryIndex: number) => {
    const updated = [...rows];
    updated[rowIndex].projects.splice(entryIndex, 1);
    setRows(updated);
  };

  const handleDescChange = (rowIndex: number, entryIndex: number, value: string) => {
    const updated = [...rows];
    updated[rowIndex].projects[entryIndex].description = value;
    setRows(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold text-foreground">{date}</span>
        </div>

        {isEditable ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="shadow-lg shadow-primary/20 min-w-[100px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving
              </div>
            ) : (
              'Submit Changes'
            )}
          </Button>
        ) : (
          <div className="w-20" />
        )}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-md overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 bg-muted/50 p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border shrink-0">
          <div className="col-span-3">Resource</div>
          <div className="col-span-4">Assigned Projects / Notes</div>
          <div className="col-span-5 text-right">Activity / Description</div>
        </div>

        <div className="max-h-[580px] overflow-y-auto divide-y divide-border/40">
          {rows.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No data available
            </div>
          ) : (
            rows.map((row, rowIndex) => {
              const resource = resources.find((r) => r.id === row.resourceId);
              const isHRResource = resource?.role === Roles.HR;

              return (
              <div
                key={rowIndex}
                className="hover:bg-muted/30 transition-colors p-4"
              >
              {/* Edit mode: header row with Add Project dropdown + Add Note input */}
              {isEditable && (
                <div className="grid grid-cols-12 gap-4 px-4 items-center mb-2">
                  {/* Resource name */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={row.resourceName} />
                      <span className="font-semibold text-foreground truncate">
                        {row.resourceName}
                      </span>
                    </div>
                  </div>

                  {/* Add project dropdown */}
                  {!isHRResource && (
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
                        {(resource?.role === Roles.BDE
                          ? ['Generate Leads']
                          : PROJECT_OPTIONS.filter((p) => p !== 'Generate Leads')
                        )
                          .filter((p) => !row.projects.some((proj) => !proj.isNote && proj.name === p))
                          .map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                      </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Add note input */}
                  <div className={`flex gap-2 ${isHRResource ? 'col-span-9' : 'col-span-5'}`}>
                    <Input
                      placeholder="Add a note (e.g. Sick leave, Lead generation)"
                      value={noteInputs[row.resourceId] || ''}
                      onChange={(e) =>
                        setNoteInputs((prev) => ({
                          ...prev,
                          [row.resourceId]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddNote(rowIndex);
                      }}
                      className="h-10 bg-card border-border shadow-sm focus:ring-1 focus:ring-primary text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0 border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                      onClick={() => handleAddNote(rowIndex)}
                      title="Add note"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Entries: project badges and note badges */}
              {row.projects.length === 0 && !isEditable && (
                <div className="px-4 py-2 text-sm text-muted-foreground italic">
                  No allocation for this date
                </div>
              )}

              {row.projects.map((p, entryIndex) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 gap-6 px-4 pb-2 items-start"
                >
                  {/* Resource name — only shown on first entry in read-only mode */}
                  <div className="col-span-3">
                    <div className="font-medium text-sm text-foreground pl-11">
                      {!isEditable && entryIndex === 0 ? (
                        <div className="flex items-center gap-3">
                          <Avatar name={row.resourceName} className="-ml-11" />
                          <span className="font-semibold">{row.resourceName}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Project badge (blue) or Note badge (amber) */}
                  <div className="col-span-4">
                    {p.isNote ? (
                      <div className="flex justify-between items-center border border-amber-300 bg-amber-50 rounded-lg px-3 py-2 text-sm text-amber-700 font-medium gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <StickyNote className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{p.name}</span>
                        </div>
                        {isEditable && (
                          <button
                            onClick={() => handleRemoveEntry(rowIndex, entryIndex)}
                            className="text-amber-500 hover:text-destructive transition-colors shrink-0"
                          >
                            <CircleX className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-between items-center border border-primary/20 bg-primary/5 rounded-lg px-3 py-2 text-sm text-primary font-medium">
                        <span className="truncate">{p.name}</span>
                        {isEditable && (
                          <button
                            onClick={() => handleRemoveEntry(rowIndex, entryIndex)}
                            className="text-primary hover:text-destructive transition-colors shrink-0"
                          >
                            <CircleX className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Activity description — only for project entries */}
                  <div className="col-span-5">
                    {p.isNote ? (
                      <div className="px-4 py-2 text-sm text-muted-foreground/50 italic select-none">
                        —
                      </div>
                    ) : isEditable ? (
                      <Input
                        placeholder="What are they working on?"
                        value={p.description || ''}
                        onChange={(e) => handleDescChange(rowIndex, entryIndex, e.target.value)}
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
          );
        })
        )}
        </div>
      </div>
    </div>
  );
};

export default AllocationDetails;
