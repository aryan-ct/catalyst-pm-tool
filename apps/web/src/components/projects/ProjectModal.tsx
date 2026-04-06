// src/components/projects/ProjectModal.tsx

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CustomRTE from './RichTextEditor';
import { validateProject } from './validate';

export default function ProjectModal({
  setProjects,
  editData,
  editIndex,
  setEditData,
  setEditIndex,
  prefill,
   onSubmitOverride,
   isControlled
}: any) {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    client: '',
    date: '',
    hours: 0,
    status: '',
    docLink: '',
  });

  const [milestones, setMilestones] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({
    milestones: [],
  });

  // ✅ Prefill on edit
  useEffect(() => {
    if (editData) {
      setForm(editData);
      setMilestones(editData.milestones || []);
      setOpen(true);
    }
  }, [editData]);

    useEffect(() => {
  if (prefill) {
    setForm((prev) => ({
      ...prev,
      ...prefill,
    }));
    setOpen(true);
  }
}, [prefill]);

useEffect(() => {
  if (prefill || editData || isControlled) {
    setOpen(true);
  }
}, [prefill, editData]);


  // ✅ Submit handler
//   const handleSubmit = () => {
//     const { isValid, errors } = validateProject({
//       ...form,
//       milestones,
//     });

//     setErrors(errors);

//     if (!isValid) return;

//     // if (editIndex !== null) {
//     //   setProjects((prev: any[]) =>
//     //     prev.map((item, idx) =>
//     //       idx === editIndex ? { ...form, milestones } : item,
//     //     ),
//     //   );
//     // } else {
//     //   setProjects((prev: any[]) => [...prev, { ...form, milestones }]);
//     // }

//      if (editIndex !== null) {
//       setProjects((prev: any[]) =>
//         prev.map((item, idx) =>
//           idx === editIndex ? { ...form, milestones } : item,
//         ),
//       );
//     }
//     if (onSubmitOverride) {
//   onSubmitOverride({ ...form, milestones });
// } else {
//   setProjects((prev:any) => [...prev, { ...form, milestones }]);
// }

//     // Reset
//     setForm({
//       name: '',
//       client: '',
//       date: '',
//       hours: 0,
//       status: '',
//       docLink: '',
//     });

//     setMilestones([]);
//     setErrors({ milestones: [] });
//     setEditData(null);
//     setEditIndex(null);
//     setOpen(false);
//   };

const handleSubmit = () => {
  const { isValid, errors } = validateProject({
    ...form,
    milestones,
  });

  setErrors(errors);
  if (!isValid) return;

  if (onSubmitOverride) {
    // 🔥 LEAD → PROJECT
    onSubmitOverride({ ...form, milestones });
  } else if (editIndex !== null) {
    // 🔥 EDIT
    setProjects((prev: any[]) =>
      prev.map((item, idx) =>
        idx === editIndex ? { ...form, milestones } : item
      )
    );
  } else {
    // 🔥 CREATE
    setProjects((prev: any[]) => [
      ...prev,
      { ...form, milestones },
    ]);
  }

  // Reset
  setForm({
    name: "",
    client: "",
    date: "",
    hours: 0,
    status: "",
    docLink: "",
  });

  setMilestones([]);
  setErrors({});
  setEditData(null);
  setEditIndex(null);
  setOpen(false);
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Open Button */}
      {!isControlled && (
  <Button
    className="bg-blue-600 text-white"
    onClick={() => {
      setForm({
        name: "",
        client: "",
        date: "",
        hours: 0,
        status: "",
        docLink: "",
      });
      setMilestones([]);
      setErrors({});
      setEditData(null);
      setEditIndex(null);
      setOpen(true);
    }}
  >
    + Create Project
  </Button>
)}

      <DialogContent className="max-h-[80vh] overflow-y-auto space-y-4">
        <DialogHeader>
          <DialogTitle>
            {editIndex !== null ? 'Edit Project' : 'Create Project'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label>Project Name</Label>
            <Input
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setErrors((prev: any) => ({ ...prev, name: '' }));
              }}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Client */}
          <div className="space-y-1">
            <Label>Client Name</Label>
            <Input
              value={form.client}
              onChange={(e) => {
                setForm({ ...form, client: e.target.value });
                setErrors((prev: any) => ({ ...prev, client: '' }));
              }}
            />
            {errors.client && (
              <p className="text-xs text-red-500">{errors.client}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label>Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => {
                setForm({ ...form, date: e.target.value });
                setErrors((prev: any) => ({ ...prev, date: '' }));
              }}
            />
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Hours */}
          <div className="space-y-1">
            <Label>Estimated Hours</Label>
            <Input
              type="number"
              value={form.hours}
              onChange={(e) => {
                setForm({ ...form, hours: Number(e.target.value) });
                setErrors((prev: any) => ({ ...prev, hours: '' }));
              }}
            />
            {errors.hours && (
              <p className="text-xs text-red-500">{errors.hours}</p>
            )}
          </div>

          {/* Doc Link */}
          <div className="space-y-1">
            <Label>Document Link (optional)</Label>
            <Input
              value={form.docLink}
              onChange={(e) => {
                setForm({ ...form, docLink: e.target.value });
                setErrors((prev: any) => ({ ...prev, docLink: '' }));
              }}
            />
            {errors.docLink && (
              <p className="text-xs text-red-500">{errors.docLink}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              value={form.status || undefined}
              onValueChange={(value) => {
                setForm({ ...form, status: value ?? '' });
                setErrors((prev: any) => ({ ...prev, status: '' }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {errors.status && (
              <p className="text-xs text-red-500">{errors.status}</p>
            )}
          </div>

          {/* Milestones */}
          <div className="space-y-3">
            <Label>Milestones</Label>

            <Button
              variant="outline"
              onClick={() =>
                setMilestones([...milestones, { name: '', desc: '', hours: 0 }])
              }
            >
              + Add Milestone
            </Button>

            {milestones.map((m, i) => (
              <div key={i} className="border p-4 rounded-md space-y-3">
                <p className="text-sm font-medium">Milestone {i + 1}</p>

                {/* Name */}
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    value={m.name}
                    onChange={(e) => {
                      const updated = [...milestones];
                      updated[i].name = e.target.value;
                      setMilestones(updated);
                    }}
                  />
                  {errors.milestones?.[i]?.name && (
                    <p className="text-xs text-red-500">
                      {errors.milestones[i].name}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label>Description</Label>
                  <CustomRTE
                    value={m.desc}
                    onChange={(val: string) => {
                      const updated = [...milestones];
                      updated[i].desc = val;
                      setMilestones(updated);
                    }}
                  />
                </div>

                {/* Hours */}
                <div className="space-y-1">
                  <Label>Hours</Label>
                  <Input
                    type="number"
                    value={m.hours}
                    onChange={(e) => {
                      const updated = [...milestones];
                      updated[i].hours = Number(e.target.value);
                      setMilestones(updated);
                    }}
                  />
                  {errors.milestones?.[i]?.hours && (
                    <p className="text-xs text-red-500">
                      {errors.milestones[i].hours}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white"
          >
            {editIndex !== null ? 'Update Project' : 'Add Project'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
