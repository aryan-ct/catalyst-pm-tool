import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Eye,
  EyeOff,
  Plus,
  X,
  Save,
  Tag,
  Cpu,
  CircleDollarSign,
  Users,
  MessageSquare,
  ShieldCheck,
  Hash,
  Laptop,
  Wrench,
  CalendarDays,
  UserRound,
  Paperclip,
  Banknote,
  PackageCheck,
  Activity,
} from 'lucide-react';
import { ASSET_API, Asset, AssetStatus, WorkingCondition } from '@/api/asset-tracking.api';
import { RESOURCE_API } from '@/api/resource.api';

type Props = {
  editData?: Asset | null;
  onClose?: () => void;
  onRefresh: () => void;
};

const EMPTY_FORM = {
  name: '',
  product: '',
  productName: '',
  serialNumber: '',
  status: 'AVAILABLE' as AssetStatus,
  productConfiguration: '',
  laptopPin: '',
  laptopPassword: '',
  assetPrice: '',
  dateOfAllocation: '',
  loans: '',
  otherAccessories: '',
  comments: '',
  workingCondition: 'GOOD' as WorkingCondition,
  previousUser: '',
  allocatedTo: '',
  allocatedToName: '',
};

const STATUS_CONFIG: Record<AssetStatus, { label: string; color: string }> = {
  AVAILABLE:  { label: 'Available',  color: 'text-emerald-600' },
  ALLOCATED:  { label: 'Allocated',  color: 'text-blue-600'    },
  IN_REPAIR:  { label: 'In Repair',  color: 'text-amber-600'   },
  RETIRED:    { label: 'Retired',    color: 'text-muted-foreground' },
};

const CONDITION_CONFIG: Record<WorkingCondition, { label: string; color: string }> = {
  GOOD:    { label: 'Good',    color: 'text-emerald-600' },
  FAIR:    { label: 'Fair',    color: 'text-yellow-600'  },
  POOR:    { label: 'Poor',    color: 'text-orange-600'  },
  DAMAGED: { label: 'Damaged', color: 'text-red-600'     },
};

