import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TaskCommentService } from './task-comment.service';
import { CreateTaskCommentDto, UpdateTaskCommentDto } from './dto/task-comment.dto';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller('task')
export class TaskCommentController {
  constructor(private readonly taskCommentService: TaskCommentService) {}

  @Get(':taskId/comments')
  async getComments(@Param('taskId') taskId: string) {
    return this.taskCommentService.findAllByTask(taskId);
  }

  @Post(':taskId/comments')
  async addComment(
    @Param('taskId') taskId: string,
    @CurrentUser('id') authorId: string,
    @Body() dto: CreateTaskCommentDto,
  ) {
    return this.taskCommentService.create(taskId, authorId, dto);
  }

  @Patch('comments/:commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @CurrentUser('id') authorId: string,
    @Body() dto: UpdateTaskCommentDto,
  ) {
    return this.taskCommentService.update(commentId, authorId, dto);
  }

  @Delete('comments/:commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser('id') authorId: string,
  ) {
    return this.taskCommentService.remove(commentId, authorId);
  }
}
