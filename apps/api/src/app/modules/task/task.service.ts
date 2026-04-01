import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../../config/prima.config';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TaskService {
  async getTasks() {
    return prisma.task.findMany();
  }

  async create(milestone_id: string, createTaskDto: CreateTaskDto) {
    const milestone = await prisma.milestone.findUnique({
      where: {
        id: milestone_id,
      },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found.');
    }
    const createdTask = await prisma.task.create({
      data: { ...createTaskDto, milestoneId: milestone_id },
    });

    return createdTask;
  }

  async update(task_id: string, updateTaskDto: UpdateTaskDto) {
    const task = await prisma.task.findUnique({
      where: {
        id: task_id,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: task_id,
      },
      data: { ...updateTaskDto },
    });
    return updatedTask;
  }
}
