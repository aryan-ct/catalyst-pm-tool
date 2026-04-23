import axios from 'axios';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_BE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

const getEntityName = (url: string = '') => {
  if (url.includes('/leads')) return 'Lead';
  if (url.includes('/projects')) return 'Project';
  if (url.includes('/resources')) return 'Resource';
  if (url.includes('/tasks') || url.includes('/subtasks')) return 'Task';
  if (url.includes('/milestones')) return 'Milestone';
  if (url.includes('/resource-allocations')) return 'Allocation';
  return 'Record';
};

const getSuccessMessage = (config: any) => {
  const method = config.method?.toUpperCase();
  const entity = getEntityName(config.url);
  
  if (method === 'POST') return `${entity} created successfully.`;
  if (method === 'PATCH' || method === 'PUT') return `${entity} updated successfully.`;
  if (method === 'DELETE') return `${entity} deleted successfully.`;
  return 'Action completed successfully.';
};

const getErrorMessage = (error: any) => {
  const data = error.response?.data;
  if (data?.message) {
    return Array.isArray(data.message) ? data.message[0] : data.message;
  }
  if (error.message) return error.message;
  return 'An unexpected error occurred. Please try again.';
};

axiosInstance.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase();
    if (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
       toast.success(response.data?.message || getSuccessMessage(response.config));
    }
    return response;
  },
  (error) => {
    toast.error(getErrorMessage(error));
    return Promise.reject(error);
  }
);

export default axiosInstance;
