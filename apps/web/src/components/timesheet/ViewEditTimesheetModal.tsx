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
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { TimesheetAPI } from '@/api/timesheet.api';
import ConfirmDeleteDialog from '@/components/confirmDeleteDialog/ConfirmDeleteDialog';

interface TimeLog {
  id: string;
  date: string;
  taskTitle: string;
  workingHours: number;
}

interface Timesheet {
  id: string;
  startDate: string;
  endDate: string;
  projectId: string;
  resourceId: string;
  totalHours: number;
  timeLogs: TimeLog[];
}

interface EditingRow {
  date: string;
  taskTitle: string;
  workingHours: string;
}

interface ViewEditTimesheetModalProps {
  timesheetId: string;
  onClose: () => void;
}

const emptyRow = (): EditingRow => ({
  date: '',
  taskTitle: '',
  workingHours: '',
});

export default function ViewEditTimesheetModal({
  timesheetId,
  onClose,
}: ViewEditTimesheetModalProps) {
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<EditingRow>(emptyRow());
  const [addingNew, setAddingNew] = useState(false);
  const [newRow, setNewRow] = useState<EditingRow>(emptyRow());
  const [saving, setSaving] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);

  const fetchTimesheet = async () => {
    try {
      const data = await TimesheetAPI.getTimesheetById(timesheetId);
      setTimesheet(data);
    } catch (error) {
      console.error('Failed to fetch timesheet', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheet();
  }, [timesheetId]);

  const startEdit = (log: TimeLog) => {
    setEditingLogId(log.id);
    setEditRow({
      date: log.date.slice(0, 10),
      taskTitle: log.taskTitle,
      workingHours: String(log.workingHours),
    });
    setAddingNew(false);
  };

  const cancelEdit = () => {
    setEditingLogId(null);
    setEditRow(emptyRow());
  };

  const saveEdit = async () => {
    if (!editingLogId) return;
    setSaving(true);
    try {
      await TimesheetAPI.updateTimeLog(editingLogId, {
        date: editRow.date,
        taskTitle: editRow.taskTitle,
        workingHours: parseFloat(editRow.workingHours),
      });
      setEditingLogId(null);
      await fetchTimesheet();
    } catch (error) {
      console.error('Failed to update log', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (logId: string) => {
    setDeleteLogId(logId);
  };

  const confirmDelete = async () => {
    if (!deleteLogId) return;
    try {
      await TimesheetAPI.deleteTimeLog(deleteLogId);
      await fetchTimesheet();
    } catch (error) {
      console.error('Failed to delete log', error);
    } finally {
      setDeleteLogId(null);
    }
  };

  const isWeekend = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const startAddNew = () => {
    setAddingNew(true);
    setNewRow(emptyRow());
    setEditingLogId(null);
  };

  const cancelAddNew = () => {
    setAddingNew(false);
    setNewRow(emptyRow());
  };

  const saveNewLog = async () => {
    if (!newRow.date || !newRow.taskTitle || !newRow.workingHours) return;
    setSaving(true);
    try {
      await TimesheetAPI.addTimeLog(timesheetId, {
        date: newRow.date,
        taskTitle: newRow.taskTitle,
        workingHours: parseFloat(newRow.workingHours),
      });
      setAddingNew(false);
      setNewRow(emptyRow());
      await fetchTimesheet();
    } catch (error) {
      console.error('Failed to add log', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none min-w-full m-0 rounded-none flex flex-col p-0">
        <DialogHeader className="px-8 py-5 border-b border-border shrink-0">
          <DialogTitle className="text-xl">
            {loading
              ? 'Loading...'
              : `Timesheet — ${new Date(timesheet!.startDate).toLocaleDateString()} to ${new Date(timesheet!.endDate).toLocaleDateString()}`}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : timesheet ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Summary bar */}
            <div className="px-8 py-4 border-b border-border bg-muted/30 flex flex-wrap gap-6 text-sm shrink-0">
              <div>
                <span className="text-muted-foreground mr-1">Project:</span>
                <span className="font-medium">
                  {(timesheet as any).project?.name || timesheet.projectId}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground mr-1">Resource:</span>
                <span className="font-medium">
                  {(timesheet as any).resource?.name || timesheet.resourceId}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground mr-1">Total Hours:</span>
                <span className="font-semibold text-primary">
                  {timesheet.totalHours ?? 0} hrs
                </span>
              </div>
              <div>
                <span className="text-muted-foreground mr-1">Entries:</span>
                <span className="font-medium">{timesheet.timeLogs.length}</span>
              </div>
            </div>

            {/* Logs table */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Time Logs</h3>
                <Button size="sm" onClick={startAddNew} disabled={addingNew}>
                  <Plus className="mr-1 h-4 w-4" /> Add Time Log
                </Button>
              </div>

              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground text-xs">
                    <tr>
                      <th className="px-4 py-3 w-36">Date</th>
                      <th className="px-4 py-3">Task Title</th>
                      <th className="px-4 py-3 w-32">Working Hours</th>
                      <th className="px-4 py-3 w-24 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timesheet.timeLogs.map((log) =>
                      editingLogId === log.id ? (
                        <tr
                          key={log.id}
                          className="border-t border-border bg-muted/20"
                        >
                          <td className="px-4 py-2">
                            <div className="flex flex-col gap-1">
                              <Input
                                type="date"
                                value={editRow.date}
                                onChange={(e) => {
                                  if (e.target.value && isWeekend(e.target.value)) return;
                                  setEditRow({ ...editRow, date: e.target.value });
                                }}
                                className="h-8 text-xs"
                              />
                              {editRow.date && (
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(editRow.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              value={editRow.taskTitle}
                              onChange={(e) =>
                                setEditRow({
                                  ...editRow,
                                  taskTitle: e.target.value,
                                })
                              }
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={editRow.workingHours}
                              onChange={(e) =>
                                setEditRow({
                                  ...editRow,
                                  workingHours: e.target.value,
                                })
                              }
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-green-600"
                                onClick={saveEdit}
                                disabled={saving}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground"
                                onClick={cancelEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr
                          key={log.id}
                          className="border-t border-border hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            {new Date(log.date).toLocaleDateString('en-US')} ({new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' })})
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {log.taskTitle}
                          </td>
                          <td className="px-4 py-3">{log.workingHours} hrs</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-primary"
                                onClick={() => startEdit(log)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive"
                                onClick={() => handleDelete(log.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}

                    {/* New row inline form */}
                    {addingNew && (
                      <tr className="border-t border-border bg-primary/5">
                        <td className="px-4 py-2">
                          <div className="flex flex-col gap-1">
                            <Input
                              type="date"
                              value={newRow.date}
                              onChange={(e) => {
                                if (e.target.value && isWeekend(e.target.value)) return;
                                setNewRow({ ...newRow, date: e.target.value });
                              }}
                              className="h-8 text-xs"
                            />
                            {newRow.date && (
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(newRow.date).toLocaleDateString('en-US', { weekday: 'long' })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            placeholder="Task title"
                            value={newRow.taskTitle}
                            onChange={(e) =>
                              setNewRow({
                                ...newRow,
                                taskTitle: e.target.value,
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="Hours"
                            value={newRow.workingHours}
                            onChange={(e) =>
                              setNewRow({
                                ...newRow,
                                workingHours: e.target.value,
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-green-600"
                              onClick={saveNewLog}
                              disabled={
                                saving ||
                                !newRow.date ||
                                !newRow.taskTitle ||
                                !newRow.workingHours
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground"
                              onClick={cancelAddNew}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {timesheet.timeLogs.length === 0 && !addingNew && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-10 text-center text-muted-foreground"
                        >
                          No time logs yet. Click "Add Time Log" to add one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-border shrink-0 flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Timesheet not found.
          </div>
        )}
      </DialogContent>

      <ConfirmDeleteDialog
        open={!!deleteLogId}
        onClose={() => setDeleteLogId(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this time log? This action cannot be undone."
        confirmText="Delete"
      />
    </Dialog>
  );
}
