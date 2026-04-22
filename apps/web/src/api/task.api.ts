import axiosInstance from './axios-instance';

const statusToBackend: Record<string, string> = {
  'todo': 'TODO',
  'in-progress': 'IN_PROGRESS',
  'in-review': 'IN_REVIEW',
  'done': 'DONE',
};

const createTask = async (milestoneId: string, data: {
  title: string;
  description: string;
  estimatedHours: number;
  taskStatus?: string;
}) => {
  const result = await axiosInstance.post(`/task/${milestoneId}`, {
    title: data.title,
    description: data.description,
    estimatedHours: data.estimatedHours,
    actualHours: 0,
    taskStatus: data.taskStatus ? statusToBackend[data.taskStatus] ?? data.taskStatus : 'TODO',
  });
  return result.data;
};

const updateTask = async (taskId: string, data: {
  title?: string;
  description?: string;
  estimatedHours?: number;
  taskStatus?: string;
  milestoneId: string;
}) => {
  const payload: Record<string, unknown> = { milestoneId: data.milestoneId };
  if (data.title !== undefined) payload['title'] = data.title;
  if (data.description !== undefined) payload['description'] = data.description;
  if (data.estimatedHours !== undefined) payload['estimatedHours'] = data.estimatedHours;
  if (data.taskStatus !== undefined) {
    payload['taskStatus'] = statusToBackend[data.taskStatus] ?? data.taskStatus;
  }

  const result = await axiosInstance.patch(`/task/${taskId}`, payload);
  return result.data;
};

const deleteTask = async (taskId: string) => {
  const result = await axiosInstance.delete(`/task/${taskId}`);
  return result.data;
};

export const TASK_API = { createTask, updateTask, deleteTask };
