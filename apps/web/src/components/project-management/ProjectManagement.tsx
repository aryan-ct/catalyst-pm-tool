import { Card } from '../ui/card'
import ProjectManagementHeader from './project-management-header/ProjectManagementHeader'
import ProjectManagementTasksBoard from './project-management-tasks-board/ProjectManagementTasksBoard'
import RightSideBar from './right-side-bar/RightSideBar'

const ProjectManagement = () => {
  return (
    <div className='grid grid-cols-[3fr_1fr] px-6 mt-8 gap-4'>
        <Card className='shadow-none p-7 rounded-3xl px-7 flex flex-col gap-8'>
            <ProjectManagementHeader/>
            <ProjectManagementTasksBoard/>
        </Card>
           <RightSideBar/>
    </div>
  )
}

export default ProjectManagement