import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { PMBackendMilestone } from "../types/types";

interface Props {
  milestones: PMBackendMilestone[];
  selectedMilestoneId: string;
  onSelect: (milestoneId: string) => void;
}

export default function MilestoneSelector({ milestones, selectedMilestoneId, onSelect }: Props) {
  const selectedName = milestones.find((m) => m.id === selectedMilestoneId)?.milestoneName;

  return (
    <div className="flex items-center gap-4">
      <h1 className="text-xl font-semibold">Milestone:</h1>
      <Select value={selectedMilestoneId} onValueChange={(val) => val && onSelect(val)}>
        <SelectTrigger className="w-[280px]">
          <span className="flex flex-1 text-left text-sm truncate">
            {selectedName ?? (
              <span className="text-muted-foreground">Choose a milestone</span>
            )}
          </span>
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
