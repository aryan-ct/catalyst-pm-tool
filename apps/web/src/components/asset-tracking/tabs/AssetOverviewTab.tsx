import React from 'react';
import { Asset } from '@/api/asset-tracking.api';

export default function AssetOverviewTab({ asset }: { asset: Asset }) {
  const STATUS_BADGE: Record<string, string> = {
    AVAILABLE: 'bg-emerald-50 text-emerald-700',
    ALLOCATED: 'bg-blue-50 text-blue-700',
    IN_REPAIR: 'bg-amber-50 text-amber-700',
    RETIRED:   'bg-muted text-muted-foreground',
  };

  const CONDITION_BADGE: Record<string, string> = {
    GOOD:    'bg-emerald-50 text-emerald-700',
    FAIR:    'bg-yellow-50 text-yellow-700',
    POOR:    'bg-orange-50 text-orange-700',
    DAMAGED: 'bg-red-50 text-red-700',
  };

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="py-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value || '—'}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm p-6 max-w-4xl">
      <h3 className="text-lg font-semibold mb-6">Asset Specifications</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
        <div className="space-y-1">
          <InfoRow label="Name" value={asset.name} />
          <InfoRow label="Product Type" value={asset.product} />
          <InfoRow label="Product Name / Model" value={asset.productName} />
          <InfoRow label="Serial Number" value={asset.serialNumber} />
          <InfoRow 
            label="Current Status" 
            value={
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${STATUS_BADGE[asset.status]}`}>
                {asset.status.replace('_', ' ')}
              </span>
            } 
          />
          <InfoRow 
            label="Working Condition" 
            value={
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${CONDITION_BADGE[asset.workingCondition]}`}>
                {asset.workingCondition}
              </span>
            } 
          />
          <InfoRow label="Product Configuration" value={asset.productConfiguration} />
        </div>
        
        <div className="space-y-1">
          <InfoRow label="Allocated To" value={asset.allocatedToName} />
          <InfoRow label="Previous User" value={asset.previousUser} />
          <InfoRow label="Date of Allocation" value={asset.dateOfAllocation ? new Date(asset.dateOfAllocation).toLocaleDateString('en-IN') : null} />
          <InfoRow label="Asset Price" value={asset.assetPrice ? `₹${Number(asset.assetPrice).toLocaleString('en-IN')}` : null} />
          <InfoRow label="Laptop Pin" value={asset.laptopPin} />
          <InfoRow label="Laptop Password" value={asset.laptopPassword} />
          <InfoRow label="Loans / EMIs" value={asset.loans} />
        </div>
      </div>
      
      <div className="mt-8 space-y-1">
        <h4 className="text-sm font-semibold text-foreground mb-4">Additional Information</h4>
        <InfoRow label="Other Accessories" value={asset.otherAccessories} />
        <InfoRow label="Comments / Notes" value={asset.comments} />
      </div>
    </div>
  );
}
