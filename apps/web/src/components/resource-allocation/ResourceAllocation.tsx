import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import EditAllocationModal from "./EditAllocationModal";
import { DatePickerWithRange } from "@/components/common/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { UserCircle, Briefcase, Calendar as CalendarIcon, RotateCcw } from "lucide-react";

export default function ResourceAllocation() {

  const [data, setData] = useState([
    {
      id: "1",
      resourceName: "Kishan",
      resourceId: "r1",
      role: "Dev",
      projectIds: ["Project A", "Project B"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      resourceName: "Yuvika",
      resourceId: "r2",
      role: "Designer",
      projectIds: ["Project C"],
      createdAt: new Date().toISOString(),
    },
    
  ]);

  const [projects] = useState<string[]>([
    "Project A",
    "Project B",
    "Project C",
    "Project D",
  ]);

  const [roleFilter, setRoleFilter] = useState("All");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [editItem, setEditItem] = useState<any>(null);


  const filtered = data.filter((item) => {

    const roleMatch =
      roleFilter === "All" ? true : item.role === roleFilter;

    const dateMatch =
      (!dateRange?.from ||
        new Date(item.createdAt) >= dateRange.from) &&
      (!dateRange?.to ||
        new Date(item.createdAt) <= dateRange.to);

    return roleMatch && dateMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v ?? "All")}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="All">All Roles</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Developer">Developer</SelectItem>
              <SelectItem value="Tester">Tester</SelectItem>
              <SelectItem value="Designer">Designer</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="BDE">BDE</SelectItem>
            </SelectContent>
          </Select>

          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
          />
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-500"
          onClick={() => setDateRange(undefined)}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((item, i) => (
            <Card
              key={item.id}
              className="hover:shadow-md transition-all duration-200 border-slate-200 group"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                    <UserCircle className="h-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.resourceName}</h3>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Projects</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.projectIds.length > 0 ? (
                      item.projectIds.map((p, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        No projects assigned
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-50">
                   <CalendarIcon className="h-3 w-3" />
                   <span>Allocated on {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() =>
                    setEditItem({ ...item, index: i })
                  }
                >
                  Edit Allocation
                </Button>

              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 font-medium">No resources found for selected filters.</p>
            <Button variant="link" className="text-blue-600" onClick={() => {setRoleFilter("All"); setDateRange(undefined);}}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {editItem && (
        <EditAllocationModal
          item={editItem}
          projects={projects}
          setData={setData}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
}