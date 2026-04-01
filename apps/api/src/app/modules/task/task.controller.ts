import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { Roles, UserRole } from '../../decorators/roles.decorator';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Roles(UserRole.MANAGER, UserRole.DEV)
  @Get()
  async getTasks() {
    return this.taskService.getTasks();
  }

  @Roles(UserRole.DEV, UserRole.MANAGER)
  @Post('/:milestone_id')
  async createTask(
    @Param('milestone_id') milestone_id: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.taskService.create(milestone_id, createTaskDto);
  }

  @Roles(UserRole.DEV, UserRole.MANAGER)
  @Patch('/:task_id')
  async updateTask(
    @Param('task_id') task_id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(task_id, updateTaskDto);
  }
}
