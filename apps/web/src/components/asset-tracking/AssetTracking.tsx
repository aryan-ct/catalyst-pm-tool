import { useEffect, useState } from 'react';
import { ASSET_API, Asset, AssetStatus } from '@/api/asset-tracking.api';
import { ASSET_REQUEST_API, AssetUpdateRequest } from '@/api/asset-update-request.api';
import AssetModal from './AssetModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Eye, EyeOff, Pencil, Search, Trash2,
  CheckCircle2, XCircle, ArrowRight, Clock, FilePen,
} from 'lucide-react';

type MainTab = AssetStatus | 'ALL' | 'REQUESTS';

const STATUS_TABS: { label: string; value: MainTab }[] = [
  { label: 'All',       value: 'ALL'       },
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Allocated', value: 'ALLOCATED' },
  { label: 'In Repair', value: 'IN_REPAIR' },
  { label: 'Retired',   value: 'RETIRED'   },
  { label: 'Update Requests', value: 'REQUESTS' },
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

const REQUEST_STATUS_BADGE: Record<string, string> = {
  PENDING:  'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

export default function AssetTracking() {
  const [assets, setAssets]           = useState<Asset[]>([]);
  const [requests, setRequests]       = useState<AssetUpdateRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTab, setActiveTab]     = useState<MainTab>('ALL');
  const [search, setSearch]           = useState('');
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [editAsset, setEditAsset]     = useState<Asset | null>(null);
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAssets = async () => {
    try { setAssets(await ASSET_API.getAll()); } catch { /* ignore */ }
  };

  const fetchRequests = async () => {
    try {
      const [all, count] = await Promise.all([
        ASSET_REQUEST_API.getAll(),
        ASSET_REQUEST_API.getPendingCount(),
      ]);
      setRequests(all);
      setPendingCount(count);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchAssets();
    fetchRequests();
  }, []);

  /* ── Asset table helpers ── */
  const filtered = assets.filter((a) => {
    const matchesTab = activeTab === 'ALL' || activeTab === 'REQUESTS' || a.status === activeTab;
    const q = search.toLowerCase();
    return matchesTab && (!q
      || a.name.toLowerCase().includes(q)
      || a.productName.toLowerCase().includes(q)
      || (a.serialNumber ?? '').toLowerCase().includes(q)
      || (a.allocatedToName ?? '').toLowerCase().includes(q));
  });

  const tabCounts = STATUS_TABS.reduce<Record<string, number>>((acc, tab) => {
    if (tab.value === 'ALL')      acc[tab.value] = assets.length;
    else if (tab.value === 'REQUESTS') acc[tab.value] = pendingCount;
    else acc[tab.value] = assets.filter((a) => a.status === tab.value).length;
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

  /* ── Request actions ── */
  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await ASSET_REQUEST_API.approve(id);
      await Promise.all([fetchRequests(), fetchAssets()]);
    } catch { /* ignore */ } finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await ASSET_REQUEST_API.reject(id, rejectComment || undefined);
      setRejectingId(null);
      setRejectComment('');
      await fetchRequests();
    } catch { /* ignore */ } finally { setActionLoading(null); }
  };

  const filteredRequests = requests.filter(
    (r) => requestFilter === 'ALL' || r.status === requestFilter,
  );

  return (
    <div className="space-y-6">
      {/* Top tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          const count    = tabCounts[tab.value] ?? 0;
          const isReqTab = tab.value === 'REQUESTS';
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
              {isReqTab && <FilePen className="h-3.5 w-3.5" />}
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                isActive
                  ? isReqTab && count > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-primary/10 text-primary'
                  : isReqTab && count > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Update Requests Panel ── */}
      {activeTab === 'REQUESTS' ? (
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="flex gap-2 flex-wrap">
            {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setRequestFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  requestFilter === f
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-white text-muted-foreground border-border hover:border-primary/40'
                }`}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                <span className="ml-1.5">
                  {f === 'ALL' ? requests.length : requests.filter((r) => r.status === f).length}
                </span>
              </button>
            ))}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <FilePen className="h-8 w-8 opacity-30" />
              <p className="text-sm">No {requestFilter !== 'ALL' ? requestFilter.toLowerCase() : ''} requests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className={`rounded-xl border bg-white p-5 space-y-4 ${
                    req.status === 'PENDING' ? 'border-amber-200' : 'border-border'
                  }`}
                >
                  {/* Request header */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {req.requestedByName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{req.requestedByName}</p>
                        <p className="text-xs text-muted-foreground">{req.assetName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                      <span className="text-xs text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${REQUEST_STATUS_BADGE[req.status]}`}>
                        {req.status === 'PENDING'  && <Clock className="h-3 w-3" />}
                        {req.status === 'APPROVED' && <CheckCircle2 className="h-3 w-3" />}
                        {req.status === 'REJECTED' && <XCircle className="h-3 w-3" />}
                        {req.status.charAt(0) + req.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>

                  {/* Reason */}
                  {req.reason && (
                    <p className="text-xs text-muted-foreground italic bg-muted/40 rounded px-3 py-2">
                      "{req.reason}"
                    </p>
                  )}

                  {/* Diff table */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/40 border-b border-border">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-muted-foreground w-1/4">Field</th>
                          <th className="px-4 py-2 text-left font-semibold text-muted-foreground w-[37%]">Current Value</th>
                          <th className="px-4 py-2 text-left font-semibold text-muted-foreground w-[37%]">Requested Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(req.requestedChanges).map(([field, entry]) => (
                          <tr key={field} className="border-t border-border">
                            <td className="px-4 py-2.5 font-medium text-foreground capitalize">
                              {field.replace(/([A-Z])/g, ' $1').trim()}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {(entry as any).from || <span className="italic opacity-50">empty</span>}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-3 w-3 text-amber-500 shrink-0" />
                                <span className={`font-semibold ${req.status === 'PENDING' ? 'text-amber-700' : 'text-foreground'}`}>
                                  {(entry as any).to}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* HR comment (reviewed) */}
                  {req.hrComment && (
                    <div className={`rounded-lg px-3 py-2 text-xs flex items-start gap-2 ${
                      req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {req.status === 'APPROVED'
                        ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        : <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                      <span><span className="font-semibold">HR note:</span> {req.hrComment}</span>
                    </div>
                  )}

                  {/* Reject comment input */}
                  {rejectingId === req.id && (
                    <div className="space-y-2">
                      <Textarea
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        placeholder="Reason for rejection (optional)…"
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  )}

                  {/* Actions (pending only) */}
                  {req.status === 'PENDING' && (
                    <div className="flex items-center gap-2 justify-end pt-1">
                      {rejectingId === req.id ? (
                        <>
                          <Button variant="outline" size="sm"
                            onClick={() => { setRejectingId(null); setRejectComment(''); }}>
                            Cancel
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-1.5"
                            onClick={() => handleReject(req.id)}
                            disabled={actionLoading === req.id}>
                            <XCircle className="h-4 w-4" />
                            {actionLoading === req.id ? 'Rejecting…' : 'Confirm Reject'}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline"
                            className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => setRejectingId(req.id)}>
                            <XCircle className="h-4 w-4" /> Reject
                          </Button>
                          <Button size="sm"
                            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleApprove(req.id)}
                            disabled={actionLoading === req.id}>
                            <CheckCircle2 className="h-4 w-4" />
                            {actionLoading === req.id ? 'Approving…' : 'Approve'}
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
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
        </>
      )}

      {editAsset && (
        <AssetModal editData={editAsset} onClose={() => setEditAsset(null)} onRefresh={fetchAssets} />
      )}
    </div>
  );
}
