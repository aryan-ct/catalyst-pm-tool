import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

interface TimesheetRecord {
  id: string;
  dateRange: string;
  clientName: string;
  projectName: string;
  resource: string;
  totalTime: string;
}

export default function Timesheet() {
  const [timesheets, setTimesheets] = useState<TimesheetRecord[]>([]);
  const [filterProject, setFilterProject] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filteredTimesheets = timesheets.filter((t) => {
    return (
      (filterProject === '' || t.projectName.toLowerCase().includes(filterProject.toLowerCase())) &&
      (filterResource === '' || t.resource.toLowerCase().includes(filterResource.toLowerCase())) &&
      (filterDate === '' || t.dateRange.includes(filterDate))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Timesheets</h2>
        <Button onClick={() => console.log('Create timesheet clicked')}>
          <Plus className="mr-2 h-4 w-4" /> Create Timesheet
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by Project name"
              className="pl-9"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by Resource"
              className="pl-9"
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
            />
          </div>
          <div className="relative flex-1">
            <Input
              type="date"
              placeholder="Filter by Date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Date Range</th>
                <th className="px-4 py-3 font-medium">Client Name</th>
                <th className="px-4 py-3 font-medium">Project Name</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">Total Time</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTimesheets.length > 0 ? (
                filteredTimesheets.map((ts) => (
                  <tr key={ts.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">{ts.dateRange}</td>
                    <td className="px-4 py-3">{ts.clientName}</td>
                    <td className="px-4 py-3 font-medium">{ts.projectName}</td>
                    <td className="px-4 py-3">{ts.resource}</td>
                    <td className="px-4 py-3">{ts.totalTime}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        View/Edit
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No timesheet created
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
