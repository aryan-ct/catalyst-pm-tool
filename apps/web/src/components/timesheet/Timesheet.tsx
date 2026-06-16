import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreVertical, Eye, Download } from 'lucide-react';
import { TimesheetAPI } from '@/api/timesheet.api';
import CreateTimesheetModal from './CreateTimesheetModal';
import ViewEditTimesheetModal from './ViewEditTimesheetModal';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import * as XLSX from 'xlsx';

export default function Timesheet() {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [filterProject, setFilterProject] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTimesheetId, setSelectedTimesheetId] = useState<string | null>(null);

  const fetchTimesheets = async () => {
    try {
      const data = await TimesheetAPI.getAllTimesheets();
      setTimesheets(data);
    } catch (error) {
      console.error('Failed to fetch timesheets', error);
    }
  };

  const handleExport = (ts: any) => {
    const exportData = [
      {
        'Created On': ts.createdAt ? new Date(ts.createdAt).toLocaleDateString() : '—',
        'Date Range': `${new Date(ts.startDate).toLocaleDateString()} – ${new Date(ts.endDate).toLocaleDateString()}`,
        'Project': ts.project?.name || ts.projectId,
        'Resource': ts.resource?.name || ts.resourceId,
        'Total Hours': `${ts.totalHours ?? 0} hrs`,
        'Time Logs': `${ts.timeLogs?.length ?? 0} entries`,
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timesheet');

    const projectName = ts.project?.name || 'Project';
    const resourceName = ts.resource?.name || 'Resource';
    const startDate = new Date(ts.startDate).toLocaleDateString().replace(/\//g, '-');
    const endDate = new Date(ts.endDate).toLocaleDateString().replace(/\//g, '-');
    
    XLSX.writeFile(workbook, `Timesheet_${projectName}_${resourceName}_${startDate}_to_${endDate}.xlsx`);
  };

  React.useEffect(() => {
    fetchTimesheets();
  }, []);

  const filteredTimesheets = timesheets.filter((t) => {
    const projName = t.project?.name || '';
    const resName = t.resource?.name || '';
    const createdDateString = t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '';
    
    return (
      (filterProject === '' || projName.toLowerCase().includes(filterProject.toLowerCase())) &&
      (filterResource === '' || resName.toLowerCase().includes(filterResource.toLowerCase())) &&
      (filterDate === '' || createdDateString === filterDate)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Timesheets</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Timesheet
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by Project"
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
                <th className="px-4 py-3 font-medium">Created On</th>
                <th className="px-4 py-3 font-medium">Date Range</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">Total Hours</th>
                <th className="px-4 py-3 font-medium">Time Logs</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTimesheets.length > 0 ? (
                filteredTimesheets.map((ts) => (
                  <tr key={ts.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-muted-foreground">
                      {ts.createdAt ? new Date(ts.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {`${new Date(ts.startDate).toLocaleDateString()} – ${new Date(ts.endDate).toLocaleDateString()}`}
                    </td>
                    <td className="px-4 py-3 font-medium">{ts.project?.name || ts.projectId}</td>
                    <td className="px-4 py-3">{ts.resource?.name || ts.resourceId}</td>
                    <td className="px-4 py-3">{ts.totalHours ?? 0} hrs</td>
                    <td className="px-4 py-3 text-muted-foreground">{ts.timeLogs?.length ?? 0} entries</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => setSelectedTimesheetId(ts.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View / Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(ts)}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No timesheets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateTimesheetModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchTimesheets}
      />

      {selectedTimesheetId && (
        <ViewEditTimesheetModal
          timesheetId={selectedTimesheetId}
          onClose={() => {
            setSelectedTimesheetId(null);
            fetchTimesheets();
          }}
        />
      )}
    </div>
  );
}
