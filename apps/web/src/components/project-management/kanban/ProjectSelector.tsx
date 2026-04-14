
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project } from "../types/types";

interface Props {
  projects: Project[];
  selectedProjectId: string;
//   onSelect: (projectId: string) => void;
 onSelect: any;
}

export default function ProjectSelector({
  projects,
  selectedProjectId,
  onSelect,
}: Props) {
  return (
    <div className="flex items-center gap-4">
      <h1 className="text-xl font-semibold">Select Project:</h1>
      <Select value={selectedProjectId} onValueChange={onSelect}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Choose a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}