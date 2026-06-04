import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useResourceAllocation } from '../ResourceAllocationContext';
import { ChevronLeft, ChevronRight, CalendarDays, FolderKanban, FileText, ClipboardX, StickyNote } from 'lucide-react';

const PAGE_SIZE = 5;

const ResourceTable = ({ resourceId }: { resourceId: string }) => {
  const { allocations } = useResourceAllocation();
  const data = allocations.filter((a) => a.resourceId === resourceId);

  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));

  const paginated = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 bg-muted/40 px-4 py-3 border-b border-border">
          <div className="col-span-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Date
          </div>
          <div className="col-span-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <FolderKanban className="h-3.5 w-3.5" />
            Project
          </div>
          <div className="col-span-6 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Assigned Tasks
          </div>
        </div>

        {data.length === 0 ? (
          <div className="py-16 text-center">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mx-auto mb-3">
              <ClipboardX className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">No allocation history</p>
            <p className="text-xs text-muted-foreground">This resource hasn't been allocated to any projects yet.</p>
          </div>
        ) : (
          paginated.map((row, i) => (
            <div
              key={i}
              className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
            >
              {row.projects.map((p: any, index: number) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 gap-4 px-4 py-3.5 items-start"
                >
                  {/* Date cell */}
                  <div className="col-span-3">
                    {index === 0 ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-foreground leading-tight">
                          {formatTableDate(row.date)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {getDayOfWeek(row.date)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Project or note badge */}
                  <div className="col-span-3">
                    {p.id.startsWith('note-') || p.name === 'Misc task' || p.name === 'Generate Leads' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 max-w-full truncate">
                        <StickyNote className="h-3 w-3 shrink-0" />
                        {p.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/15 max-w-full truncate">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {p.name}
                      </span>
                    )}
                  </div>

                  {/* Activity */}
                  <div className="col-span-6 flex flex-col gap-2">
                    {p.tasks && p.tasks.length > 0 ? (
                      p.tasks.map((t: any, tIdx: number) => (
                        <div key={tIdx} className="flex flex-col bg-muted/40 px-3 py-2.5 rounded-lg border border-border/40 hover:border-primary/20 transition-colors">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-foreground">
                                {t.taskTitle || t.description || 'Custom Task'}
                              </span>
                              {t.taskDescription && (
                                <div
                                  className="text-xs text-muted-foreground leading-snug [&_p]:m-0 [&_ul]:my-0.5 [&_ul]:pl-3 [&_ol]:my-0.5 [&_ol]:pl-3 [&_li]:my-0 [&_strong]:font-semibold [&_em]:italic"
                                  dangerouslySetInnerHTML={{ __html: t.taskDescription }}
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0 bg-background rounded-md px-2 py-1 border border-border/50">
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground">ETA</span>
                                <span className="text-xs font-semibold">{t.estimatedHours || 0}h</span>
                              </div>
                              <div className="w-px h-6 bg-border mx-1" />
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] uppercase font-bold text-primary">Actual</span>
                                <span className="text-xs font-bold text-primary">{t.actualHours || 0}h</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="opacity-30 select-none text-sm">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center px-1">
          <div className="text-xs text-muted-foreground font-medium">
            Showing{' '}
            <span className="text-foreground font-semibold">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.length)}
            </span>{' '}
            of <span className="text-foreground font-semibold">{data.length}</span> entries
          </div>

          <div className="flex gap-1.5 items-center">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 rounded-md text-xs font-bold transition-all ${
                    page === p
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceTable;

function formatTableDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getDayOfWeek(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
}
