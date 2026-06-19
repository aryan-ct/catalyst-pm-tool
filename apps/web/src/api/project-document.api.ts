import axiosInstance from './axios-instance';

export type ProjectDocument = {
  id: string;
  title: string;
  link: string;
  projectId: string;
  createdAt: string;
};

const getDocuments = async (projectId: string): Promise<ProjectDocument[]> => {
  const result = await axiosInstance.get(`/projects/${projectId}/documents`);
  return result.data;
};

const addDocument = async (
  projectId: string,
  title: string,
  link: string,
): Promise<ProjectDocument> => {
  const result = await axiosInstance.post(`/projects/${projectId}/documents`, {
    title,
    link,
  });
  return result.data;
};

const updateDocument = async (
  projectId: string,
  documentId: string,
  title: string,
  link: string,
): Promise<ProjectDocument> => {
  const result = await axiosInstance.patch(
    `/projects/${projectId}/documents/${documentId}`,
    { title, link },
  );
  return result.data;
};

const deleteDocument = async (
  projectId: string,
  documentId: string,
): Promise<void> => {
  await axiosInstance.delete(`/projects/${projectId}/documents/${documentId}`);
};

export const PROJECT_DOCUMENT_API = {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
};
