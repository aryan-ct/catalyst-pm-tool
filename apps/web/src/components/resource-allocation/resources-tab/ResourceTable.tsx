import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useResourceAllocation } from '../ResourceAllocationContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
        <div className="grid grid-cols-12 bg-muted/30 p-3 font-bold text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
          <div className="col-span-3">Date</div>
          <div className="col-span-4">Projects</div>
          <div className="col-span-5">Activity</div>
        </div>

        {data.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-sm italic">
            No allocation history found for this resource.
          </div>
        ) : (
          paginated.map((row, i) => (
            <div
              key={i}
              className={`border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors`}
            >
              {row.projects.map((p, index) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 gap-4 p-4 items-start"
                >
                  <div className="col-span-3">
                    {index === 0 ? (
                      <div className="flex items-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                         <span className="font-semibold text-xs text-foreground">{row.date}</span>
                      </div>
                    ) : ''}
                  </div>

                  <div className="col-span-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {p.name}
                    </span>
                  </div>

                  <div className="col-span-5 text-sm text-muted-foreground break-words whitespace-pre-wrap">
                    {p.description || <span className="opacity-30">—</span>}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center px-2">
          <div className="text-xs text-muted-foreground font-medium">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, data.length)} of {data.length} entries
          </div>
          <div className="flex gap-2 items-center">
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
