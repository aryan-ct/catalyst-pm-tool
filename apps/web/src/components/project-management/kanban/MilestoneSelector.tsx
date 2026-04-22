import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PMBackendMilestone } from "../types/types";

interface Props {
  milestones: PMBackendMilestone[];
  selectedMilestoneId: string;
  onSelect: (milestoneId: string) => void;
}

export default function MilestoneSelector({ milestones, selectedMilestoneId, onSelect }: Props) {
  return (
    <div className="flex items-center gap-4">
      <h1 className="text-xl font-semibold">Milestone:</h1>
      <Select value={selectedMilestoneId} onValueChange={(val) => val && onSelect(val)}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Choose a milestone" />
        </SelectTrigger>
        <SelectContent>
          {milestones.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.milestoneName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
