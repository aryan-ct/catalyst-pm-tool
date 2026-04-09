import { useState } from "react";
import { Button } from "@/components/ui/button";
import AllocationSheets from "./AllocationSheets";
import ResourcesTab from "../resources-tab/ResourcesTab";

const AllocationTabs = () => {
  const [activeTab, setActiveTab] = useState<"allocation" | "resources">("allocation");

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <div className="flex gap-4">
          <Button
            variant={activeTab === "allocation" ? "default" : "outline"}
            onClick={() => setActiveTab("allocation")}
          >
            Allocation Sheets
          </Button>

          <Button
            variant={activeTab === "resources" ? "default" : "outline"}
            onClick={() => setActiveTab("resources")}
          >
            Resources
          </Button>
        </div>
      </div>

      {activeTab === "allocation" ? <AllocationSheets /> : <ResourcesTab />}
    </div>
  );
};

export default AllocationTabs;