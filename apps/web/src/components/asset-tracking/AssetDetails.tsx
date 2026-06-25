import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ASSET_API, Asset } from '@/api/asset-tracking.api';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  ArrowLeft,
  FileText,
  History,
  Wrench,
  Pencil,
} from 'lucide-react';
import AssetOverviewTab from './tabs/AssetOverviewTab';
import AssetAllocationTab from './tabs/AssetAllocationTab';
import AssetRepairTab from './tabs/AssetRepairTab';
import AssetModal from './AssetModal';

export default function AssetDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'ALLOCATION' | 'REPAIR'
  >('OVERVIEW');
  const [isEditing, setIsEditing] = useState(false);

  const fetchAsset = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await ASSET_API.getById(id);
      setAsset(data);
    } catch (error) {
      console.error('Failed to fetch asset details', error);
      navigate('/asset-tracking'); // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsset();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!asset) {
    return null;
  }

  const handleRefresh = () => {
    fetchAsset();
  };

  return (
    <div className="flex-1 flex flex-col px-8 bg-gray-50/50">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/asset-tracking')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {asset.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {asset.product} • {asset.productName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="default"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" /> Edit Asset
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors text-sm font-medium ${
              activeTab === 'OVERVIEW'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <FileText className="h-4 w-4" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('ALLOCATION')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors text-sm font-medium ${
              activeTab === 'ALLOCATION'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <History className="h-4 w-4" /> Allocation Logs
          </button>
          <button
            onClick={() => setActiveTab('REPAIR')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors text-sm font-medium ${
              activeTab === 'REPAIR'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <Wrench className="h-4 w-4" /> Repair Tracking
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-2">
          {activeTab === 'OVERVIEW' && <AssetOverviewTab asset={asset} />}
          {activeTab === 'ALLOCATION' && <AssetAllocationTab asset={asset} />}
          {activeTab === 'REPAIR' && (
            <AssetRepairTab asset={asset} onRefresh={handleRefresh} />
          )}
        </div>
      </div>

      {/* Edit Modal (Reused) */}
      {isEditing && (
        <AssetModal
          editData={asset}
          onClose={() => setIsEditing(false)}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
