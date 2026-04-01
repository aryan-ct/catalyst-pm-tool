import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateSubtaskDto, UpdateSubtaskDto } from './dto/subtask.dto';
import { SubtaskService } from './subtask.service';
import { Roles, UserRole } from '../../decorators/roles.decorator';

@Controller('subtask')
export class SubtaskController {
  constructor(private readonly subtaskService: SubtaskService) {}

  @Get()
  async getSubtasks() {
    return;
  }

  @Roles(UserRole.DEV, UserRole.TESTER, UserRole.MANAGER)
  @Post('/:task_id')
  async createSubtask(
    @Param('task_id') task_id: string,
    @Body() createSubtaskDto: CreateSubtaskDto,
  ) {
    return this.subtaskService.create(task_id, createSubtaskDto);
  }

  @Roles(UserRole.DEV, UserRole.TESTER, UserRole.MANAGER)
  @Patch('/:subtask_id')
  async updateSubtask(
    @Param('subtask_id') subtask_id: string,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
  ) {
    return this.subtaskService.update(subtask_id, updateSubtaskDto);
  }
}
