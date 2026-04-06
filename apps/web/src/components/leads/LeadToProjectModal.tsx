import ProjectModal from '../projects/ProjectModal';

export default function LeadToProjectModal({
  lead,
  setLeads,
  setProjects,
  onClose,
}: any) {
  const handleConvert = (projectData: any) => {
    setProjects((prev: any[]) => [...prev, projectData]);
    setLeads((prev: any[]) =>
      prev.map((l, i) =>
        i === lead.index
          ? {
              ...l,
              status: 'Converted',
              convertedAt: new Date().toLocaleString(),
            }
          : l,
      ),
    );

    onClose();
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
