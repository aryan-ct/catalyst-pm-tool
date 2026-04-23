import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { LEAD_API } from "../../api/lead.api";

export default function EditLeadModal({ lead, onSuccess, onClose }: any) {
  const [form, setForm] = useState({
    client: "",
    projectName: "",
    docs: "",
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (lead) {
      setForm({
        client: lead.client || "",
        projectName: lead.projectName || "",
        docs: lead.docs || "",
      });
    }
  }, [lead]);

  const handleSubmit = async () => {
    let err: any = {};
    let valid = true;

    if (!form.client) {
      err.client = "Client required";
      valid = false;
    }

    setErrors(err);
    if (!valid) return;

    try {
      await LEAD_API.updateLeadDetails(lead.id, form);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error("Failed to update lead", error);
    }
  };

  return (
    <Dialog open={!!lead} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Client Name"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
          />
          {errors.client && <p className="text-red-500 text-xs">{errors.client}</p>}

          <Input
            placeholder="Project Name (optional)"
            value={form.projectName}
            onChange={(e) => setForm({ ...form, projectName: e.target.value })}
          />

          <Input
            placeholder="Documents"
            value={form.docs}
            onChange={(e) => setForm({ ...form, docs: e.target.value })}
          />

          <Button onClick={handleSubmit} className="w-full bg-blue-600 text-white mt-4">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
