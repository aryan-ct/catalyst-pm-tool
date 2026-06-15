import axiosInstance from './axios-instance';

export interface TimeLogItem {
  date: string;
  taskTitle: string;
  taskDescription?: string;
  workingHours: number;
}

export const TimesheetAPI = {
  createTimesheet: async (data: {
    startDate: string;
    endDate: string;
    projectId: string;
    resourceId: string;
    totalHours?: number;
    logs?: TimeLogItem[];
  }) => {
    const response = await axiosInstance.post('/timesheet', data);
    return response.data;
  },

  getAllTimesheets: async () => {
    const response = await axiosInstance.get('/timesheet');
    return response.data;
  },

  getTimesheetById: async (id: string) => {
    const response = await axiosInstance.get(`/timesheet/${id}`);
    return response.data;
  },

  getTimesheetLogs: async (projectId: string, resourceId: string, startDate: string, endDate: string) => {
    const response = await axiosInstance.get('/timesheet/logs', {
      params: { projectId, resourceId, startDate, endDate },
    });
    return response.data;
  },

  addTimeLog: async (timesheetId: string, data: TimeLogItem) => {
    const response = await axiosInstance.post(`/timesheet/${timesheetId}/logs`, data);
    return response.data;
  },

  updateTimeLog: async (logId: string, data: Partial<TimeLogItem>) => {
    const response = await axiosInstance.patch(`/timesheet/logs/${logId}`, data);
    return response.data;
  },

  deleteTimeLog: async (logId: string) => {
    const response = await axiosInstance.delete(`/timesheet/logs/${logId}`);
    return response.data;
  },
};
