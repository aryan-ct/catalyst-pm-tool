import axiosInstance from './axios-instance';

const createMilestone = async (projectId: string, data: {
  milestoneName: string;
  milestoneDescription: string;
  estimatedHours: number;
  bugSheet?: string;
}) => {
  const result = await axiosInstance.post(`/milestones/create/${projectId}`, {
    milestoneName: data.milestoneName,
    milestoneDescription: data.milestoneDescription,
    estimatedHours: data.estimatedHours,
    bugSheet: data.bugSheet || undefined,
  });
  return result.data;
};

const updateMilestone = async (id: string, data: {
  milestoneName?: string;
  milestoneDescription?: string;
  estimatedHours?: number;
  bugSheet?: string;
}) => {
  const result = await axiosInstance.patch(`/milestones/${id}`, data);
  return result.data;
};

export const MILESTONE_API = { createMilestone, updateMilestone };
