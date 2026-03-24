import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateResourceAllocationsDto,
  UpdateResourceAllocationsDto,
} from './dto/resource-allocations.dto';
import { prisma } from '../../config/prima.config';

@Injectable()
export class ResourceAllocationsService {
  async create(createDto: CreateResourceAllocationsDto) {
    const availableProjects = await prisma.project.findMany({
      where: {
        id: {
          in: createDto.projectIds,
        },
      },
    });

    if (availableProjects.length == 0) {
      throw new NotFoundException('Projects are not exists with the ids.');
    }

    return prisma.resourceAllocation.create({
      data: createDto,
    });
  }

  async findAll() {
    return prisma.resourceAllocation.findMany();
  }

  async update(id: string, updateDto: UpdateResourceAllocationsDto) {
    const allocation = await prisma.resourceAllocation.findUnique({
      where: { id },
    });
    if (!allocation) {
      throw new NotFoundException('Resource allocation not found.');
    }
    return prisma.resourceAllocation.update({
      where: { id },
      data: updateDto,
    });
  }
}
