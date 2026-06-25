import React, { useEffect, useState } from 'react';
import { ASSET_API, Asset } from '@/api/asset-tracking.api';
import { Loader2 } from 'lucide-react';

export default function AssetAllocationTab({ asset }: { asset: Asset }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await ASSET_API.getHistory(asset.id);
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [asset.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-3">
        <div className="text-muted-foreground">No allocation history available for this asset.</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden max-w-4xl shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 border-b border-border">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Allocated To
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Allocated Date
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Return Date
            </th>
          </tr>
        </thead>
        <tbody>
          {history.map((record) => (
            <tr
              key={record.id}
              className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-foreground">
                {record.allocatedToName || 'Unknown User'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(record.allocatedAt).toLocaleDateString('en-IN')}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {record.returnedAt ? (
                  new Date(record.returnedAt).toLocaleDateString('en-IN')
                ) : (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                    Current
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
