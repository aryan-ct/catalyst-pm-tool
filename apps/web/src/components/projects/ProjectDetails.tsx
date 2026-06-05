import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ArrowLeft, Clock, ExternalLink, FileText, Pencil, Eye,
  Milestone, Bug, CalendarRange, Hash,
} from 'lucide-react';
import MilestoneFormDialog from './MilestoneFormDialog';
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/lib/enum';

interface Props {
  project: any;
  onBack: () => void;
}

export default function ProjectDetails({ project, onBack }: Props) {
  const { user } = useAuth();
  const isManager = user?.role === Roles.MANAGER;
  const [milestones, setMilestones] = useState<any[]>(project.milestones || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [viewingMilestone, setViewingMilestone] = useState<any>(null);

  const handleMilestoneCreated = (milestone: any) => {
    setMilestones((prev) => [...prev, milestone]);
  };

  const handleMilestoneUpdated = (updated: any) => {
    setMilestones((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const openAdd = () => { setEditingMilestone(null); setDialogOpen(true); };
  const openEdit = (milestone: any) => { setEditingMilestone(milestone); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditingMilestone(null); };

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Project Info Card */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-foreground truncate">{project.name}</h2>
              <p className="text-muted-foreground text-sm mt-1">{project.client}</p>
            </div>
            <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
              project.status === 'Active'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-muted text-muted-foreground border border-border'
            }`}>
              {project.status}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-2">
              <CalendarRange className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Started</p>
                <p className="text-sm font-medium text-foreground">{project.date || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-2">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Est. Hours</p>
                <p className="text-sm font-medium text-foreground">{project.hours ? `${project.hours} hrs` : '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-2">
              <Milestone className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Milestones</p>
                <p className="text-sm font-medium text-foreground">{milestones.length}</p>
              </div>
            </div>
            {project.docLink && (
              <a
                href={project.docLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 hover:bg-primary/10 transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-primary/70 uppercase tracking-wider font-semibold">Docs</p>
                  <p className="text-sm font-medium text-primary">Open</p>
                </div>
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Milestones Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">Milestones</h3>
            <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {milestones.length}
            </span>
          </div>
          {isManager && (
            <Button onClick={openAdd} size="sm" className="gap-1.5">
              <Milestone className="h-4 w-4" />
              Add Milestone
            </Button>
          )}
        </div>

        {milestones.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border border-dashed border-border rounded-xl bg-muted/20">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">No milestones yet</p>
            {isManager && <p className="text-xs text-muted-foreground/60 mt-1">Click "Add Milestone" to get started</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map((m, idx) => (
              <Card
                key={m.id ?? idx}
                className="group flex flex-col border-border hover:shadow-md hover:border-primary/30 transition-all duration-200"
              >
                <CardContent className="p-0 flex flex-col flex-1">

                  {/* Card header strip */}
                  <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex items-center justify-center h-7 w-7 rounded-md bg-primary/10 text-primary shrink-0">
                        <Hash className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold leading-none mb-1">
                          Milestone {idx + 1}
                        </p>
                        <h4 className="font-semibold text-sm text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {m.milestoneName}
                        </h4>
                      </div>
                    </div>
                    {isManager && (
                      <button
                        title="Edit milestone"
                        onClick={() => openEdit(m)}
                        className="shrink-0 h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Description preview */}
                  <div className="px-4 py-3 flex-1">
                    {m.milestoneDescription ? (
                      <div
                        className="text-xs text-muted-foreground line-clamp-3 leading-relaxed
                                   [&_ul]:list-disc [&_ul]:pl-4
                                   [&_ol]:list-decimal [&_ol]:pl-4"
                        dangerouslySetInnerHTML={{ __html: m.milestoneDescription }}
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground/50 italic">No description provided</p>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="px-4 py-2.5 border-t border-border/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-md px-2 py-1">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span className="font-medium">{m.estimatedHours} hrs</span>
                    </div>
                    {m.bugSheet && (
                      <a
                        href={m.bugSheet}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 hover:bg-amber-100 transition-colors"
                      >
                        <Bug className="h-3 w-3 shrink-0" />
                        Bug Sheet
                      </a>
                    )}
                  </div>

                  {/* View button */}
                  <div className="px-4 pb-4">
                    <Button
                      size="sm"
                      className="w-full gap-1.5 shadow-sm"
                      onClick={() => setViewingMilestone({ ...m, index: idx + 1 })}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Details
                    </Button>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <MilestoneFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        projectId={project.id}
        editData={editingMilestone}
        onCreated={handleMilestoneCreated}
        onUpdated={handleMilestoneUpdated}
      />

      {/* Milestone view dialog */}
      <Dialog open={!!viewingMilestone} onOpenChange={(open) => !open && setViewingMilestone(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-0">

          {/* Dialog header area */}
          <div className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-sm">
                  {String(viewingMilestone?.index ?? '').padStart(2, '0')}
                </span>
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Milestone</p>
                <DialogHeader>
                  <DialogTitle className="text-xl leading-tight text-left">
                    {viewingMilestone?.milestoneName}
                  </DialogTitle>
                </DialogHeader>
              </div>
            </div>

            {/* Stat chips */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <div className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="font-semibold text-foreground">{viewingMilestone?.estimatedHours}</span>
                <span className="text-muted-foreground">estimated hrs</span>
              </div>
              {viewingMilestone?.bugSheet && (
                <a
                  href={viewingMilestone.bugSheet}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  <Bug className="h-3.5 w-3.5 shrink-0" />
                  Bug Sheet
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                </a>
              )}
            </div>
          </div>

          {/* Description body */}
          <div className="px-6 py-5">
            {viewingMilestone?.milestoneDescription ? (
              <>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-3">
                  Description
                </p>
                <div
                  className="text-sm text-foreground leading-relaxed
                             [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-3
                             [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:mb-3
                             [&_p]:mb-2 [&_p:last-child]:mb-0
                             [&_strong]:font-semibold [&_em]:italic
                             [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2
                             [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2
                             [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                  dangerouslySetInnerHTML={{ __html: viewingMilestone.milestoneDescription }}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/50">
                <FileText className="h-8 w-8 mb-2" />
                <p className="text-sm italic">No description provided</p>
              </div>
            )}
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
}
