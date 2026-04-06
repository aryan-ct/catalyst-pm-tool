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
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v ?? "All")}
        >
          <SelectTrigger className="w-[180px]">
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
        <Button
          variant="ghost"
          onClick={() => setDateRange(undefined)}
        >
          Reset Dates
        </Button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {filtered.length > 0 ? (
          filtered.map((item, i) => (
            <Card
              key={item.id}
              className="hover:shadow-md transition border"
            >
              <CardContent className="p-4 space-y-3">

                <div>
                  <p className="text-xs text-gray-500">Resource:</p>
                  <h3 className="font-semibold text-base">
                    {item.resourceName}
                  </h3>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Role:</p>                 
                    {item.role}
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Assigned Projects:
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {item.projectIds.length > 0 ? (
                      item.projectIds.map((p, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded"
                        >
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        No projects assigned
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
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
          <p className="text-sm text-gray-500">
            No resources found for selected filters.
          </p>
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