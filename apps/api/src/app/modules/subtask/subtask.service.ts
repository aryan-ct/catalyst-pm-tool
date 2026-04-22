import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubtaskDto, UpdateSubtaskDto } from './dto/subtask.dto';
import { prisma } from '../../config/prima.config';

@Injectable()
export class SubtaskService {

  async getSubtasks(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task not found with id ${taskId}`);
    }

    const subtasks = await prisma.subTask.findMany({
      where: {
        taskId,
      },
    });

    return subtasks;
  }

  async create(task_id: string, createSubtaskDto: CreateSubtaskDto) {
    const task = await prisma.task.findUnique({
      where: {
        id: task_id,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    const createdSubtask = await prisma.subTask.create({
      data: { ...createSubtaskDto, taskId: task_id },
    });

    return createdSubtask;
  }

  async update(subtaskId: string, updateSubtaskDto: UpdateSubtaskDto) {
    const subtask = await prisma.subTask.update({
      where: { id: subtaskId },
      data: { ...updateSubtaskDto },
    });

    return subtask;
  }

  async delete(subtaskId: string) {
    await prisma.subTask.delete({ where: { id: subtaskId } });
    return { message: 'Subtask deleted successfully' };
  }
}
