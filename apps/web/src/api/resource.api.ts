import { Roles } from '@/lib/enum';
import axiosInstance from './axios-instance';

export type Resource = {
  name: string;
  role: Roles | null;
  email: string;
  isActive: boolean;
};

export type UpdateResource = {
  name?: string;
  role?: Roles | null;
  email: string;
  isActive?: boolean;
};

const findMe = async () => {
  const response = await axiosInstance.get('/resources/me');
  return response.data;
}

const createResource = async (createResourceData: Resource) => {
  const result = await axiosInstance.post('/resources/create', {
    ...createResourceData,
    password: import.meta.env.VITE_DEFAULT_USER_PASSWORD,
  });
  return result.data;
};

const updateResource = async (
  id: string,
  updateResourceData: UpdateResource,
) => {
  const result = await axiosInstance.patch(
    `/resources/update/${id}`,
    updateResourceData,
  );
  return result.data;
};

const findAllResources = async () => {
  const response = await axiosInstance.get('/resources/all');
  return response.data;
};

export const RESOURCE_API = {
  createResource,
  updateResource,
  findAllResources,
  findMe
};
