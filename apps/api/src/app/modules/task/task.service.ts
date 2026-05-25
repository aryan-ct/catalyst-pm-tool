import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../../config/prima.config';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';


@Injectable()
export class TaskService {
  async getTasks() {
    return prisma.task.findMany({ include: { subTasks: true } });
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
    
    const { assignedTo, ...restDto } = createTaskDto;
    const data: any = { ...restDto, milestoneId: milestone_id };
    if (assignedTo && assignedTo.length > 0) {
      data.assignedTo = { connect: assignedTo.map((id) => ({ id })) };
    }

    const createdTask = await prisma.task.create({
      data,
    });

    return createdTask;
  }

  async update(task_id: string, updateTaskDto: UpdateTaskDto) {
    const task = await prisma.task.findUnique({ where: { id: task_id } });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    const { assignedTo, ...restDto } = updateTaskDto;
    const data: any = { ...restDto };
    if (assignedTo) {
      data.assignedTo = { set: assignedTo.map((id) => ({ id })) };
    }

    const updatedTask = await prisma.task.update({
      where: { id: task_id },
      data,
      include: { subTasks: true },
    });
    return updatedTask;
  }

  async delete(task_id: string) {
    const task = await prisma.task.findUnique({ where: { id: task_id } });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    await prisma.task.deleteMany({ where: { parentTaskId: task_id } });
    await prisma.task.delete({ where: { id: task_id } });
    return { message: 'Task deleted successfully' };
  }
}
