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
      milestoneName: m.milestoneName,
      milestoneDescription: m.milestoneDescription,
      estimatedHours: Number(m.estimatedHours) || 0,
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
  const payload: Record<string, unknown> = {
    name: data.name,
    clientName: data.client,
    description: String(data.hours || ''),
    commencementDate: new Date(data.date).toISOString(),
    projectStatus: data.status.toUpperCase(),
  };

  if (data.docLink) {
    payload['documentLink'] = data.docLink;
  }

  const result = await axiosInstance.patch(`/projects/${id}`, payload);
  return result.data;
};

const statusToFrontend = (s: string): string => {
  const map: Record<string, string> = {
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    IN_REVIEW: 'in-review',
    DONE: 'done',
  };
  return map[s] ?? 'todo';
};

const getProjectsForPM = async () => {
  const result = await axiosInstance.get('/projects/all');
  return result.data.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description || '',
    milestones: (p.milestones || []).map((m: any) => ({
      id: m.id,
      milestoneName: m.milestoneName,
      milestoneDescription: m.milestoneDescription,
      estimatedHours: m.estimatedHours,
      bugSheet: m.bugSheet || '',
      tasks: (m.tasks || []).map((t: any) => ({
        id: t.id,
        milestoneName: t.title,
        milestoneDescription: t.description,
        estimatedHours: t.estimatedHours,
        bugSheet: '',
        status: statusToFrontend(t.taskStatus),
        milestoneId: m.id,
        tasks: (t.subTasks || []).map((st: any) => ({
          id: st.id,
          title: st.title,
          taskType: (st.taskType as string).toLowerCase(),
        })),
      })),
    })),
  }));
};

export const PROJECT_API = {
  createProject,
  getAllProjects,
  updateProject,
  getProjectsForPM,
};
