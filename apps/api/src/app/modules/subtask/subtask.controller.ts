import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateSubtaskDto, UpdateSubtaskDto } from './dto/subtask.dto';
import { SubtaskService } from './subtask.service';

@Controller('subtask')
export class SubtaskController {
  constructor(private readonly subtaskService: SubtaskService) {}

  @Get()
  async getSubtasks() {
    return;
  }

  @Post()
  async createSubtask(@Body() createSubtaskDto: CreateSubtaskDto) {
    return this.subtaskService.create(createSubtaskDto);
  }

  @Patch('/:subtask_id')
  async updateSubtask(
    @Param('subtask_id') subtask_id: string,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
  ) {
    return this.subtaskService.update(subtask_id, updateSubtaskDto);
  }
}
