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
import { Plus, Trash2 } from 'lucide-react';
import { validateProject } from './validate';
import { PROJECT_API } from '../../api/project.api';
import { PROJECT_DOCUMENT_API } from '../../api/project-document.api';

type DocRow = { id?: string; title: string; link: string };

export default function ProjectModal({
  setProjects,
  fetchProjects,
  editData,
  editIndex,
  setEditData,
  setEditIndex,
  prefill,
  onSubmitOverride,
  isControlled,
}: any) {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    client: '',
    date: '',
    hours: 0,
    status: '',
  });

  const [milestones, setMilestones] = useState<any[]>([]);
  const [docRows, setDocRows] = useState<DocRow[]>([]);
  const [deletedDocIds, setDeletedDocIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<any>({ milestones: [] });

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name ?? '',
        client: editData.client ?? '',
        date: editData.date ?? '',
        hours: editData.hours ?? 0,
        status: editData.status ?? '',
      });
      setMilestones(editData.milestones || []);
      setDocRows(
        (editData.documents || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          link: d.link,
        })),
      );
      setDeletedDocIds([]);
      setOpen(true);
    }
  }, [editData]);

  useEffect(() => {
    if (prefill) {
      setForm((prev) => ({ ...prev, ...prefill }));
      setOpen(true);
    }
  }, [prefill]);

  useEffect(() => {
    if (prefill || editData || isControlled) {
      setOpen(true);
    }
  }, [prefill, editData]);

  const addDocRow = () =>
    setDocRows((prev) => [...prev, { title: '', link: '' }]);

  const removeDocRow = (index: number) => {
    const row = docRows[index];
    if (row.id) setDeletedDocIds((prev) => [...prev, row.id!]);
    setDocRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDocRow = (
    index: number,
    field: 'title' | 'link',
    value: string,
  ) => {
    setDocRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const resetState = () => {
    setForm({ name: '', client: '', date: '', hours: 0, status: '' });
    setMilestones([]);
    setDocRows([]);
    setDeletedDocIds([]);
    setErrors({});
  };

  const syncDocuments = async (projectId: string, isEdit: boolean) => {
    const validRows = docRows.filter((d) => d.title.trim() && d.link.trim());

    if (isEdit) {
      await Promise.all(
        deletedDocIds.map((id) =>
          PROJECT_DOCUMENT_API.deleteDocument(projectId, id),
        ),
      );
      await Promise.all(
        validRows.map((d) =>
          d.id
            ? PROJECT_DOCUMENT_API.updateDocument(projectId, d.id, d.title, d.link)
            : PROJECT_DOCUMENT_API.addDocument(projectId, d.title, d.link),
        ),
      );
    } else {
      await Promise.all(
        validRows.map((d) =>
          PROJECT_DOCUMENT_API.addDocument(projectId, d.title, d.link),
        ),
      );
    }
  };

  const handleSubmit = async () => {
    const { isValid, errors } = validateProject({ ...form, milestones });
    setErrors(errors);
    if (!isValid) return;

    try {
      if (onSubmitOverride) {
        onSubmitOverride({ ...form, milestones });
      } else if (editIndex !== null) {
        if (editData && editData.id) {
          await PROJECT_API.updateProject(editData.id, { ...form, milestones });
          await syncDocuments(editData.id, true);
          if (fetchProjects) await fetchProjects();
        } else {
          setProjects((prev: any[]) =>
            prev.map((item, idx) =>
              idx === editIndex ? { ...form, milestones } : item,
            ),
          );
        }
      } else {
        const created = await PROJECT_API.createProject({ ...form, milestones });
        await syncDocuments(created.id, false);
        if (fetchProjects) await fetchProjects();
        else setProjects((prev: any[]) => [...prev, { ...form, milestones }]);
      }

      resetState();
      if (setEditData) setEditData(null);
      if (setEditIndex) setEditIndex(null);
      setOpen(false);
    } catch (error) {
      console.error('Failed to save project', error);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          if (setEditData) setEditData(null);
          if (setEditIndex) setEditIndex(null);
          resetState();
        }
      }}
    >
      {!isControlled && (
        <Button
          onClick={() => {
            resetState();
            if (setEditData) setEditData(null);
            if (setEditIndex) setEditIndex(null);
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
            <Label>Commencement Date</Label>
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

          {/* Documents */}
          <div className="space-y-2">
            <Label>Documents</Label>
            {docRows.map((doc, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  placeholder="Title"
                  value={doc.title}
                  onChange={(e) => updateDocRow(i, 'title', e.target.value)}
                  className="w-[35%] shrink-0"
                />
                <Input
                  placeholder="https://..."
                  value={doc.link}
                  onChange={(e) => updateDocRow(i, 'link', e.target.value)}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeDocRow(i)}
                  className="shrink-0 h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDocRow}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Document
            </Button>
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

          {/* Submit */}
          <Button onClick={handleSubmit} size="lg" className="w-full">
            {editIndex !== null ? 'Update Project' : 'Add Project'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
