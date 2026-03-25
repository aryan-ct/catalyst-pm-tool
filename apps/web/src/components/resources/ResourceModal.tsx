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

type Resource = {
  name: string;
  role: string;
  email: string;
};

export default function ResourceModal({
  setResources,
  editData,
  editIndex,
  setEditData,
  setEditIndex,
}: any) {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<Resource>({
    name: '',
    role: '',
    email: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    role: '',
    email: '',
  });

  const handleSubmit = () => {
    const { isValid, errors } = validateResource(form);
    setErrors(errors);

    if (!isValid) return;

    if (editIndex !== null) {
      setResources((prev: Resource[]) =>
        prev.map((item, idx) => (idx === editIndex ? form : item)),
      );
    } else {
      setResources((prev: Resource[]) => [...prev, form]);
    }

    setForm({ name: '', role: '', email: '' });
    setErrors({ name: '', role: '', email: '' });
    setEditData(null);
    setEditIndex(null);
    setOpen(false);
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
            setForm({ name: '', role: '', email: '' });
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
          <DialogTitle>Add Resource</DialogTitle>
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
                setForm({ ...form, role: value ?? '' });
                setErrors((prev) => ({ ...prev, role: '' }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Dev">Developer</SelectItem>
                <SelectItem value="Tester">Tester</SelectItem>
                <SelectItem value="Designer">Designer</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="BDE">BDE</SelectItem>
              </SelectContent>
            </Select>

            {errors.role && (
              <p className="text-xs text-red-500">{errors.role}</p>
            )}
          </div>

          <div className="space-y-1">
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
