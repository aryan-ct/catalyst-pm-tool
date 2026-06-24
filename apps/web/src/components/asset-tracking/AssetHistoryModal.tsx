import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ASSET_API } from '@/api/asset-tracking.api';
import { Loader2 } from 'lucide-react';

interface AssetHistoryModalProps {
  assetId: string;
  assetName: string;
  onClose: () => void;
}

export default function AssetHistoryModal({
  assetId,
  assetName,
  onClose,
}: AssetHistoryModalProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await ASSET_API.getHistory(assetId);
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [assetId]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] min-w-[600px] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Allocation History: {assetName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No allocation history available for this asset.
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
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
        )}
      </DialogContent>
    </Dialog>
  );
}
