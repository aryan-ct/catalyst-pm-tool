import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomRTE from './RichTextEditor';
import { MILESTONE_API } from '@/api/milestone.api';

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onCreated: (milestone: any) => void;
  onUpdated?: (milestone: any) => void;
  editData?: any | null;
}

const emptyForm = () => ({
  milestoneName: '',
  milestoneDescription: '',
  estimatedHours: 0,
  bugSheet: '',
});

export default function MilestoneFormDialog({
  open,
  onClose,
  projectId,
  onCreated,
  onUpdated,
  editData,
}: Props) {
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isEdit = !!editData;

  useEffect(() => {
    if (editData) {
      setForm({
        milestoneName: editData.milestoneName ?? '',
        milestoneDescription: editData.milestoneDescription ?? '',
        estimatedHours: editData.estimatedHours ?? 0,
        bugSheet: editData.bugSheet ?? '',
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
  }, [editData, open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.milestoneName.trim()) errs.milestoneName = 'Name is required.';
    if (!form.milestoneDescription.trim() || form.milestoneDescription === '<p></p>')
      errs.milestoneDescription = 'Description is required.';
    if (!form.estimatedHours || form.estimatedHours < 1)
      errs.estimatedHours = 'Must be at least 1 hour.';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      if (isEdit) {
        const updated = await MILESTONE_API.updateMilestone(editData.id, {
          milestoneName: form.milestoneName,
          milestoneDescription: form.milestoneDescription,
          estimatedHours: form.estimatedHours,
          bugSheet: form.bugSheet || undefined,
        });
        onUpdated?.({ ...editData, ...updated });
      } else {
        const created = await MILESTONE_API.createMilestone(projectId, {
          milestoneName: form.milestoneName,
          milestoneDescription: form.milestoneDescription,
          estimatedHours: form.estimatedHours,
          bugSheet: form.bugSheet || undefined,
        });
        onCreated(created);
      }
      setForm(emptyForm());
      setErrors({});
      onClose();
    } catch (err) {
      console.error('Failed to save milestone', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm(emptyForm());
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Milestone' : 'Add Milestone'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>Milestone Name</Label>
            <Input
              value={form.milestoneName}
              onChange={(e) => {
                setForm({ ...form, milestoneName: e.target.value });
                setErrors((p) => ({ ...p, milestoneName: '' }));
              }}
              placeholder="e.g. Authentication Module"
            />
            {errors.milestoneName && (
              <p className="text-xs text-red-500">{errors.milestoneName}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <CustomRTE
              value={form.milestoneDescription}
              onChange={(val: string) => {
                setForm({ ...form, milestoneDescription: val });
                setErrors((p) => ({ ...p, milestoneDescription: '' }));
              }}
            />
            {errors.milestoneDescription && (
              <p className="text-xs text-red-500">{errors.milestoneDescription}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Estimated Hours</Label>
            <Input
              type="number"
              min={1}
              value={form.estimatedHours}
              onChange={(e) => {
                setForm({ ...form, estimatedHours: Number(e.target.value) });
                setErrors((p) => ({ ...p, estimatedHours: '' }));
              }}
            />
            {errors.estimatedHours && (
              <p className="text-xs text-red-500">{errors.estimatedHours}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Bug Sheet Link (optional)</Label>
            <Input
              value={form.bugSheet}
              onChange={(e) => setForm({ ...form, bugSheet: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 text-white">
              {saving ? 'Saving...' : isEdit ? 'Update Milestone' : 'Add Milestone'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
