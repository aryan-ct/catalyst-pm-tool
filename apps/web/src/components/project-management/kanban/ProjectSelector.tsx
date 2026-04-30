import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface Props {
  projects: { id: string; name: string }[];
  selectedProjectId: string;
  onSelect: (projectId: string) => void;
}

export default function ProjectSelector({
  projects,
  selectedProjectId,
  onSelect,
}: Props) {
  const selectedName = projects.find((p) => p.id === selectedProjectId)?.name;

  return (
    <div className="flex items-center gap-4">
      <h1 className="text-xl font-semibold">Select Project:</h1>
      <Select value={selectedProjectId} onValueChange={(val) => val && onSelect(val)}>
        <SelectTrigger className="w-[280px]">
          <span className="flex flex-1 text-left text-sm truncate">
            {selectedName ?? (
              <span className="text-muted-foreground">Choose a project</span>
            )}
          </span>
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
