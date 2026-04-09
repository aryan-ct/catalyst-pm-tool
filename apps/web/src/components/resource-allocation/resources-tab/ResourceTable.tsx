import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useResourceAllocation } from '../ResourceAllocationContext';

const PAGE_SIZE = 5;

const ResourceTable = ({ resourceId }: { resourceId: string }) => {
  const { allocations } = useResourceAllocation();
  const data = allocations.filter((a) => a.resourceId === resourceId);

  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));

  const paginated = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="border rounded-xl p-4">
        <div className="grid grid-cols-3 font-semibold border-b pb-2">
          <span>Date</span>
          <span>Projects</span>
          <span>Description</span>
        </div>

        {data.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No data available
          </div>
        ) : (
          paginated.map((row, i) => (
            <div
              key={i}
              className={`py-3 ${i !== paginated.length - 1 ? 'border-b' : ''}`}
            >
              {row.projects.map((p, index) => (
                <div
                  key={p.id}
                  className="grid grid-cols-3 gap-4 mb-2 items-start"
                >
                  <div className="font-medium">
                    {index === 0 ? row.date : ''}
                  </div>

                  <div>{p.name}</div>

                  <div className="break-word whitespace-pre-wrap">
                    {p.description || '-'}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end gap-2 items-center">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </Button>

        <span className="px-2 py-1 text-sm">
          {page} / {totalPages}
        </span>

        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ResourceTable;
