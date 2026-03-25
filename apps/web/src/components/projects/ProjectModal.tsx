// src/components/projects/ProjectModal.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import RichTextEditor from "./RichTextEditor";
import { validateProject } from "./validate";


export default function ProjectModal({ setProjects }: any) {

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    client: "",
    date: "",
    hours: 0,
    status: "",
    docLink: "",
  });

  const [errors, setErrors] = useState<any>({});

  const [milestones, setMilestones] = useState<any[]>([]);

  const handleSubmit = () => {
    const { isValid, errors } = validateProject(form);
    setErrors(errors);
    if (!isValid) return;

    setProjects((prev: any) => [
      ...prev,
      { ...form, milestones }
    ]);

    setForm({
      name: "", client: "", date: "", hours: 0, status: "", docLink: ""
    });

    setMilestones([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger >
        <Button className="bg-blue-600 text-white">+ Create Project</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] overflow-y-auto space-y-4">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">

          <Input placeholder="Project Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

          <Input placeholder="Client Name"
            onChange={(e) => setForm({ ...form, client: e.target.value })} />

          <Input type="date"
            onChange={(e) => setForm({ ...form, date: e.target.value })} />

          <Input type="number" placeholder="Estimated Hours"
            onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} />

          <Input placeholder="Document Link"
            onChange={(e) => setForm({ ...form, docLink: e.target.value })} />

          
         <Select
  value={form.status || undefined}
  onValueChange={(value) => {
    setForm({
      ...form,
      status: value ?? "", 
    });
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

         
          <div className="space-y-2">
            <Button onClick={() =>
              setMilestones([...milestones, { name: "", desc: "", hours: 0 }])
            }>
              + Add Milestone
            </Button>

            {milestones.map((m, i) => (
              <div key={i} className="border p-3 rounded space-y-2">

                <Input placeholder="Milestone Name"
                  onChange={(e) => {
                    const updated = [...milestones];
                    updated[i].name = e.target.value;
                    setMilestones(updated);
                  }}
                />

                <RichTextEditor
                  value={m.desc}
                  onChange={(val: string) => {
                    const updated = [...milestones];
                    updated[i].desc = val;
                    setMilestones(updated);
                  }}
                />

                <Input type="number" placeholder="Hours"
                  onChange={(e) => {
                    const updated = [...milestones];
                    updated[i].hours = Number(e.target.value);
                    setMilestones(updated);
                  }}
                />

              </div>
            ))}
          </div>

          <Button onClick={handleSubmit} className="w-full bg-blue-600 text-white">
            Add Project
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}