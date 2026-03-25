// src/components/projects/Projects.tsx

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProjectModal from "./ProjectModal";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

export default function Projects() {

  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");

  const filtered = projects.filter(p =>
    filter === "All" ? true : p.status === filter
  );

  return (
    <div className="space-y-6">

      <div className="flex justify-between">

        <Select
          value={filter}
          onValueChange={(v) => setFilter(v ?? "All")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <ProjectModal setProjects={setProjects} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {filtered.map((p, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">

              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-gray-500">{p.client}</p>
              <p className="text-sm">{p.status}</p>

              <a href={p.docLink} className="text-blue-500 text-sm">
                Document
              </a>

              <div className="text-sm">
                {p.milestones.map((m: any, idx: number) => (
                  <div key={idx}>
                    <b>{m.name}</b>
                    <div dangerouslySetInnerHTML={{ __html: m.desc }} />
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>
        ))}

      </div>
    </div>
  );
}