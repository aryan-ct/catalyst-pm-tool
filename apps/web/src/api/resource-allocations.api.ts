import axiosInstance from './axios-instance';

const getAllResourceAllocations = async () => {
  const result = await axiosInstance.get('resource-allocations');
  return result.data;
};

export const RESOURCE_ALLOCATIONS_API = {
  getAllResourceAllocations,
};
