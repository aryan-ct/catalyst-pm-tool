import { Input } from "@/components/ui/input";
import { AllocationRow } from "../types";

const AllocationTable = ({
  data,
  isEditable,
}: {
  data: AllocationRow[];
  isEditable?: boolean;
}) => {
  return (
    <div className="border rounded-xl p-4">
      <div className="grid grid-cols-3 font-semibold border-b pb-2">
        <span>Resource</span>
        <span>Projects</span>
        <span>Description</span>
      </div>

      {data.map((row, i) => (
        <div key={i} className="grid grid-cols-3 py-3 border-b">
          <span>{row.resourceName}</span>

          <div>
            {row.projects.map((p, j) =>
              isEditable ? (
                <Input key={j} defaultValue={p.name} />
              ) : (
                <div key={j}>{p.name}</div>
              )
            )}
          </div>
          <div>
            {row.projects.map((p, j) =>
              isEditable ? (
                <Input key={j} defaultValue={p.description} />
              ) : (
                <div key={j}>{p.description}</div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllocationTable;