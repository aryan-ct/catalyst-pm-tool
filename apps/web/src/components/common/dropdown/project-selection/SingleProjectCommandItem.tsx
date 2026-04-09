import { CheckCheckIcon } from "lucide-react";
import { Project, projects } from "./ProjectSelection"
import {  CommandItem } from "@/components/ui/command";

const SingleProjectCommandItem = ({project,isSelected,onSelectedItem}:{
    project:Project;
    isSelected:boolean;
    onSelectedItem:(project:Project)=>void;
}) => {
    // const {name:projectName,tasks,icon:ProjectIcon}=project;
    const {name:projectName,tasks}=project;
  return (
    <CommandItem value={projectName}
    onSelect={(value:string)=>{
        const findProject=projects.find((proj)=>proj.name===value);
        if(findProject){
            onSelectedItem(findProject);
        }
    }}
    className="cursor-pointer hover:bg-gray-100 rounded-lg p-2">
        <div className="flex items-center justify-between w-full">
           {/* <div className="size-8 bg-primary flex items-center rounded-md text-white"> */}
{/* <ProjectIcon/> */}
           {/* </div> */}
           <div className="flex flex-col">
               <span className="font-medium">{projectName}</span>
               <span className="text-[12px] text-gray-500">{tasks.length}</span>
           </div>
        </div>

        {isSelected && (
            <div className="text-primary">
         <CheckCheckIcon size={12}/>
            </div>
        )}
    </CommandItem>
  )
}

export default SingleProjectCommandItem