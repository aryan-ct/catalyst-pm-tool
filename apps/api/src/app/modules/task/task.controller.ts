import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/task.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getTasks() {
    return;
  }

  @Post('/:milestone_id')
  async createTask(
    @Param('milestone_id') milestone_id: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.taskService.create(milestone_id, createTaskDto);
  }

  @Patch()
  async updateTask() {
    return;
  }
}
