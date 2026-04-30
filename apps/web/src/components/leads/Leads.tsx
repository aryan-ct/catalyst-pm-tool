import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger,
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
import {
  Edit2, CheckCircle, XCircle, Plus,
  Target, CalendarDays, CheckCircle2, FolderOpen,
} from "lucide-react";

const STATUS_STYLES = {
  Active: {
    border: "border-l-primary",
    dot: "bg-primary",
    text: "text-primary",
    badge: "bg-primary/10 text-primary",
    avatar: "bg-primary/15 text-primary",
  },
  Converted: {
    border: "border-l-emerald-500",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-600",
    avatar: "bg-emerald-50 text-emerald-600",
  },
  Lost: {
    border: "border-l-red-400",
    dot: "bg-red-400",
    text: "text-red-500",
    badge: "bg-red-50 text-red-500",
    avatar: "bg-red-50 text-red-500",
  },
} as const;

const FILTER_LABELS: Record<string, string> = {
  All: "All Status",
  Active: "Active",
  Converted: "Converted",
  Lost: "Lost",
};

function formatDate(raw: string | null | undefined) {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

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
      const data = await RESOURCE_API.findMe();
      setMe(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeads();
    findMe();
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

  const filtered = leads.filter((l) =>
    filter === "All" ? true : l.status === filter
  );

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground leading-tight">Leads</h2>
            <p className="text-sm text-muted-foreground">Track and manage your sales pipeline.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={filter} onValueChange={(v) => setFilter(v ?? "All")}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card border-border h-9 text-sm">
              <span className="flex flex-1 text-left text-sm">{FILTER_LABELS[filter]}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Converted">Converted</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full whitespace-nowrap shrink-0">
            <Target className="h-3.5 w-3.5" />
            {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
          </div>

          <LeadModal onSuccess={fetchLeads} role={me?.role} />
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mx-auto mb-4">
              <Target className="h-7 w-7" />
            </div>
            <p className="text-base font-semibold text-foreground mb-1">No leads found</p>
            <p className="text-sm text-muted-foreground">
              {filter === "All"
                ? "No leads have been added yet."
                : `No ${filter.toLowerCase()} leads match.`}
            </p>
          </div>
        ) : (
          filtered.map((l, i) => {
            const style = STATUS_STYLES[l.status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.Active;
            const initials = (l.client ?? "?")[0].toUpperCase();
            const canEdit =
              me?.role === Roles.MANAGER || me?.role === Roles.BDE;
            const showBDEActions = l.status === "Active" && me?.role === Roles.BDE;
            const showManagerAction =
              l.status === "Converted" && me?.role === Roles.MANAGER && !l.projectId;

            return (
              <Card
                key={i}
                className={`group relative hover:shadow-lg transition-all duration-200 border-border border-l-4 ${style.border} overflow-hidden hover:-translate-y-0.5`}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Header: avatar + name + edit */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${style.avatar}`}>
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-foreground leading-tight">
                          {l.client}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <FolderOpen className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                            {l.projectName || "No project"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        onClick={() => setEditLead(l)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Status + date */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${style.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.dot}`} />
                      {l.status}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3 shrink-0" />
                      {formatDate(l.createdAt) ?? "—"}
                    </div>
                  </div>

                  {/* Converted date */}
                  {l.convertedAt && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      Converted on {formatDate(l.convertedAt)}
                    </div>
                  )}

                  {/* Actions */}
                  {(showBDEActions || showManagerAction) && (
                    <div className="pt-3 border-t border-border flex gap-2 flex-wrap">
                      {showBDEActions && (
                        <>
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={() => setConvertConfirmLeadId(l.id)}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                            Convert
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1 h-8 text-xs"
                            onClick={() => setLostLeadId(l.id)}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1.5" />
                            Mark Lost
                          </Button>
                        </>
                      )}
                      {showManagerAction && (
                        <Button
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={() => setConvertLead({ ...l, index: i })}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          Create Project
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
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
              <DialogTitle className="text-xl font-bold text-foreground">Mark Lead as Converted</DialogTitle>
              <DialogDescription className="text-muted-foreground pt-2">
                Are you sure you want to mark this lead as converted? This will allow project creation.
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
              <DialogDescription className="text-muted-foreground pt-2">
                Are you sure you want to mark this lead as lost? This action will update the lead status.
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
