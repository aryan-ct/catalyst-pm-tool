import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { TimesheetAPI } from '@/api/timesheet.api';
import { PROJECT_API } from '@/api/project.api';
import { RESOURCE_API } from '@/api/resource.api';

interface CreateTimesheetModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTimesheetModal({
  open,
  onClose,
  onSuccess,
}: CreateTimesheetModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [resourceId, setResourceId] = useState('');

  const [projects, setProjects] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);

  const [logs, setLogs] = useState<any[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      PROJECT_API.getAllProjects().then((data: any) =>
        setProjects(Array.isArray(data) ? data : data.projects || []),
      );
      RESOURCE_API.findAllResources().then((data: any) =>
        setResources(Array.isArray(data) ? data : data.resources || []),
      );
    } else {
      setStartDate('');
      setEndDate('');
      setProjectId('');
      setResourceId('');
      setLogs([]);
      setTotalHours(0);
    }
  }, [open]);

  useEffect(() => {
    if (startDate && endDate && projectId && resourceId) {
      fetchLogs();
    } else {
      setLogs([]);
      setTotalHours(0);
    }
  }, [startDate, endDate, projectId, resourceId]);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await TimesheetAPI.getTimesheetLogs(
        projectId,
        resourceId,
        startDate,
        endDate,
      );
      const editableLogs = data.map((log: any) => ({
        id: log.id || Math.random().toString(36).substr(2, 9),
        date: log.date.split('T')[0],
        taskTitle: log.taskTitle || '',
        workingHours: log.actualHours || 0,
      }));
      setLogs(editableLogs);
      recalculateTotal(editableLogs);
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const recalculateTotal = (currentLogs: any[]) => {
    const total = currentLogs.reduce(
      (acc: number, log: any) => acc + (Number(log.workingHours) || 0),
      0,
    );
    setTotalHours(total);
  };

  const handleLogChange = (id: string, field: string, value: string | number) => {
    if (field === 'date' && typeof value === 'string' && value && isWeekend(value)) {
      return; // Disable Sat/Sun selection
    }
    setLogs((prevLogs) => {
      const updated = prevLogs.map((log) =>
        log.id === id ? { ...log, [field]: value } : log,
      );
      if (field === 'workingHours') {
        recalculateTotal(updated);
      }
      return updated;
    });
  };

  const addNewLog = () => {
    setLogs((prevLogs) => {
      const updated = [
        ...prevLogs,
        {
          id: Math.random().toString(36).substr(2, 9),
          date: startDate || new Date().toISOString().split('T')[0],
          taskTitle: '',
          workingHours: 0,
        },
      ];
      return updated;
    });
  };

  const removeLog = (id: string) => {
    setLogs((prevLogs) => {
      const updated = prevLogs.filter((log) => log.id !== id);
      recalculateTotal(updated);
      return updated;
    });
  };

  const isWeekend = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await TimesheetAPI.createTimesheet({
        startDate,
        endDate,
        projectId,
        resourceId,
        totalHours,
        logs: logs.map((log) => ({
          date: new Date(log.date).toISOString(),
          taskTitle: log.taskTitle || 'General Task',
          workingHours: Number(log.workingHours) || 0,
        })),
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create timesheet', error);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    !!(startDate && endDate && projectId && resourceId) && !submitting;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-full w-full min-w-full h-full m-0 rounded-none flex flex-col p-0 pb-4">
        <DialogHeader className="px-8 py-5 border-b border-border shrink-0">
          <DialogTitle className="text-xl">Create Timesheet</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left panel — form inputs */}
          <div className="w-80 shrink-0 border-r border-border px-8 py-6 space-y-5 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Resource</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
              >
                <option value="">Select Resource</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {totalHours > 0 && (
              <div className="bg-primary/10 text-primary px-4 py-3 rounded-lg text-sm font-medium">
                Total Hours: {totalHours} hrs
              </div>
            )}
          </div>

          {/* Right panel — logs table */}
          <div className="flex-1 px-8 py-6 overflow-y-auto">
            {!startDate || !endDate || !projectId || !resourceId ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Fill in all fields on the left to add time logs.
              </div>
            ) : loadingLogs ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Loading logs...
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold">Time Logs</h3>
                  <Button size="sm" onClick={addNewLog}>
                    <Plus className="mr-1 h-4 w-4" /> Add Row
                  </Button>
                </div>
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground text-xs">
                      <tr>
                        <th className="px-4 py-3 w-36">Date</th>
                        <th className="px-4 py-3">Task Title</th>
                        <th className="px-4 py-3 w-28">Hours</th>
                        <th className="px-4 py-3 w-16 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length > 0 ? (
                        logs.map((log) => (
                          <tr key={log.id} className="border-t border-border">
                            <td className="px-4 py-2">
                              <div className="flex flex-col gap-1">
                                <Input
                                  type="date"
                                  value={log.date}
                                  onChange={(e) =>
                                    handleLogChange(log.id, 'date', e.target.value)
                                  }
                                  className="h-8 text-xs"
                                />
                                {log.date && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                value={log.taskTitle}
                                placeholder="Task Title"
                                onChange={(e) =>
                                  handleLogChange(log.id, 'taskTitle', e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                value={log.workingHours}
                                onChange={(e) =>
                                  handleLogChange(log.id, 'workingHours', e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive"
                                onClick={() => removeLog(log.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-muted-foreground"
                          >
                            No logs found for this selection. Add a row to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="px-8 py-4 border-t border-border shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || logs.some(l => !l.date || !l.taskTitle)}>
            {submitting ? 'Creating...' : 'Create Timesheet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
