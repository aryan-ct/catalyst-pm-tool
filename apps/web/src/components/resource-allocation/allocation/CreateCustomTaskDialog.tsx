import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { PencilRuler, Info, Briefcase, Layers, FolderDot } from 'lucide-react';
import { TASK_API } from '@/api/task.api';
import { RESOURCE_API } from '@/api/resource.api';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export type CreatedCustomTask = {
  /** Present only when project + milestone selected — a real DB task was created. */
  id?: string;
  title: string;
  description?: string;
  estimatedHours?: number;
  milestoneId?: string;
  projectId?: string;
};

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  projects: any[];
  defaultProjectId?: string;
  defaultMilestoneId?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultEstimatedHours?: number | string;
  /** When true, all fields are read-only and no task is created on submit. */
  readOnly?: boolean;
  onCreated: (task: CreatedCustomTask) => void;
};

const EMPTY = {
  title: '',
  description: '',
  taskType: 'feature' as 'feature' | 'bug',
  bugNumber: '',
  estimatedHours: '' as number | string,
  assignedTo: [] as { id: string; name: string }[],
};

const NO_PROJECT = '__none__';

export default function CreateCustomTaskDialog({
  open,
  setOpen,
  projects,
  defaultProjectId = '',
  defaultMilestoneId = '',
  defaultTitle = '',
  defaultDescription = '',
  defaultEstimatedHours = '',
  readOnly = false,
  onCreated,
}: Props) {
  const [form, setForm]               = useState({ ...EMPTY });
  const [projectId, setProjectId]     = useState(defaultProjectId);
  const [milestoneId, setMilestoneId] = useState(defaultMilestoneId);
  const [resources, setResources]     = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving]           = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setProjectId(defaultProjectId);
      setMilestoneId(defaultMilestoneId);
      setForm({ ...EMPTY, title: defaultTitle, description: defaultDescription, estimatedHours: defaultEstimatedHours });
      setErrors({});
      if (!readOnly) {
        RESOURCE_API.findAllResources()
          .then(setResources)
          .catch(console.error);
      }
    }
  }, [open, defaultProjectId, defaultMilestoneId, defaultTitle, defaultDescription, defaultEstimatedHours, readOnly]);

  const handleProjectChange = (val: string | null) => {
    setProjectId(!val || val === NO_PROJECT ? '' : val);
    setMilestoneId('');
  };

  const selectedProject        = projects.find((p) => p.id === projectId);
  const milestones: any[]      = selectedProject?.milestones ?? [];
  const selectedMilestoneName  = milestones.find((m) => m.id === milestoneId)?.milestoneName;

  const hasProject   = !!projectId;
  const hasMilestone = !!milestoneId;
  const willCreateDbTask = hasProject && hasMilestone;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Task name is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (willCreateDbTask) {
        const rawText  = form.description.replace(/<[^>]*>/g, '').trim();
        const cleanDesc = rawText === '' ? '' : form.description;

        const created = await TASK_API.createTask(milestoneId, {
          title: form.title.trim(),
          description: cleanDesc,
          estimatedHours: form.estimatedHours !== '' ? Number(form.estimatedHours) : 0,
          taskStatus: 'TODO',
          taskType: form.taskType.toUpperCase(),
          bugNumber: form.taskType === 'bug' ? form.bugNumber : undefined,
          assignedTo: form.assignedTo.map((r) => r.id),
        });

        onCreated({
          id: created.id,
          title: created.title,
          estimatedHours: created.estimatedHours,
          milestoneId,
          projectId,
        });
      } else {
        // Freetext / misc — no milestone, save as allocation desc
        const rawText = form.description.replace(/<[^>]*>/g, '').trim();
        onCreated({
          title: form.title.trim(),
          description: rawText ? form.description : undefined,
          estimatedHours: form.estimatedHours !== '' ? Number(form.estimatedHours) : undefined,
          projectId: projectId || undefined,
        });
      }
      setOpen(false);
    } catch (err) {
      console.error('Create custom task failed', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!fixed !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 !right-0 !bottom-0 h-screen w-screen !max-w-none rounded-none border-none bg-card p-0 gap-0 overflow-hidden flex flex-col animate-in fade-in duration-200">

        {/* Header */}
        <div className="px-12 pt-8 pb-5 border-b border-border bg-muted/20">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold mb-1">
              <Layers className="size-3.5" />
              <span>Resource Allocation</span>
              <span>/</span>
              <span className="text-foreground">
                {selectedMilestoneName ?? selectedProject?.name ?? 'New Custom Task'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <PencilRuler className="size-4 text-primary" />
              </div>
              <DialogTitle className="text-lg font-bold">
                {readOnly ? 'Custom Task Details' : 'Create Custom Task'}
              </DialogTitle>
              {!readOnly && !willCreateDbTask && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wider">
                  Misc / Freetext
                </span>
              )}
              {readOnly && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border uppercase tracking-wider">
                  Read Only
                </span>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-12 py-8 flex gap-10 min-h-0 bg-background/50">

          {/* Left — Title + Description */}
          <div className="flex-[2] flex flex-col gap-6 min-w-0 pr-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Task Name
              </Label>
              <Input
                className="text-base font-semibold border border-border focus-visible:ring-1 focus-visible:ring-primary px-3 h-10 w-full bg-background"
                placeholder="Enter a clear, descriptive task name"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                disabled={readOnly}
              />
              {errors.title && <p className="text-destructive text-xs font-medium">{errors.title}</p>}
            </div>

            <div className="space-y-1.5 flex-1 flex flex-col min-h-[300px]">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Description
              </Label>
              <div className={`flex-1 rounded-lg border border-border bg-background overflow-hidden flex flex-col ${readOnly ? 'opacity-60 pointer-events-none' : ''}`}>
                <ReactQuill
                  value={form.description}
                  onChange={(val) => !readOnly && setForm((f) => ({ ...f, description: val }))}
                  readOnly={readOnly}
                  theme="snow"
                  placeholder="Describe what needs to be done..."
                  className="flex-1 flex flex-col [&>.ql-container]:flex-1 [&>.ql-container]:overflow-y-auto [&>.ql-container]:min-h-[180px] [&>.ql-editor]:text-sm [&>.ql-editor]:leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Right — Details Panel */}
          <div className="w-[320px] shrink-0 flex flex-col gap-5 bg-muted/20 p-6 rounded-xl border border-border/60 h-fit">
            <div className="flex items-center gap-1.5 pb-2 border-b border-border/60">
              <Info className="size-4 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Details Panel
              </span>
            </div>

            {/* Project */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="size-3.5" /> Project{' '}
                <span className="text-muted-foreground/60 text-[10px] normal-case">(Optional)</span>
              </Label>
              <Select value={projectId || NO_PROJECT} onValueChange={handleProjectChange} disabled={readOnly}>
                <SelectTrigger className="w-full h-9 bg-background border-border">
                  <span className="truncate text-sm">
                    {selectedProject?.name ?? (
                      <span className="text-muted-foreground italic flex items-center gap-1.5">
                        <FolderDot className="size-3.5" /> None (Misc)
                      </span>
                    )}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PROJECT}>
                    <span className="flex items-center gap-2 text-muted-foreground italic">
                      <FolderDot className="size-3.5" /> None (Misc)
                    </span>
                  </SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Milestone — visible only when a project is selected */}
            {hasProject && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="size-3.5" /> Milestone{' '}
                  <span className="text-muted-foreground/60 text-[10px] normal-case">(Optional)</span>
                </Label>
                <Select
                  value={milestoneId || NO_PROJECT}
                  onValueChange={(v) => setMilestoneId(!v || v === NO_PROJECT ? '' : v)}
                  disabled={readOnly || milestones.length === 0}
                >
                  <SelectTrigger className="w-full h-9 bg-background border-border">
                    <span className="truncate text-sm">
                      {selectedMilestoneName ?? (
                        <span className="text-muted-foreground italic">None</span>
                      )}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_PROJECT}>
                      <span className="text-muted-foreground italic">None</span>
                    </SelectItem>
                    {milestones.map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>{m.milestoneName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!hasMilestone && (
                  <p className="text-[11px] text-amber-600 font-medium">
                    No milestone selected — task will be saved as freetext.
                  </p>
                )}
              </div>
            )}

            {/* Task Type — only relevant for DB tasks */}
            {willCreateDbTask && (
              <>
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Task Type
                  </Label>
                  <Select
                    value={form.taskType}
                    onValueChange={(v) => setForm((f) => ({ ...f, taskType: v as 'feature' | 'bug' }))}
                  >
                    <SelectTrigger className="w-full h-9 bg-background border-border capitalize">
                      <span className="truncate font-semibold">{form.taskType}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.taskType === 'bug' && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Bug Number <span className="text-muted-foreground/60 text-[10px] normal-case">(Optional)</span>
                    </Label>
                    <Input
                      className="h-9 bg-background border-border"
                      placeholder="e.g. BUG-401"
                      value={form.bugNumber}
                      onChange={(e) => setForm((f) => ({ ...f, bugNumber: e.target.value }))}
                    />
                  </div>
                )}

                {/* Assign Resources */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Assign Resources
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start h-9 px-3 font-normal text-sm bg-background border-border"
                      >
                        <span className="truncate">
                          {form.assignedTo.length > 0
                            ? `${form.assignedTo.length} resource(s) selected`
                            : 'Select resources…'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[220px] max-h-[250px] overflow-y-auto">
                      {resources.map((r) => {
                        const checked = !!form.assignedTo.find((x) => x.id === r.id);
                        return (
                          <DropdownMenuCheckboxItem
                            key={r.id}
                            checked={checked}
                            onCheckedChange={(v) =>
                              setForm((f) => ({
                                ...f,
                                assignedTo: v
                                  ? [...f.assignedTo, r]
                                  : f.assignedTo.filter((x) => x.id !== r.id),
                              }))
                            }
                          >
                            {r.name}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {form.assignedTo.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.assignedTo.map((res) => (
                        <div
                          key={res.id}
                          className="flex items-center gap-1 bg-secondary pl-1 pr-2 py-0.5 rounded-full text-[11px] font-medium border border-border"
                        >
                          <Avatar name={res.name} className="h-4.5 w-4.5 text-[8px] bg-background" />
                          <span className="truncate max-w-[80px]">{res.name}</span>
                          <button
                            onClick={() => setForm((f) => ({ ...f, assignedTo: f.assignedTo.filter((x) => x.id !== res.id) }))}
                            className="text-muted-foreground hover:text-foreground rounded-full p-0.5"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Estimated Hours — always available */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Estimated Hours <span className="text-muted-foreground/60 text-[10px] normal-case">(Optional)</span>
              </Label>
              <Input
                type="number"
                className="h-9 bg-background border-border"
                min={0}
                placeholder="0"
                value={form.estimatedHours}
                onChange={(e) => setForm((f) => ({ ...f, estimatedHours: e.target.value ? Number(e.target.value) : '' }))}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-12 py-5 border-t border-border flex items-center justify-between gap-2 bg-muted/20">
          {readOnly ? (
            <>
              <p className="text-xs text-muted-foreground">Viewing custom task details.</p>
              <Button variant="outline" size="sm" className="h-9 px-6" onClick={() => setOpen(false)}>
                Close
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {willCreateDbTask
                  ? 'A task will be created in the project and added to the allocation.'
                  : 'This task will be saved as a custom entry in the allocation.'}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9 px-4" onClick={() => setOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={saving} className="min-w-[140px] h-9 px-4 font-semibold shadow-sm">
                  {saving ? (
                    <span className="flex items-center gap-1.5">
                      <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Creating…
                    </span>
                  ) : (
                    'Create Task'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
