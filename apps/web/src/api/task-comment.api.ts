import axiosInstance from './axios-instance';

export type TaskComment = {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
};

const getComments = async (taskId: string): Promise<TaskComment[]> => {
  const result = await axiosInstance.get(`/task/${taskId}/comments`);
  return result.data;
};

const addComment = async (
  taskId: string,
  content: string,
): Promise<TaskComment> => {
  const result = await axiosInstance.post(`/task/${taskId}/comments`, {
    content,
  });
  return result.data;
};

const updateComment = async (
  commentId: string,
  content: string,
): Promise<TaskComment> => {
  const result = await axiosInstance.patch(`/task/comments/${commentId}`, {
    content,
  });
  return result.data;
};

const deleteComment = async (commentId: string) => {
  const result = await axiosInstance.delete(`/task/comments/${commentId}`);
  return result.data;
};

export const TASK_COMMENT_API = {
  getComments,
  addComment,
  updateComment,
  deleteComment,
};
