// import { Button } from '@/components/ui/button'

// const ProjectManagementHeader = () => {
//   return (
//     <div className='flex justify-between items-center'>
//         <div className='flex gap-3 items-center'>
//             <span className='text-2xl font-bold'> Projects</span>
//         </div>
//         <div className='flex items-center gap-2'>
//             <Button className="rounded-3xl px-4">Add Task</Button>
//         </div>
//     </div>
//   )
// }

// export default ProjectManagementHeader


import { useState } from "react";
import { Button } from "@/components/ui/button";
import TaskDialog from "@/components/common/window-dialogs/task-dialog";

const ProjectManagementHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <span className="text-2xl font-bold">Projects</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="rounded-3xl px-4"
            onClick={() => setOpen(true)}
          >
            Add Task
          </Button>
        </div>
      </div>

      <TaskDialog open={open} setOpen={setOpen} />
    </>
  );
};

export default ProjectManagementHeader;