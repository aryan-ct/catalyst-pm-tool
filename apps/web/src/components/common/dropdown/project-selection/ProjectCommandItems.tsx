import { Dispatch, SetStateAction } from "react";
import { Project, projects } from "./ProjectSelection"
import { Command, CommandEmpty, CommandList } from "@/components/ui/command";
import { CommandInput } from "cmdk";
import SingleProjectCommandItem from "./SingleProjectCommandItem";


const ProjectCommandItems = ({selectedProject,setSelectedProject}:{
    selectedProject:Project;
    setSelectedProject:Dispatch<SetStateAction<Project>>;
}) => {
function handleProjectSelect(project:Project){
    setSelectedProject(project);
}

  return (
    <Command>
        <CommandInput placeholder="Search a project"/>
        <CommandList className="my-3">
            <CommandEmpty>No results found</CommandEmpty>
        </CommandList>
        <div className="flex flex-col gap-3">
            {projects.map((project,index)=>(
                <SingleProjectCommandItem project={project}
                key={index}
                onSelectedItem={handleProjectSelect}
                isSelected={selectedProject.name===project.name}/>
            ))}
        </div>
    </Command>
  )
}

export default ProjectCommandItems