import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function EditAllocationModal({
  item,
  projects,
  setData,
  onClose,
}: any) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (item) {
      setSelected(item.projectIds || []);
    }
  }, [item]);

  const toggleProject = (project: string) => {
    if (selected.includes(project)) {
      setSelected(selected.filter((p) => p !== project));
    } else {
      setSelected([...selected, project]);
    }
  };

  const handleSave = () => {
    setData((prev: any[]) =>
      prev.map((r, idx) =>
        idx === item.index
          ? { ...r, projectIds: selected }
          : r
      )
    );

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Allocation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {projects.map((p: string) => (
            <div
              key={p}
              className="flex items-center space-x-2"
            >
              <Checkbox
                checked={selected.includes(p)}
                onCheckedChange={() => toggleProject(p)}
              />
              <label className="text-sm">{p}</label>
            </div>
          ))}

          <Button
            className="w-full bg-blue-600 text-white"
            onClick={handleSave}
          >
            Save Allocation
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}