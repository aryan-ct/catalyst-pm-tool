import axiosInstance from './axios-instance';

const getAllResourceAllocations = async (params?: any) => {
  const result = await axiosInstance.get('resource-allocations', { params });
  return result.data;
};

const createResourceAllocations = async (data: any[]) => {
  const result = await axiosInstance.post('resource-allocations/create', data);
  return result.data;
};

const getMyAllocations = async (params?: any) => {
  const result = await axiosInstance.get('resource-allocations/me', { params });
  return result.data;
};

export const RESOURCE_ALLOCATIONS_API = {
  getAllResourceAllocations,
  createResourceAllocations,
  getMyAllocations,
};
