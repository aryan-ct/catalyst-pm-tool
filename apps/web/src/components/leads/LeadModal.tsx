import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

import { LEAD_API } from "../../api/lead.api";
import { Roles } from "@/lib/enum";

const initialForm = {
  client: "",
  projectName: "",
  status: "Active",
};

export default function LeadModal({ onSuccess, role }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<any>({});

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setForm(initialForm);
      setErrors({});
    }
  };

  const handleSubmit = async () => {

    const err: any = {};
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

    try {
      await LEAD_API.createLead(form);
      if (onSuccess) onSuccess();
      handleOpenChange(false);
    } catch (error) {
      console.error("Failed to create lead", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>

      <Button onClick={() => setOpen(true)}>
        + Create Lead
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Client Name"
            value={form.client}
            onChange={(e) => {
              setForm({ ...form, client: e.target.value });
              setErrors((prev: any) => ({ ...prev, client: "" }));
            }}
          />
          {errors.client && <p className="text-red-500 text-xs">{errors.client}</p>}

          <Input
            placeholder="Project Name (optional)"
            value={form.projectName}
            onChange={(e) => setForm({ ...form, projectName: e.target.value })}
          />

          {role === Roles.MANAGER && (
            <Select
              value={form.status}
              onValueChange={(v: any) => {
                setForm({ ...form, status: v ?? "" });
                setErrors((prev: any) => ({ ...prev, status: "" }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>)}

          {errors.status && <p className="text-red-500 text-xs">{errors.status}</p>}

          <Button onClick={handleSubmit} size="lg" className="w-full">
            Add Lead
          </Button>

        </div>

      </DialogContent>
    </Dialog>
  );
}