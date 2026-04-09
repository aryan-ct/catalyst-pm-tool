import SingleBoard from "./single-board";

const ProjectManagementTasksBoard = () => {
  const boards = [
    { name: 'To Do', createdAt: new Date(), tasks: [] },
    { name: 'In Progress', createdAt: new Date(), tasks: [] },
    { name: 'In Review', createdAt: new Date(), tasks: [] },
    { name: 'Done', createdAt: new Date(), tasks: [] },
  ];
  return <div className="h-full rounded-2xl flex items-center mt-4 gap-3">
    {boards.map((board,index)=>(
        <SingleBoard key={index} board={board}/>
    ))}
  </div>;
};

export default ProjectManagementTasksBoard;
