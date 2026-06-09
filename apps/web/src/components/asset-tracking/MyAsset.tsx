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
import { Eye, EyeOff, Package } from 'lucide-react';

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
  laptopPinPassword: '',
  otherAccessories: '',
  comments: '',
  workingCondition: 'GOOD' as WorkingCondition,
};

export default function MyAsset() {
  const [asset, setAsset] = useState<Asset | null | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const fetchMyAsset = async () => {
    try {
      const data = await ASSET_API.getMyAsset();
      setAsset(data);
    } catch {
      setAsset(null);
    }
  };

  useEffect(() => {
    fetchMyAsset();
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
      ...(form.productConfiguration && { productConfiguration: form.productConfiguration }),
      ...(form.laptopPinPassword && { laptopPinPassword: form.laptopPinPassword }),
      ...(form.otherAccessories && { otherAccessories: form.otherAccessories }),
      ...(form.comments && { comments: form.comments }),
    };

    try {
      await ASSET_API.create(payload);
      await fetchMyAsset();
      setShowForm(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setErrors({ _global: msg || 'Failed to submit. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (asset === undefined) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        Loading asset information…
      </div>
    );
  }

  // Has an asset — read-only card
  if (asset) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">My Asset</h2>
          <span className={`ml-auto inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${CONDITION_BADGE[asset.workingCondition]}`}>
            {asset.workingCondition}
          </span>
        </div>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <InfoRow label="Record Name" value={asset.name} />
              <InfoRow label="Product Type" value={asset.product} />
              <InfoRow label="Product Name" value={asset.productName} />
              <InfoRow label="Serial Number" value={asset.serialNumber} />
              <InfoRow label="Status" value={asset.status.replace('_', ' ')} />
              <InfoRow label="Working Condition" value={asset.workingCondition} />
              <InfoRow label="Configuration" value={asset.productConfiguration} />
              <InfoRow label="Other Accessories" value={asset.otherAccessories} />
              <InfoRow label="Date of Allocation" value={
                asset.dateOfAllocation
                  ? new Date(asset.dateOfAllocation).toLocaleDateString('en-IN')
                  : undefined
              } />
              <InfoRow label="Previous User" value={asset.previousUser} />
              <InfoRow label="Loans" value={asset.loans} />
              <div className="sm:col-span-2">
                <InfoRow label="Comments" value={asset.comments} />
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Asset details are managed by HR. Contact HR to make any changes.
        </p>
      </div>
    );
  }

  // No asset — submit form or prompt
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">My Asset</h2>
      </div>

      {!showForm ? (
        <Card className="border-dashed border-border">
          <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
            <Package className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">No asset on record</p>
              <p className="text-sm text-muted-foreground mt-1">
                Submit your assigned asset details. You can only submit once.
              </p>
            </div>
            <Button onClick={() => setShowForm(true)}>Submit My Asset</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Record Name" required error={errors.name}>
                <Input
                  value={form.name}
                  placeholder="e.g. My Laptop"
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </Field>

              <Field label="Product Type" required error={errors.product}>
                <Input
                  value={form.product}
                  placeholder="e.g. Laptop, Mouse"
                  onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
                />
              </Field>

              <Field label="Product Name / Brand" required error={errors.productName}>
                <Input
                  value={form.productName}
                  placeholder="e.g. Dell XPS 15"
                  onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
                />
              </Field>

              <Field label="Serial Number">
                <Input
                  value={form.serialNumber}
                  onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
                />
              </Field>

              <Field label="Product Configuration">
                <Input
                  value={form.productConfiguration}
                  placeholder="e.g. i7, 16GB RAM, 512GB SSD"
                  onChange={(e) => setForm((f) => ({ ...f, productConfiguration: e.target.value }))}
                />
              </Field>

              <Field label="Laptop PIN / Password">
                <div className="relative">
                  <Input
                    type={showPin ? 'text' : 'password'}
                    value={form.laptopPinPassword}
                    onChange={(e) => setForm((f) => ({ ...f, laptopPinPassword: e.target.value }))}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <Field label="Working Condition">
                <Select
                  value={form.workingCondition}
                  onValueChange={(v) => setForm((f) => ({ ...f, workingCondition: v as WorkingCondition }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                  onChange={(e) => setForm((f) => ({ ...f, otherAccessories: e.target.value }))}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Comments">
                  <Textarea
                    value={form.comments}
                    rows={2}
                    onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
                  />
                </Field>
              </div>
            </div>

            {errors._global && (
              <p className="text-sm text-red-500 mt-3">{errors._global}</p>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setShowForm(false); setErrors({}); }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Submitting…' : 'Submit Asset'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-foreground">{value || '—'}</p>
    </div>
  );
}

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
