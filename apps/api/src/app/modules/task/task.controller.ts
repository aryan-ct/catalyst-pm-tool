import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { Roles, UserRole } from '../../decorators/roles.decorator';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Roles(
    UserRole.MANAGER,
    UserRole.DEV,
    UserRole.TESTER,
    UserRole.HR,
    UserRole.JR_HR,
  )
  @Get()
  async getTasks() {
    return this.taskService.getTasks();
  }

  @Roles(
    UserRole.MANAGER,
    UserRole.DEV,
    UserRole.TESTER,
    UserRole.HR,
    UserRole.JR_HR,
  )
  @Post('/:milestone_id')
  async createTask(
    @Param('milestone_id') milestone_id: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.taskService.create(milestone_id, createTaskDto);
  }

  @Roles(
    UserRole.MANAGER,
    UserRole.DEV,
    UserRole.TESTER,
    UserRole.HR,
    UserRole.JR_HR,
  )
  @Patch('/:task_id')
  async updateTask(
    @Param('task_id') task_id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(task_id, updateTaskDto);
  }

  @Roles(UserRole.MANAGER, UserRole.HR, UserRole.JR_HR)
  @Delete('/:task_id')
  async deleteTask(@Param('task_id') task_id: string) {
    return this.taskService.delete(task_id);
  }
}
