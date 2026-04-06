import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

export default function LeadModal({ setLeads }: any) {

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    client: "",
    projectName: "",
    status: "",
    docs: "",
  });

  const [errors, setErrors] = useState<any>({});

  const handleSubmit = () => {

    let err: any = {};
    let valid = true;

    if (!form.client) {
      err.client = "Client required";
      valid = false;
    }

    if (!form.status) {
      err.status = "Status required";
      valid = false;
    }

    setErrors(err);
    if (!valid) return;

    setLeads((prev: any[]) => [
      ...prev,
      {
        ...form,
        createdAt: new Date().toLocaleString(),
      },
    ]);

    setOpen(false);
    setForm({ client: "", projectName: "", status: "", docs: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <Button onClick={() => setOpen(true)} className="bg-blue-600 text-white">
        + Create Lead
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">

          <Input
            placeholder="Client Name"
            onChange={(e) => setForm({ ...form, client: e.target.value })}
          />
          {errors.client && <p className="text-red-500 text-xs">{errors.client}</p>}

          <Input
            placeholder="Project Name (optional)"
            onChange={(e) => setForm({ ...form, projectName: e.target.value })}
          />

          <Input
            placeholder="Documents"
            onChange={(e) => setForm({ ...form, docs: e.target.value })}
          />

          <Select
            onValueChange={(v:any) => setForm({ ...form, status:v ?? "" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Converted">Converted</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          {errors.status && <p className="text-red-500 text-xs">{errors.status}</p>}

          <Button onClick={handleSubmit} className="w-full bg-blue-600 text-white">
            Add Lead
          </Button>

        </div>

      </DialogContent>
    </Dialog>
  );
}