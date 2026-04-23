import axiosInstance from './axios-instance';

const createLead = async (data: any) => {
  const payload = {
    clientName: data.client,
    projectName: data.projectName || undefined,
    links: data.docs ? [data.docs] : undefined,
    leadStatus: data.status.toUpperCase(),
  };

  const result = await axiosInstance.post('/leads/create', payload);
  return result.data;
};

const getAllLeads = async () => {
  const result = await axiosInstance.get('/leads/all');
  return result.data.map((l: any) => ({
    id: l.id,
    client: l.clientName,
    projectName: l.projectName,
    docs: l.links?.join(', ') || '',
    status: l.leadStatus.charAt(0) + l.leadStatus.slice(1).toLowerCase(),
    createdAt: new Date(l.createdAt).toLocaleDateString(),
    convertedAt: l.leadStatus === 'CONVERTED' ? new Date(l.updatedAt).toLocaleDateString() : undefined,
    projectId: l.projectId,
    createdById: l.createdById,
  }));
};

const updateLeadStatus = async (id: string, status: string) => {
  const payload = {
    leadStatus: status.toUpperCase(),
  };

  const result = await axiosInstance.patch(`/leads/${id}`, payload);
  return result.data;
};

const updateLeadDetails = async (id: string, data: any) => {
  const payload = {
    clientName: data.client,
    projectName: data.projectName || undefined,
    links: data.docs ? [data.docs] : undefined,
  };

  const result = await axiosInstance.patch(`/leads/${id}`, payload);
  return result.data;
};

export const LEAD_API = {
  createLead,
  getAllLeads,
  updateLeadStatus,
  updateLeadDetails,
};
