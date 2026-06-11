import { useEffect, useState } from 'react';
import { ASSET_API, Asset, WorkingCondition } from '@/api/asset-tracking.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Eye,
  EyeOff,
  Package,
  X,
  Laptop,
  Hash,
  Cpu,
  Paperclip,
  CalendarDays,
  DollarSign,
  Wrench,
  MessageSquare,
  User,
  Tag,
} from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700',
  ALLOCATED: 'bg-blue-50 text-blue-700',
  IN_REPAIR: 'bg-amber-50 text-amber-700',
  RETIRED: 'bg-muted text-muted-foreground',
};

const CONDITION_BADGE: Record<string, string> = {
  GOOD: 'bg-emerald-50 text-emerald-700',
  FAIR: 'bg-yellow-50 text-yellow-700',
  POOR: 'bg-orange-50 text-orange-700',
  DAMAGED: 'bg-red-50 text-red-700',
};

const EMPTY_FORM = {
  name: '',
  product: '',
  productName: '',
  serialNumber: '',
  productConfiguration: '',
  laptopPin: '',
  laptopPassword: '',
  otherAccessories: '',
  comments: '',
  workingCondition: 'GOOD' as WorkingCondition,
};

// ── Asset detail modal ────────────────────────────────────────────────────────

function AssetDetailModal({
  asset,
  onClose,
}: {
  asset: Asset;
  onClose: () => void;
}) {
  const [showPin, setShowPin] = useState(false);

  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-[600px] min-w-[600px] max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-base leading-tight">
                {asset.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {asset.product} · {asset.productName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[asset.status]}`}
            >
              {asset.status.replace('_', ' ')}
            </span>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {/* Identity */}
          <Section title="Asset Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailRow
                icon={<Tag />}
                label="Record Name"
                value={asset.name}
              />
              <DetailRow
                icon={<Laptop />}
                label="Product"
                value={asset.product}
              />
              <DetailRow
                icon={<Tag />}
                label="Product Name"
                value={asset.productName}
              />
              <DetailRow
                icon={<Hash />}
                label="Serial Number"
                value={asset.serialNumber}
              />
              <DetailRow
                icon={<Wrench />}
                label="Condition"
                value={
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${CONDITION_BADGE[asset.workingCondition]}`}
                  >
                    {asset.workingCondition}
                  </span>
                }
              />
              <DetailRow
                icon={<Cpu />}
                label="Configuration"
                value={asset.productConfiguration}
              />
              <DetailRow
                icon={<Paperclip />}
                label="Accessories"
                value={asset.otherAccessories}
              />
            </div>
          </Section>

          {/* PIN / Password */}
          {(asset.laptopPin || asset.laptopPassword) && (
            <Section title="Security">
              <div className="space-y-2">
                {asset.laptopPin && (
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/40 rounded-lg">
                    <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">
                      PIN
                    </span>
                    <span className="font-mono text-sm flex-1">
                      {showPin ? asset.laptopPin : '••••••••'}
                    </span>
                    <button
                      onClick={() => setShowPin((s) => !s)}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      {showPin ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
                {asset.laptopPassword && (
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/40 rounded-lg">
                    <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">
                      Password
                    </span>
                    <span className="font-mono text-sm flex-1">
                      {showPin ? asset.laptopPassword : '••••••••'}
                    </span>
                    <button
                      onClick={() => setShowPin((s) => !s)}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      {showPin ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Allocation */}
          <Section title="Allocation">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailRow
                icon={<User />}
                label="Allocated To"
                value={asset.allocatedToName}
              />
              <DetailRow
                icon={<CalendarDays />}
                label="Date of Allocation"
                value={
                  asset.dateOfAllocation
                    ? new Date(asset.dateOfAllocation).toLocaleDateString(
                        'en-IN',
                        { day: 'numeric', month: 'short', year: 'numeric' },
                      )
                    : undefined
                }
              />
              <DetailRow
                icon={<User />}
                label="Previous User"
                value={asset.previousUser}
              />
              <DetailRow
                icon={<DollarSign />}
                label="Asset Price"
                value={
                  asset.assetPrice != null
                    ? `₹${Number(asset.assetPrice).toLocaleString('en-IN')}`
                    : undefined
                }
              />
              {asset.loans && (
                <DetailRow
                  icon={<DollarSign />}
                  label="Loans"
                  value={asset.loans}
                />
              )}
            </div>
          </Section>

          {/* Comments */}
          {asset.comments && (
            <Section title="Comments">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{asset.comments}</p>
              </div>
            </Section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="bg-muted/30 rounded-xl p-4 border border-border">
        {children}
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-muted-foreground mt-0.5 shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
          {label}
        </p>
        <div className="mt-0.5 text-sm text-foreground">
          {value ?? <span className="text-muted-foreground">—</span>}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MyAsset() {
  const [assets, setAssets] = useState<Asset[] | undefined>(undefined);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const fetchAssets = async () => {
    try {
      setAssets(await ASSET_API.getMyAsset());
    } catch {
      setAssets([]);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.product.trim()) e.product = 'Product type is required.';
    if (!form.productName.trim()) e.productName = 'Product name is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload: any = {
      name: form.name,
      product: form.product,
      productName: form.productName,
      workingCondition: form.workingCondition,
      ...(form.serialNumber && { serialNumber: form.serialNumber }),
      ...(form.productConfiguration && {
        productConfiguration: form.productConfiguration,
      }),
      ...(form.laptopPin && { laptopPin: form.laptopPin }),
      ...(form.laptopPassword && { laptopPassword: form.laptopPassword }),
      ...(form.otherAccessories && { otherAccessories: form.otherAccessories }),
      ...(form.comments && { comments: form.comments }),
    };
    try {
      await ASSET_API.create(payload);
      await fetchAssets();
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
    } catch (err: any) {
      setErrors({
        _global:
          err?.response?.data?.message || 'Failed to submit. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (assets === undefined) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        Loading assets…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">My Assets</h2>
          {assets.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              {assets.length}
            </span>
          )}
        </div>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            + Submit Asset
          </Button>
        )}
      </div>

      {/* Submit form */}
      {showForm && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-foreground mb-4">
              New Asset Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Record Name" required error={errors.name}>
                <Input
                  value={form.name}
                  placeholder="e.g. My Laptop"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </Field>
              <Field label="Product Type" required error={errors.product}>
                <Input
                  value={form.product}
                  placeholder="e.g. Laptop, Mouse"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, product: e.target.value }))
                  }
                />
              </Field>
              <Field
                label="Product Name / Brand"
                required
                error={errors.productName}
              >
                <Input
                  value={form.productName}
                  placeholder="e.g. Dell XPS 15"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, productName: e.target.value }))
                  }
                />
              </Field>
              <Field label="Serial Number">
                <Input
                  value={form.serialNumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, serialNumber: e.target.value }))
                  }
                />
              </Field>
              <Field label="Product Configuration">
                <Input
                  value={form.productConfiguration}
                  placeholder="e.g. i7, 16GB RAM, 512GB SSD"
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      productConfiguration: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Laptop PIN">
                <div className="relative">
                  <Input
                    type={showPin ? 'text' : 'password'}
                    value={form.laptopPin}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, laptopPin: e.target.value }))
                    }
                    className="pr-10"
                    placeholder="e.g. 1234"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>
              <Field label="Laptop Password">
                <div className="relative">
                  <Input
                    type={showPin ? 'text' : 'password'}
                    value={form.laptopPassword}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, laptopPassword: e.target.value }))
                    }
                    className="pr-10"
                    placeholder="Login password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>
              <Field label="Working Condition">
                <Select
                  value={form.workingCondition}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      workingCondition: v as WorkingCondition,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOOD">Good</SelectItem>
                    <SelectItem value="FAIR">Fair</SelectItem>
                    <SelectItem value="POOR">Poor</SelectItem>
                    <SelectItem value="DAMAGED">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Other Accessories">
                <Input
                  value={form.otherAccessories}
                  placeholder="e.g. Charger, Bag"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, otherAccessories: e.target.value }))
                  }
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Comments">
                  <Textarea
                    value={form.comments}
                    rows={2}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, comments: e.target.value }))
                    }
                  />
                </Field>
              </div>
            </div>
            {errors._global && (
              <p className="text-sm text-red-500 mt-3">{errors._global}</p>
            )}
            <div className="flex gap-3 pt-4 justify-end ">
              <Button
                variant="outline"
                className="flex-1 max-w-[160px]"
                onClick={() => {
                  setShowForm(false);
                  setErrors({});
                  setForm({ ...EMPTY_FORM });
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 max-w-[160px]"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Submitting…' : 'Submit Asset'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Asset cards */}
      {assets.length === 0 && !showForm ? (
        <Card className="border-dashed border-border">
          <CardContent className="p-10 flex flex-col items-center gap-4 text-center">
            <Package className="h-10 w-10 text-muted-foreground/40" />
            <div>
              <p className="font-medium text-foreground">No assets assigned</p>
              <p className="text-sm text-muted-foreground mt-1">
                Assets assigned to you by HR will appear here.
              </p>
            </div>
            <Button onClick={() => setShowForm(true)}>Submit My Asset</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onView={() => setViewingAsset(asset)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {viewingAsset && (
        <AssetDetailModal
          asset={viewingAsset}
          onClose={() => setViewingAsset(null)}
        />
      )}
    </div>
  );
}

// ── Asset card ────────────────────────────────────────────────────────────────

function AssetCard({ asset, onView }: { asset: Asset; onView: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow">
      {/* Card header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">
              {asset.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {asset.product}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${STATUS_BADGE[asset.status]}`}
        >
          {asset.status.replace('_', ' ')}
        </span>
      </div>

      {/* Key details */}
      <div className="space-y-2 text-xs">
        <CardDetail label="Product Name" value={asset.productName} />
        <CardDetail label="Serial No." value={asset.serialNumber} />
        {asset.dateOfAllocation && (
          <CardDetail
            label="Allocated On"
            value={new Date(asset.dateOfAllocation).toLocaleDateString(
              'en-IN',
              { day: 'numeric', month: 'short', year: 'numeric' },
            )}
          />
        )}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Condition</span>
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${CONDITION_BADGE[asset.workingCondition]}`}
          >
            {asset.workingCondition}
          </span>
        </div>
      </div>

      {/* View button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-auto gap-1.5"
        onClick={onView}
      >
        <Eye className="h-3.5 w-3.5" /> View Details
      </Button>
    </div>
  );
}

function CardDetail({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground font-medium shrink-0">
        {label}
      </span>
      <span className="text-foreground truncate text-right">
        {value ?? '—'}
      </span>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  required,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
