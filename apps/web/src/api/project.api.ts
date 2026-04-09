import axiosInstance from './axios-instance';

const createProject = async (data: any) => {
  const payload = {
    name: data.name,
    clientName: data.client,
    description: String(data.hours || ''),
    documentLink: data.docLink,
    commencementDate: new Date(data.date).toISOString(),
    projectStatus: data.status.toUpperCase(),
    milestones: data.milestones?.map((m: any) => ({
      name: m.name,
      description: m.desc,
      hours: Number(m.hours) || 0,
    })),
    leadId: data.leadId,
  };

  const result = await axiosInstance.post('/projects/create', payload);
  return result.data;
};

const getAllProjects = async () => {
  const result = await axiosInstance.get('/projects/all');
  return result.data.map((p: any) => ({
    id: p.id,
    name: p.name,
    client: p.clientName,
    hours: p.description,
    docLink: p.documentLink,
    date: p.commencementDate.split('T')[0],
    status: p.projectStatus.charAt(0) + p.projectStatus.slice(1).toLowerCase(),
    milestones: p.milestones || [],
  }));
};

const updateProject = async (id: string, data: any) => {
  const payload = {
    name: data.name,
    clientName: data.client,
    description: String(data.hours || ''),
    documentLink: data.docLink,
    commencementDate: new Date(data.date).toISOString(),
    projectStatus: data.status.toUpperCase(),
    milestones: data.milestones?.map((m: any) => ({
      milestoneName: m.milestoneName,
      milestoneDescription: m.milestoneDescription,
      estimatedHours: Number(m.estimatedHours) || 0,
    })),
  };

  const result = await axiosInstance.patch(`/projects/${id}`, payload);
  return result.data;
};

export const PROJECT_API = {
  createProject,
  getAllProjects,
  updateProject,
};
