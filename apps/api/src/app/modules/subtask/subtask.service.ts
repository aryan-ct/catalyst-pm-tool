import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubtaskDto, UpdateSubtaskDto } from './dto/subtask.dto';
import { prisma } from '../../config/prima.config';
import { TaskService } from '../task/task.service';

@Injectable()
export class SubtaskService {
  constructor(private readonly taskService: TaskService) {}

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

  async create(createSubtaskDto: CreateSubtaskDto) {
    const createdSubtask = await prisma.subTask.create({
      data: { ...createSubtaskDto },
    });
    return createdSubtask;
  }

  async update(subtaskId: string, updateSubtaskDto: UpdateSubtaskDto) {
    const subtask = await prisma.subTask.update({
      where: {
        id: subtaskId,
      },
      data: { ...updateSubtaskDto },
    });

    return subtask;
  }
}
