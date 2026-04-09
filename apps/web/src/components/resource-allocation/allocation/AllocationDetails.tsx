import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { allocations } from '../data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CircleX } from 'lucide-react';

const PROJECT_OPTIONS = ['PM Tool', 'Dashboard', 'Website', 'Mobile App'];

const AllocationDetails = ({
  date,
  onBack,
}: {
  date: string;
  onBack: () => void;
}) => {
  const today = new Date().toDateString();
  const isEditable = date === today;

  const initialData = allocations.filter((a) => a.date === date);

  const [rows, setRows] = useState(initialData);

  const handleAddProject = (rowIndex: number, projectName: string) => {
    const updated = [...rows];

    updated[rowIndex].projects.push({
      id: Date.now().toString(),
      name: projectName,
      description: '',
    });

    setRows(updated);
  };

  const handleRemoveProject = (rowIndex: number, projectIndex: number) => {
    const updated = [...rows];
    updated[rowIndex].projects.splice(projectIndex, 1);
    setRows(updated);
  };

  const handleDescChange = (
    rowIndex: number,
    projectIndex: number,
    value: string,
  ) => {
    const updated = [...rows];
    updated[rowIndex].projects[projectIndex].description = value;
    setRows(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>

        <span className="font-semibold">{date}</span>
      </div>

      <div className="border rounded-xl p-4">
        <div className="grid grid-cols-3 font-semibold border-b pb-2">
          <span>Resource</span>
          <span>Projects</span>
          <span>Description</span>
        </div>

        {rows.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            No data available
          </div>
        ) : (
          rows.map((row, rowIndex) => (
            <div key={rowIndex} className="border-b py-4">
              {isEditable && (
                <div className="grid grid-cols-3 gap-4 mb-3 items-center">
                  <div className="font-medium">{row.resourceName}</div>

                  <div>
                    <Select<string>
                      onValueChange={(value) => {
                        if (!value) return;
                        handleAddProject(rowIndex, value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>

                      <SelectContent>
                        {PROJECT_OPTIONS.filter(
                          (p) => !row.projects.some((proj) => proj.name === p),
                        ).map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div></div>
                </div>
              )}

              {row.projects.map((p, projectIndex) => (
                <div
                  key={p.id}
                  className="grid grid-cols-3 gap-4 mb-3 items-start"
                >
                  <div className="font-medium">
                    {!isEditable && projectIndex === 0 ? row.resourceName : ''}
                  </div>

                  <div className="flex justify-between border rounded px-3 py-2">
                    <span>{p.name}</span>

                    {isEditable && (
                      <button
                        onClick={() =>
                          handleRemoveProject(rowIndex, projectIndex)
                        }
                        className="text-red-500 hover:cursor-pointer"
                      >
                        <CircleX className='h-4 w-4'/>
                      </button>
                    )}
                  </div>

                  <div>
                    {isEditable ? (
                      <Input
                        placeholder="Description"
                        value={p.description || ''}
                        onChange={(e) =>
                          handleDescChange(
                            rowIndex,
                            projectIndex,
                            e.target.value,
                          )
                        }
                        className="min-h-[40px]"
                      />
                    ) : (
                      <div className="border rounded px-3 py-2 break-words whitespace-pre-wrap">
                        {p.description || '-'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllocationDetails;
