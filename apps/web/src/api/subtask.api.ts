import axiosInstance from './axios-instance';

const createSubtask = async (taskId: string, data: { title: string; taskType: string }) => {
  const result = await axiosInstance.post(`/subtask/${taskId}`, {
    title: data.title,
    taskType: data.taskType.toUpperCase(),
  });
  return result.data;
};

const deleteSubtask = async (subtaskId: string) => {
  const result = await axiosInstance.delete(`/subtask/${subtaskId}`);
  return result.data;
};

export const SUBTASK_API = { createSubtask, deleteSubtask };
