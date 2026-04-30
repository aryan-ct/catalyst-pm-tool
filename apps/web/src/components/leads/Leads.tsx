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
import EditLeadModal from "./EditLeadModal";
import LeadToProjectModal from "./LeadToProjectModal";
import { LEAD_API } from "../../api/lead.api";
import { Resource, RESOURCE_API } from "@/api/resource.api";
import { Roles } from "@/lib/enum";
import { Edit2, CheckCircle, XCircle, Plus } from "lucide-react";

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
  const [editLead, setEditLead] = useState<any>(null);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v ?? "All")}
        >
          <SelectTrigger className="w-full sm:w-[200px] bg-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Converted">Converted</SelectItem>
            <SelectItem value="Lost">Lost</SelectItem>
          </SelectContent>
        </Select>

        <LeadModal onSuccess={fetchLeads} role={me?.role} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((l, i) => (
          <Card key={i} className="hover:shadow-md transition-all duration-200 border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{l.client}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Project: {l.projectName || "—"}
                  </p>
                </div>
                {(me?.role === Roles.MANAGER || (me?.role === Roles.BDE && l.createdById === me?.id)) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    onClick={() => setEditLead(l)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  l.status === 'Active' ? 'bg-primary/10 text-primary' : 
                  l.status === 'Converted' ? 'bg-emerald-50 text-emerald-600' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  {l.status}
                </span>
                <span className="text-xs text-slate-400">
                  {l.createdAt}
                </span>
              </div>

              {l.convertedAt && (
                <div className="text-xs text-emerald-600 font-medium bg-emerald-50/50 px-3 py-2 rounded-lg border border-emerald-100">
                  Converted on {l.convertedAt}
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-border mt-4 flex-wrap">
                {l.status === "Active" && me?.role === Roles.BDE && (
                  <>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => setConvertConfirmLeadId(l.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Convert
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => setLostLeadId(l.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Lost
                    </Button>
                  </>
                )}

                {l.status === "Converted" && me?.role === Roles.MANAGER && !l.projectId && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setConvertLead({ ...l, index: i })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                )}
              </div>
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

      {editLead && (
        <EditLeadModal
          lead={editLead}
          onSuccess={fetchLeads}
          onClose={() => setEditLead(null)}
        />
      )}

      {convertConfirmLeadId && (
        <Dialog open={!!convertConfirmLeadId} onOpenChange={(open) => !open && setConvertConfirmLeadId(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">Mark Lead as Converted</DialogTitle>
              <DialogDescription className="text-slate-500 pt-2">
                Are you sure you want to mark this lead as converted? This action will update the lead status and allow project creation.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex gap-2">
              <Button variant="ghost" onClick={() => setConvertConfirmLeadId(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleMarkConverted} className="flex-1">
                Confirm Conversion
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {lostLeadId && (
        <Dialog open={!!lostLeadId} onOpenChange={(open) => !open && setLostLeadId(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-600">Mark Lead as Lost</DialogTitle>
              <DialogDescription className="text-slate-500 pt-2">
                Are you sure you want to mark this lead as lost? This action will update the lead status and may notify other team members.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex gap-2">
              <Button variant="ghost" onClick={() => setLostLeadId(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleMarkLost} className="flex-1">
                Confirm Lost
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}