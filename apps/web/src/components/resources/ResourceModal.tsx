import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { validateResource } from './validate';
import { ResourceStatus, Roles } from '@/lib/enum';
import { Resource, RESOURCE_API } from '@/api/resource.api';

export default function ResourceModal({
  setResources,
  editData,
  editIndex,
  setEditData,
  setEditIndex,
  onRefresh,
}: any) {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<Resource>({
    name: '',
    role: null,
    email: '',
    isActive: true,
  });

  const [errors, setErrors] = useState({
    name: '',
    role: '',
    email: '',
  });

  const handleSubmit = async () => {
    const { isValid, errors } = validateResource(form);
    setErrors(errors);

    if (!isValid) return;

    try {
      if (editData && editData.id) {
        await RESOURCE_API.updateResource(editData.id, form);
      } else {
        await RESOURCE_API.createResource(form);
      }

      if (onRefresh) {
        onRefresh();
      } else if (setResources) {
        // Fallback for UI-only updates if onRefresh is not provided
        if (editIndex !== null) {
          setResources((prev: Resource[]) =>
            prev.map((item, idx) => (idx === editIndex ? form : item)),
          );
        } else {
          setResources((prev: Resource[]) => [...prev, form]);
        }
      }

      setForm({ name: '', role: null, email: '', isActive: true });
      setErrors({ name: '', role: '', email: '' });
      setEditData(null);
      setEditIndex(null);
      setOpen(false);
    } catch (e) {
      console.error('Failed to save resource', e);
    }
  };

  useEffect(() => {
    if (editData) {
      setForm(editData);
      setOpen(true);
    }
  }, [editData]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          className="bg-blue-600 text-white"
          onClick={() => {
            setForm({ name: '', role: null, email: '', isActive: true });
            setErrors({ name: '', role: '', email: '' });
            setEditData(null);
            setEditIndex(null);
          }}
        >
          + Create Resource
        </Button>
      </DialogTrigger>

      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Update Resource' : 'Add Resource'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setErrors((prev) => ({ ...prev, name: '' }));
              }}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Role</Label>

            <Select
              value={form.role}
              onValueChange={(value) => {
                setForm({ ...form, role: value ?? null });
                setErrors((prev) => ({ ...prev, role: '' }));
              }}
            >
              <SelectTrigger className={'w-full'}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={Roles.MANAGER}>MANAGER</SelectItem>
                <SelectItem value={Roles.DEV}>DEV</SelectItem>
                <SelectItem value={Roles.TESTER}>TESTER</SelectItem>
                <SelectItem value={Roles.DESIGNER}>DESIGNER</SelectItem>
                <SelectItem value={Roles.HR}>HR</SelectItem>
                <SelectItem value={Roles.BDE}>BDE</SelectItem>
              </SelectContent>
            </Select>

            {errors.role && (
              <p className="text-xs text-red-500">{errors.role}</p>
            )}
          </div>

          <div className="space-y-1 w-full">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Select Resource Status</Label>
            <Select
              onValueChange={(value) => {
                const resourceStatus = value as ResourceStatus | null;
                if (resourceStatus === ResourceStatus.ACTIVE) {
                  setForm({ ...form, isActive: true });
                } else {
                  setForm({ ...form, isActive: false });
                }
              }}
              value={
                form.isActive ? ResourceStatus.ACTIVE : ResourceStatus.IN_ACTIVE
              }
            >
              <SelectTrigger className={'w-full'}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={ResourceStatus.ACTIVE}>ACTIVE</SelectItem>
                <SelectItem value={ResourceStatus.IN_ACTIVE}>
                  IN_ACTIVE
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full bg-blue-600 text-white"
            onClick={handleSubmit}
          >
            {editIndex !== null ? 'Update Resource' : 'Add Resource'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
