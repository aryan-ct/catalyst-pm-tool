import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '../../config/prima.config';
import {
  CreateTaskCommentDto,
  UpdateTaskCommentDto,
} from './dto/task-comment.dto';

const authorSelect = { select: { id: true, name: true } };

@Injectable()
export class TaskCommentService {
  async findAllByTask(taskId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    return prisma.taskComment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      include: { author: authorSelect },
    });
  }

  async create(taskId: string, authorId: string, dto: CreateTaskCommentDto) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    return prisma.taskComment.create({
      data: { taskId, authorId, content: dto.content },
      include: { author: authorSelect },
    });
  }

  async update(
    commentId: string,
    authorId: string,
    dto: UpdateTaskCommentDto,
  ) {
    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return prisma.taskComment.update({
      where: { id: commentId },
      data: { content: dto.content },
      include: { author: authorSelect },
    });
  }

  async remove(commentId: string, authorId: string) {
    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await prisma.taskComment.delete({ where: { id: commentId } });
    return { success: true };
  }
}
