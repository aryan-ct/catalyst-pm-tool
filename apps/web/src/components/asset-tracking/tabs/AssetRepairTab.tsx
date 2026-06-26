import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ASSET_API, AssetRepair, RepairStatus, Asset } from '@/api/asset-tracking.api';
import { Loader2, Plus, ArrowLeft } from 'lucide-react';

interface AssetRepairTabProps {
  asset: Asset;
  onRefresh?: () => void;
}

export default function AssetRepairTab({ asset, onRefresh }: AssetRepairTabProps) {
  const [repairs, setRepairs] = useState<AssetRepair[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  const [submitting, setSubmitting] = useState(false);
  const [editingRepair, setEditingRepair] = useState<AssetRepair | null>(null);
  const [formData, setFormData] = useState({
    issueDescription: '',
    sentForRepairAt: '',
    expectedReturnAt: '',
    repairedAt: '',
    repairCost: '',
    vendorName: '',
    status: 'PENDING' as RepairStatus,
    comments: '',
  });

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const data = await ASSET_API.getRepairs(asset.id);
      setRepairs(data);
    } catch (error) {
      console.error('Failed to fetch repairs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, [asset.id]);

  const handleOpenForm = (repair?: AssetRepair) => {
    if (repair) {
      setEditingRepair(repair);
      setFormData({
        issueDescription: repair.issueDescription,
        sentForRepairAt: repair.sentForRepairAt ? new Date(repair.sentForRepairAt).toISOString().split('T')[0] : '',
        expectedReturnAt: repair.expectedReturnAt ? new Date(repair.expectedReturnAt).toISOString().split('T')[0] : '',
        repairedAt: repair.repairedAt ? new Date(repair.repairedAt).toISOString().split('T')[0] : '',
        repairCost: repair.repairCost?.toString() || '',
        vendorName: repair.vendorName || '',
        status: repair.status,
        comments: repair.comments || '',
      });
    } else {
      setEditingRepair(null);
      setFormData({
        issueDescription: '',
        sentForRepairAt: '',
        expectedReturnAt: '',
        repairedAt: '',
        repairCost: '',
        vendorName: '',
        status: 'PENDING',
        comments: '',
      });
    }
    setViewMode('FORM');
  };

  const handleCloseForm = () => {
    setViewMode('LIST');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.issueDescription.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        sentForRepairAt: formData.sentForRepairAt || undefined,
        expectedReturnAt: formData.expectedReturnAt || undefined,
        repairedAt: formData.repairedAt || undefined,
        repairCost: formData.repairCost ? Number(formData.repairCost) : undefined,
      };

      if (editingRepair) {
        await ASSET_API.updateRepair(editingRepair.id, payload);
      } else {
        await ASSET_API.createRepair(asset.id, payload);
      }
      
      await fetchRepairs();
      onRefresh?.();
      handleCloseForm();
    } catch (error) {
      console.error('Failed to save repair record', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-50 text-yellow-700',
      IN_PROGRESS: 'bg-blue-50 text-blue-700',
      COMPLETED: 'bg-emerald-50 text-emerald-700',
      CANCELLED: 'bg-muted text-muted-foreground',
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] || colors.PENDING}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {viewMode === 'FORM' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={handleCloseForm}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {viewMode === 'FORM' ? (editingRepair ? 'Edit Repair Ticket' : 'Log New Repair') : 'Repair History'}
        </h3>
        
        {viewMode === 'LIST' && (
          <Button onClick={() => handleOpenForm()} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Log Repair
          </Button>
        )}
      </div>

      {viewMode === 'LIST' ? (
        loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : repairs.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-3">
            <div className="text-muted-foreground">No repair history found for this asset.</div>
            <Button onClick={() => handleOpenForm()} variant="outline" size="sm">Log the first repair</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {repairs.map((repair) => (
              <div key={repair.id} className="p-4 rounded-lg border border-border bg-white shadow-sm hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      {repair.issueDescription}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      Reported: {new Date(repair.reportedAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(repair.status)}
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => handleOpenForm(repair)}>
                      Edit / Update
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border/50 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">Vendor</div>
                    <div className="font-medium">{repair.vendorName || '—'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">Sent Date</div>
                    <div className="font-medium">{repair.sentForRepairAt ? new Date(repair.sentForRepairAt).toLocaleDateString('en-IN') : '—'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">Repaired Date</div>
                    <div className="font-medium">{repair.repairedAt ? new Date(repair.repairedAt).toLocaleDateString('en-IN') : '—'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">Cost</div>
                    <div className="font-medium text-emerald-600">{repair.repairCost ? `₹${Number(repair.repairCost).toLocaleString('en-IN')}` : '—'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
          <div className="space-y-2">
            <label className="text-sm font-medium">Issue Description <span className="text-red-500">*</span></label>
            <Input 
              value={formData.issueDescription} 
              onChange={(e) => setFormData({...formData, issueDescription: e.target.value})}
              placeholder="What is wrong with the asset?"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={formData.status} onValueChange={(val: RepairStatus) => setFormData({...formData, status: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {formData.status === 'IN_PROGRESS' && !editingRepair && (
                <p className="text-xs text-blue-600 mt-1">This will change the asset's overall status to "In Repair".</p>
              )}
              {formData.status === 'COMPLETED' && (
                <p className="text-xs text-emerald-600 mt-1">This will mark the asset back as "Available".</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor Name</label>
              <Input 
                value={formData.vendorName} 
                onChange={(e) => setFormData({...formData, vendorName: e.target.value})}
                placeholder="Service center name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sent For Repair Date</label>
              <Input 
                type="date"
                value={formData.sentForRepairAt} 
                onChange={(e) => setFormData({...formData, sentForRepairAt: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Expected Return Date</label>
              <Input 
                type="date"
                value={formData.expectedReturnAt} 
                onChange={(e) => setFormData({...formData, expectedReturnAt: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Repaired/Received Date</label>
              <Input 
                type="date"
                value={formData.repairedAt} 
                onChange={(e) => setFormData({...formData, repairedAt: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Repair Cost (₹)</label>
              <Input 
                type="number"
                min="0"
                value={formData.repairCost} 
                onChange={(e) => setFormData({...formData, repairCost: e.target.value})}
                placeholder="Total cost"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Comments</label>
            <Textarea 
              value={formData.comments} 
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
              placeholder="Any other details..."
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={handleCloseForm} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingRepair ? 'Update Repair' : 'Log Repair'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
