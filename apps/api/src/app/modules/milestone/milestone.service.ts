import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto/milestone.dto';
import { prisma } from '../../config/prima.config';

@Injectable()
export class MilestoneService {
  async createMilestone(createMilestoneDto: CreateMilestoneDto) {
    const { projectId, ...milestoneData } = createMilestoneDto;

    if (!projectId) {
      throw new Error('projectId is required to create a standalone milestone');
    }

    const milestone = await prisma.milestone.create({
      data: {
        ...milestoneData,
        project: {
          connect: { id: projectId },
        },
      },
    });
    return milestone;
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
