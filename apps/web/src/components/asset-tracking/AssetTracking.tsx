import { useEffect, useState } from 'react';
import { ASSET_API, Asset, AssetStatus } from '@/api/asset-tracking.api';
import AssetModal from './AssetModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Pencil, Search, Trash2 } from 'lucide-react';

type MainTab = AssetStatus | 'ALL';

const STATUS_TABS: { label: string; value: MainTab }[] = [
  { label: 'All',       value: 'ALL'       },
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Allocated', value: 'ALLOCATED' },
  { label: 'In Repair', value: 'IN_REPAIR' },
  { label: 'Retired',   value: 'RETIRED'   },
];

const STATUS_BADGE: Record<AssetStatus, string> = {
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

export default function AssetTracking() {
  const [assets, setAssets]       = useState<Asset[]>([]);
  const [activeTab, setActiveTab] = useState<MainTab>('ALL');
  const [search, setSearch]       = useState('');
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId]     = useState<string | null>(null);

  const fetchAssets = async () => {
    try { setAssets(await ASSET_API.getAll()); } catch { /* ignore */ }
  };

  useEffect(() => { fetchAssets(); }, []);

  const filtered = assets.filter((a) => {
    const matchesTab = activeTab === 'ALL' || a.status === activeTab;
    const q = search.toLowerCase();
    return matchesTab && (!q
      || a.name.toLowerCase().includes(q)
      || a.productName.toLowerCase().includes(q)
      || (a.serialNumber ?? '').toLowerCase().includes(q)
      || (a.allocatedToName ?? '').toLowerCase().includes(q));
  });

  const tabCounts = STATUS_TABS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab.value] = tab.value === 'ALL'
      ? assets.length
      : assets.filter((a) => a.status === tab.value).length;
    return acc;
  }, {});

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this asset record? This cannot be undone.')) return;
    setDeletingId(id);
    try { await ASSET_API.remove(id); setAssets((p) => p.filter((a) => a.id !== id)); }
    catch { /* ignore */ } finally { setDeletingId(null); }
  };

  const togglePin = (id: string) =>
    setRevealedPins((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {tabCounts[tab.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search by name, product, serial…" value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-8 bg-white" />
        </div>
        <AssetModal onRefresh={fetchAssets} />
      </div>

      {/* Asset table */}
      <div className="rounded-lg border border-border overflow-x-auto bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              {['Record Name','Product','Product Name','Serial No.','Status','Condition',
                'Allocated To','Date of Allocation','Asset Price','PIN/Password','Actions'
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-12 text-muted-foreground">No assets found.</td></tr>
            ) : filtered.map((asset) => (
              <tr key={asset.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{asset.name}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{asset.product}</td>
                <td className="px-4 py-3 whitespace-nowrap">{asset.productName}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{asset.serialNumber ?? '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[asset.status]}`}>
                    {asset.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${CONDITION_BADGE[asset.workingCondition]}`}>
                    {asset.workingCondition}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{asset.allocatedToName ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {asset.dateOfAllocation ? new Date(asset.dateOfAllocation).toLocaleDateString('en-IN') : '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {asset.assetPrice != null ? `₹${Number(asset.assetPrice).toLocaleString('en-IN')}` : '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {asset.laptopPinPassword ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">
                        {revealedPins[asset.id] ? asset.laptopPinPassword : '••••••'}
                      </span>
                      <button onClick={() => togglePin(asset.id)} className="text-muted-foreground hover:text-foreground">
                        {revealedPins[asset.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ) : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => setEditAsset(asset)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(asset.id)} disabled={deletingId === asset.id}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editAsset && (
        <AssetModal editData={editAsset} onClose={() => setEditAsset(null)} onRefresh={fetchAssets} />
      )}
    </div>
  );
}
