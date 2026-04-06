import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import LeadModal from "./LeadModal";
import LeadToProjectModal from "./LeadToProjectModal";


export default function Leads({ setProjects }: any) {

  const [leads, setLeads] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [convertLead, setConvertLead] = useState<any>(null);

  const filtered = leads.filter(l =>
    filter === "All" ? true : l.status === filter
  );

  return (
    <div className="space-y-6">

      <div className="flex justify-between">

        <Select
          value={filter}
          onValueChange={(v) => setFilter(v ?? "All")}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Converted">Converted</SelectItem>
            <SelectItem value="Lost">Lost</SelectItem>
          </SelectContent>
        </Select>

        <LeadModal setLeads={setLeads} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {filtered.map((l, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">

              <p className="font-semibold">{l.client}</p>

              <p className="text-sm text-gray-500">
                Project: {l.projectName || "—"}
              </p>

              <p className="text-sm">{l.status}</p>

              <p className="text-xs text-gray-400">
                Created: {l.createdAt}
              </p>

              {l.convertedAt && (
                <p className="text-xs text-green-500">
                  Converted: {l.convertedAt}
                </p>
              )}

              {l.status === "Active" && (
                <Button
                  className="bg-blue-600 text-white"
                  onClick={() => setConvertLead({ ...l, index: i })}
                >
                  Convert to Project
                </Button>
              )}

            </CardContent>
          </Card>
        ))}

      </div>

      {convertLead && (
        <LeadToProjectModal
          lead={convertLead}
          setLeads={setLeads}
          setProjects={setProjects}
          onClose={() => setConvertLead(null)}
          
        />
      )}

    </div>
  );
}