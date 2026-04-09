import { PROJECT_API } from '../../api/project.api';
import ProjectModal from '../projects/ProjectModal';

export default function LeadToProjectModal({
  lead,
  onSuccess,
  setProjects,
  onClose,
}: any) {
  const handleConvert = async (projectData: any) => {
    try {
      // Lead is already converted, no need to update status

      // Inject leadId so the backend enforces 1:1 project creation constraint
      const payload = { ...projectData, leadId: lead.id };

      // Create the new project in the backend
      const createdProject = await PROJECT_API.createProject(payload);

      if (onSuccess) onSuccess();

      // Also update parent projects state/callback (if setProjects exists) or refetch
      if (setProjects) {
        setProjects((prev: any[]) => [...prev, createdProject || projectData]);
      }
      onClose();
    } catch (err) {
      console.error('Failed to convert lead to project:', err);
    }
  };

  return (
    <ProjectModal
      setProjects={setProjects}
      prefill={{
        name: lead.projectName || '',
        client: lead.client,
      }}
      onSubmitOverride={handleConvert}
      isControlled
    />
  );
}
