import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto/milestone.dto';
import { prisma } from '../../config/prima.config';

@Injectable()
export class MilestoneService {
  async createMilestone(
    project_id: string,
    createMilestoneDto: CreateMilestoneDto,
  ) {
    if (!project_id) {
      throw new Error('projectId is required to create a standalone milestone');
    }

    const project = await prisma.project.findUnique({
      where: {
        id: project_id,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    const createdMileStone = await prisma.milestone.create({
      data: { ...createMilestoneDto, projectId: project_id },
    });

    return createdMileStone;
  }

  async updateMilestone(id: string, updateMilestoneDto: UpdateMilestoneDto) {
    const milestone = await prisma.milestone.findUnique({ where: { id } });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    const updatedMilestone = await prisma.milestone.update({
      where: {
        id,
      },
      data: { ...updateMilestoneDto },
    });

    return updatedMilestone;
  }

  async findAllMilestones() {
    return await prisma.milestone.findMany();
  }
}
