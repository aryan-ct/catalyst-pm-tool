import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import LeadModal from "./LeadModal";
import LeadToProjectModal from "./LeadToProjectModal";
import { LEAD_API } from "../../api/lead.api";
import { Resource, RESOURCE_API } from "@/api/resource.api";
import { Roles } from "@/lib/enum";

export default function Leads({ setProjects }: any) {

  const [leads, setLeads] = useState<any[]>([]);
  const [me, setMe] = useState<Resource | null>(null);

  const fetchLeads = async () => {
    try {
      const data = await LEAD_API.getAllLeads();
      setLeads(data);
    } catch (err) {
      console.error(err);
    }
  };

  const findMe = async () => {
    try {
      const data = await RESOURCE_API.findMe()
      setMe(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeads();
    findMe()
  }, []);
  const [filter, setFilter] = useState("All");
  const [convertLead, setConvertLead] = useState<any>(null);
  const [lostLeadId, setLostLeadId] = useState<string | null>(null);
  const [convertConfirmLeadId, setConvertConfirmLeadId] = useState<string | null>(null);

  const handleMarkConverted = async () => {
    if (!convertConfirmLeadId) return;
    try {
      await LEAD_API.updateLeadStatus(convertConfirmLeadId, "CONVERTED");
      fetchLeads();
    } catch (err) {
      console.error("Failed to mark lead as converted:", err);
    } finally {
      setConvertConfirmLeadId(null);
    }
  };

  const handleMarkLost = async () => {
    if (!lostLeadId) return;
    try {
      await LEAD_API.updateLeadStatus(lostLeadId, "LOST");
      fetchLeads();
    } catch (err) {
      console.error("Failed to mark lead as lost:", err);
    } finally {
      setLostLeadId(null);
    }
  };

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

        <LeadModal onSuccess={fetchLeads} role={me?.role} />
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

              {l.status === "Active" && me?.role === Roles.BDE && (
                <div className="flex gap-2 mt-4">
                  <Button
                    className="bg-blue-600 text-white"
                    onClick={() => setConvertConfirmLeadId(l.id)}
                  >
                    Mark as Converted
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setLostLeadId(l.id)}
                  >
                    Mark as Lost
                  </Button>
                </div>
              )}

              {l.status === "Converted" && me?.role === Roles.MANAGER && !l.projectId && (
                <div className="flex gap-2 mt-4">
                  <Button
                    className="bg-blue-600 text-white"
                    onClick={() => setConvertLead({ ...l, index: i })}
                  >
                    Create Project
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        ))}

      </div>

      {convertLead && (
        <LeadToProjectModal
          lead={convertLead}
          onSuccess={fetchLeads}
          setProjects={setProjects}
          onClose={() => setConvertLead(null)}

        />
      )}

      {convertConfirmLeadId && (
        <Dialog open={!!convertConfirmLeadId} onOpenChange={(open) => !open && setConvertConfirmLeadId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Lead as Converted</DialogTitle>
              <DialogDescription>
                Are you sure you want to mark this lead as converted? This action will update the lead status and allow project creation.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setConvertConfirmLeadId(null)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 text-white" onClick={handleMarkConverted}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {lostLeadId && (
        <Dialog open={!!lostLeadId} onOpenChange={(open) => !open && setLostLeadId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Lead as Lost</DialogTitle>
              <DialogDescription>
                Are you sure you want to mark this lead as lost? This action will update the lead status and may notify other team members.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setLostLeadId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleMarkLost}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}