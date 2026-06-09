import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  ArrowRight,
  FilePen,
  Send,
  X,
  PackageCheck,
  Tag,
  Hash,
  Cpu,
  Paperclip,
  Wrench,
  MessageSquare,
  Info,
} from 'lucide-react';
import { Asset } from '@/api/asset-tracking.api';
import { ChangeEntry, ASSET_REQUEST_API } from '@/api/asset-update-request.api';

type Props = {
  asset: Asset;
  onSuccess: () => void;
};

const REQUESTABLE_FIELDS: {
  key: keyof Asset;
  label: string;
  icon: React.ReactNode;
  type?: 'select';
  options?: string[];
  placeholder?: string;
}[] = [
  { key: 'productName',          label: 'Product Name',          icon: <Tag className="h-3.5 w-3.5" />,       placeholder: 'e.g. Dell XPS 15' },
  { key: 'serialNumber',         label: 'Serial Number',          icon: <Hash className="h-3.5 w-3.5" />,      placeholder: 'e.g. SN-2024-001' },
  { key: 'productConfiguration', label: 'Product Configuration',  icon: <Cpu className="h-3.5 w-3.5" />,       placeholder: 'e.g. i7, 16GB RAM, 512GB SSD' },
  { key: 'otherAccessories',     label: 'Other Accessories',      icon: <Paperclip className="h-3.5 w-3.5" />, placeholder: 'e.g. Charger, Bag' },
  { key: 'workingCondition',     label: 'Working Condition',      icon: <Wrench className="h-3.5 w-3.5" />,    type: 'select', options: ['GOOD', 'FAIR', 'POOR', 'DAMAGED'] },
  { key: 'comments',             label: 'Comments',               icon: <MessageSquare className="h-3.5 w-3.5" />, placeholder: 'Any notes…' },
];

const CONDITION_COLOR: Record<string, string> = {
  GOOD:    'text-emerald-600',
  FAIR:    'text-yellow-600',
  POOR:    'text-orange-600',
  DAMAGED: 'text-red-600',
};

export default function RequestUpdateModal({ asset, onSuccess }: Props) {
  const [open, setOpen]           = useState(false);
  const [edits, setEdits]         = useState<Record<string, string>>({});
  const [error, setError]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setEdits({});
    setError('');
  };

  const changedFields = REQUESTABLE_FIELDS.filter(
    (f) => edits[f.key] !== undefined && edits[f.key] !== String(asset[f.key] ?? ''),
  );

  const handleSubmit = async () => {
    if (changedFields.length === 0) {
      setError('Please change at least one field before submitting.');
      return;
    }
    const requestedChanges: Record<string, ChangeEntry> = {};
    for (const f of changedFields) {
      requestedChanges[f.key] = { from: String(asset[f.key] ?? ''), to: edits[f.key] };
    }
    setSubmitting(true);
    try {
      await ASSET_REQUEST_API.create({ assetId: asset.id, requestedChanges });
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger>
        <Button variant="outline" size="sm" className="gap-1.5">
          <FilePen className="h-4 w-4" /> Request Update
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="!top-0 !left-0 !right-0 !bottom-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !rounded-none !p-0 !flex !flex-col overflow-hidden"
      >
        <div className="flex flex-col flex-1 min-h-0 bg-muted/30">

          {/* ── Sticky header ── */}
          <div className="sticky top-0 z-10 bg-white border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <FilePen className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground leading-tight">Request Asset Update</h2>
                <p className="text-xs text-muted-foreground truncate max-w-[300px]">{asset.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {error && <p className="text-sm text-red-500 mr-2">{error}</p>}
              <Button variant="outline" size="sm" onClick={handleClose} className="gap-1.5">
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={submitting} className="gap-1.5">
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting…' : `Submit Request${changedFields.length > 0 ? ` (${changedFields.length})` : ''}`}
              </Button>
            </div>
          </div>

          {/* ── Scrollable content ── */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
            <div className="max-w-4xl mx-auto space-y-5">

              {/* Info banner */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <p>Edit the fields you want to change. Only modified fields will be sent to HR for review. Fields not touched remain unchanged.</p>
              </div>

              {/* Fields grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {REQUESTABLE_FIELDS.map((f) => {
                  const currentVal = String(asset[f.key] ?? '');
                  const editedVal  = edits[f.key] ?? currentVal;
                  const isChanged  = editedVal !== currentVal;

                  return (
                    <div
                      key={f.key}
                      className={`bg-white rounded-xl border p-5 space-y-4 transition-all ${
                        isChanged ? 'border-amber-300 shadow-sm shadow-amber-100' : 'border-border'
                      }`}
                    >
                      {/* Field header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded flex items-center justify-center ${isChanged ? 'bg-amber-100 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                            {f.icon}
                          </div>
                          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {f.label}
                          </Label>
                        </div>
                        {isChanged && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                            MODIFIED
                          </span>
                        )}
                      </div>

                      {/* Current value */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">Current</p>
                        <div className="px-3 py-2 bg-muted/60 rounded-lg text-sm text-muted-foreground min-h-[36px] flex items-center">
                          {currentVal
                            ? <span className={f.key === 'workingCondition' ? CONDITION_COLOR[currentVal] : ''}>{currentVal}</span>
                            : <span className="italic opacity-50">empty</span>
                          }
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-border" />
                        <ArrowRight className={`h-4 w-4 shrink-0 ${isChanged ? 'text-amber-500' : 'text-muted-foreground/40'}`} />
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      {/* New value input */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">New Value</p>
                        {f.type === 'select' ? (
                          <Select
                            value={editedVal}
                            onValueChange={(v) => v && setEdits((e) => ({ ...e, [f.key]: v }))}
                          >
                            <SelectTrigger className={isChanged ? 'border-amber-300 focus:ring-amber-200' : ''}>
                              <span className={`flex flex-1 text-left text-sm truncate ${editedVal ? CONDITION_COLOR[editedVal] : ''}`}>
                                {editedVal || 'Select…'}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              {f.options!.map((o) => (
                                <SelectItem key={o} value={o}>
                                  <span className={CONDITION_COLOR[o]}>{o}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={editedVal}
                            onChange={(e) => setEdits((prev) => ({ ...prev, [f.key]: e.target.value }))}
                            placeholder={f.placeholder}
                            className={isChanged ? 'border-amber-300 focus-visible:ring-amber-200' : ''}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Changes summary */}
              {changedFields.length > 0 && (
                <div className="bg-white rounded-xl border border-blue-200 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-semibold text-blue-700">
                      Summary — {changedFields.length} field{changedFields.length > 1 ? 's' : ''} will be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    {changedFields.map((f) => (
                      <div key={f.key} className="flex items-center gap-3 text-xs bg-blue-50 rounded-lg px-3 py-2">
                        <span className="font-semibold text-blue-800 w-40 shrink-0">{f.label}</span>
                        <span className="text-muted-foreground line-through">{String(asset[f.key] ?? '') || 'empty'}</span>
                        <ArrowRight className="h-3 w-3 text-blue-400 shrink-0" />
                        <span className="font-semibold text-blue-800">{edits[f.key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
