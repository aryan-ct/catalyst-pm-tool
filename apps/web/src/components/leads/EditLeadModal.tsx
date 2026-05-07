import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

import { LEAD_API } from "../../api/lead.api";

export default function EditLeadModal({ lead, onSuccess, onClose }: any) {
  const [form, setForm] = useState({
    client: "",
    projectName: "",
    links: [""],
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (lead) {
      setForm({
        client: lead.client || "",
        projectName: lead.projectName || "",
        links: lead.links?.length ? lead.links : [""],
      });
    }
  }, [lead]);

  const updateLink = (i: number, val: string) =>
    setForm((f) => ({ ...f, links: f.links.map((l, idx) => (idx === i ? val : l)) }));

  const addLink = () =>
    setForm((f) => ({ ...f, links: [...f.links, ""] }));

  const removeLink = (i: number) =>
    setForm((f) => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }));

  const handleSubmit = async () => {
    const err: any = {};
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

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Document Links</p>
            {form.links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder={`Link ${i + 1}`}
                  value={link}
                  onChange={(e) => updateLink(i, e.target.value)}
                  className="flex-1"
                />
                {form.links.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeLink(i)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs gap-1.5"
              onClick={addLink}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Link
            </Button>
          </div>

          <Button onClick={handleSubmit} size="lg" className="w-full mt-4">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
