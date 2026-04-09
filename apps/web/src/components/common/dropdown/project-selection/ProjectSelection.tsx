import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import ProjectCommandItems from "./ProjectCommandItems";
import { ProjectorIcon } from "lucide-react";

export type Project ={
    id:string;
    name:string;
    createdAt:Date;
    tasks:string[];
};

export const projects:Project[]=[
    {id:"1",
        name:"Project 1",
        createdAt:new Date(),
        tasks:[]
    },
     {id:"2",
        name:"Project 2",
        createdAt:new Date(),
        tasks:[]
    }
];

export default function ProjectSelectionDropDown(){
    const [selectedProject,setSelectedProject]=useState<Project>(projects[0]);
    return (
       <Popover>
        <PopoverTrigger>
            <Button className="w-full flex justify-between py-9 rounded-xl bg-gray-50">
                <div className="flex items-start flex-col text-[16px] gap-1">
                    <p className="text-[13px] text-slate-500">PROJECT</p>
                    <p className="font-bold text-black">{selectedProject.name}</p>
                </div>
                <div className="size-10 bg-primary rounded-full flex items-center justify-center text-2xl text-white">
                <ProjectorIcon/>
                </div>
            </Button>
        </PopoverTrigger>
        <PopoverContent>
            <ProjectCommandItems selectedProject={selectedProject} 
            setSelectedProject={setSelectedProject}/>
        </PopoverContent>
       </Popover>
    )
}