function Field({
  label,
  error,
  required,
  icon,
  children,
  className,
}: {
  label: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Section({
  title,
  icon,
  iconBg,
  children,
  className,
}: {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-border p-5 space-y-4 ${className ?? ''}`}>
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

export default function AssetModal({ editData, onClose, onRefresh }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPin, setShowPin] = useState(false);
  const [resources, setResources] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    RESOURCE_API.findAllResources().then((res) => {
      setResources(
        res
          .filter((r: any) => r.isActive)
          .map((r: any) => ({ id: r.id as string, name: r.name as string })),
      );
    });
  }, []);

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name ?? '',
        product: editData.product ?? '',
        productName: editData.productName ?? '',
        serialNumber: editData.serialNumber ?? '',
        status: editData.status ?? 'AVAILABLE',
        productConfiguration: editData.productConfiguration ?? '',
        laptopPin: editData.laptopPin ?? '',
        laptopPassword: editData.laptopPassword ?? '',
        assetPrice: editData.assetPrice != null ? String(editData.assetPrice) : '',
        dateOfAllocation: editData.dateOfAllocation
          ? editData.dateOfAllocation.split('T')[0]
          : '',
        loans: editData.loans ?? '',
        otherAccessories: editData.otherAccessories ?? '',
        comments: editData.comments ?? '',
        workingCondition: editData.workingCondition ?? 'GOOD',
        previousUser: editData.previousUser ?? '',
        allocatedTo: editData.allocatedTo ?? '',
        allocatedToName: editData.allocatedToName ?? '',
      });
      setOpen(true);
    }
  }, [editData]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.product.trim()) e.product = 'Product is required.';
    if (!form.productName.trim()) e.productName = 'Product name is required.';
    if (form.assetPrice && isNaN(Number(form.assetPrice)))
      e.assetPrice = 'Must be a number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleResourceChange = (resourceId: string) => {
    const resource = resources.find((r) => r.id === resourceId);
    setForm((f) => ({
      ...f,
      allocatedTo: resourceId,
      allocatedToName: resource?.name ?? '',
      status: resourceId ? 'ALLOCATED' : (f.status === 'ALLOCATED' ? 'AVAILABLE' : f.status),
    }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);

    const payload: any = {
      name: form.name,
      product: form.product,
      productName: form.productName,
      status: form.status,
      workingCondition: form.workingCondition,
      serialNumber: form.serialNumber || null,
      productConfiguration: form.productConfiguration || null,
      laptopPin: form.laptopPin || null,
      laptopPassword: form.laptopPassword || null,
      assetPrice: form.assetPrice ? Number(form.assetPrice) : null,
      dateOfAllocation: form.dateOfAllocation || null,
      loans: form.loans || null,
      otherAccessories: form.otherAccessories || null,
      comments: form.comments || null,
      previousUser: form.previousUser || null,
      allocatedTo: form.allocatedTo || null,
      allocatedToName: form.allocatedToName || null,
    };

    try {
      if (editData?.id) {
        await ASSET_API.update(editData.id, payload);
      } else {
        await ASSET_API.create(payload);
      }
      onRefresh();
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (msg) setErrors({ _global: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setShowPin(false);
    setOpen(false);
    onClose?.();
  };

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  /* ─── Full-screen edit layout ─── */
  const fullScreenContent = (
    <div className="flex flex-col flex-1 min-h-0 bg-muted/30">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <PackageCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground leading-tight">
              {editData ? 'Edit Asset' : 'Add Asset'}
            </h2>
            {form.name && (
              <p className="text-xs text-muted-foreground truncate max-w-[240px]">{form.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {errors._global && (
            <p className="text-sm text-red-500 mr-2">{errors._global}</p>
          )}
          <Button variant="outline" size="sm" onClick={handleClose} className="gap-1.5">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving} className="gap-1.5">
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : editData ? 'Save Changes' : 'Add Asset'}
          </Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* Row 1: Asset Identity + Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Section
              title="Asset Identity"
              icon={<Tag className="h-4 w-4 text-violet-600" />}
              iconBg="bg-violet-50"
              className="lg:col-span-2"
            >
              <Field label="Record Name" required error={errors.name} icon={<Tag className="h-3 w-3" />}>
                <Input value={form.name} onChange={set('name')} placeholder="e.g. Dev Laptop #3" />
              </Field>
              <Field label="Product Type" required error={errors.product} icon={<Laptop className="h-3 w-3" />}>
                <Input value={form.product} onChange={set('product')} placeholder="e.g. Laptop, Mouse" />
              </Field>
              <Field label="Product Name / Brand" required error={errors.productName} icon={<PackageCheck className="h-3 w-3" />}>
                <Input value={form.productName} onChange={set('productName')} placeholder="e.g. Dell XPS 15" />
              </Field>
              <Field label="Serial Number" icon={<Hash className="h-3 w-3" />}>
                <Input value={form.serialNumber} onChange={set('serialNumber')} placeholder="e.g. SN-2024-001" />
              </Field>
            </Section>

            <div className="space-y-5">
              <Section
                title="Status"
                icon={<Activity className="h-4 w-4 text-blue-600" />}
                iconBg="bg-blue-50"
              >
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <ShieldCheck className="h-3 w-3" /> Asset Status
                  </Label>
                  <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as AssetStatus }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STATUS_CONFIG) as AssetStatus[]).map((s) => (
                        <SelectItem key={s} value={s}>
                          <span className={STATUS_CONFIG[s].color}>{STATUS_CONFIG[s].label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Wrench className="h-3 w-3" /> Working Condition
                  </Label>
                  <Select value={form.workingCondition} onValueChange={(v) => setForm((f) => ({ ...f, workingCondition: v as WorkingCondition }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(CONDITION_CONFIG) as WorkingCondition[]).map((c) => (
                        <SelectItem key={c} value={c}>
                          <span className={CONDITION_CONFIG[c].color}>{CONDITION_CONFIG[c].label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Section>
            </div>
          </div>

          {/* Row 2: Technical + Financial */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Section
              title="Technical Details"
              icon={<Cpu className="h-4 w-4 text-indigo-600" />}
              iconBg="bg-indigo-50"
            >
              <Field label="Product Configuration" icon={<Cpu className="h-3 w-3" />} className="sm:col-span-2">
                <Input value={form.productConfiguration} onChange={set('productConfiguration')} placeholder="e.g. i7, 16GB RAM, 512GB SSD" />
              </Field>
              <Field label="Laptop PIN" icon={<Laptop className="h-3 w-3" />}>
                <div className="relative">
                  <Input
                    type={showPin ? 'text' : 'password'}
                    value={form.laptopPin}
                    onChange={set('laptopPin')}
                    className="pr-10"
                    placeholder="e.g. 1234"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <Field label="Laptop Password" icon={<Laptop className="h-3 w-3" />}>
                <div className="relative">
                  <Input
                    type={showPin ? 'text' : 'password'}
                    value={form.laptopPassword}
                    onChange={set('laptopPassword')}
                    className="pr-10"
                    placeholder="Login password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <Field label="Other Accessories" icon={<Paperclip className="h-3 w-3" />} className="sm:col-span-2">
                <Input value={form.otherAccessories} onChange={set('otherAccessories')} placeholder="e.g. Charger, Bag, Mouse" />
              </Field>
            </Section>

            <Section
              title="Financial & Timeline"
              icon={<CircleDollarSign className="h-4 w-4 text-emerald-600" />}
              iconBg="bg-emerald-50"
            >
              <Field label="Asset Price (₹)" icon={<Banknote className="h-3 w-3" />} error={errors.assetPrice}>
                <Input type="number" value={form.assetPrice} onChange={set('assetPrice')} placeholder="0.00" />
              </Field>
              <Field label="Date of Allocation" icon={<CalendarDays className="h-3 w-3" />}>
                <Input type="date" value={form.dateOfAllocation} onChange={set('dateOfAllocation')} />
              </Field>
              <Field label="Loans" icon={<CircleDollarSign className="h-3 w-3" />} className="sm:col-span-2">
                <Input value={form.loans} onChange={set('loans')} placeholder="Loan details if any" />
              </Field>
            </Section>
          </div>

          {/* Row 3: Allocation + Comments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Section
              title="Allocation"
              icon={<Users className="h-4 w-4 text-orange-600" />}
              iconBg="bg-orange-50"
            >
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <UserRound className="h-3 w-3" /> Allocated To
                </Label>
                <Select
                  value={form.allocatedTo || 'unallocated'}
                  onValueChange={(v) => handleResourceChange(!v || v === 'unallocated' ? '' : v)}
                >
                  <SelectTrigger>
                    <span className="flex flex-1 text-left text-sm truncate">
                      {form.allocatedTo
                        ? (resources.find((r) => r.id === form.allocatedTo)?.name ?? form.allocatedToName ?? form.allocatedTo)
                        : <span className="text-muted-foreground">— Unallocated —</span>
                      }
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unallocated">— Unallocated —</SelectItem>
                    {resources.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field label="Previous User" icon={<UserRound className="h-3 w-3" />} className="sm:col-span-2">
                <Input value={form.previousUser} onChange={set('previousUser')} placeholder="Name of previous holder" />
              </Field>
            </Section>

            <Section
              title="Notes & Comments"
              icon={<MessageSquare className="h-4 w-4 text-pink-600" />}
              iconBg="bg-pink-50"
            >
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <MessageSquare className="h-3 w-3" /> Comments
                </Label>
                <Textarea
                  value={form.comments}
                  onChange={set('comments')}
                  rows={5}
                  placeholder="Any additional notes about this asset…"
                />
              </div>
            </Section>
          </div>

        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger>
        <Button onClick={() => { setForm({ ...EMPTY_FORM }); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Asset
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="!top-0 !left-0 !right-0 !bottom-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !rounded-none !p-0 !flex !flex-col overflow-hidden"
      >
        {fullScreenContent}
      </DialogContent>
    </Dialog>
  );
}
