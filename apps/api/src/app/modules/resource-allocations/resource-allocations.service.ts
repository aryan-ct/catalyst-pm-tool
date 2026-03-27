import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateResourceAllocationsDto,
  UpdateResourceAllocationsDto,
} from './dto/resource-allocations.dto';
import { prisma } from '../../config/prima.config';
import { Role } from '@prisma/client';

@Injectable()
export class ResourceAllocationsService {
  async create(createDto: CreateResourceAllocationsDto) {
    const resource = await prisma.resource.findUnique({
      where: {
        id: createDto.resourceId,
      },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found.');
    }

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
      data: { ...createDto, resourceName: resource.name, role: resource.role },
    });
  }

  async findAll(filters: { start_date?: Date; end_date?: Date; role?: Role }) {
    const { start_date, end_date, role } = filters;

    return prisma.resourceAllocation.findMany({
      where: {
        ...(role && { role }),
        ...(start_date && { gte: new Date(start_date) }),
        ...(end_date && { lte: new Date(end_date) }),
      },
    });
  }

  async findMyAllocations(id: string) {
    const resource = await prisma.resource.findUnique({
      where: {
        id,
      },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found.');
    }

    const resource_allocations = await prisma.resourceAllocation.findMany({
      where: {
        resourceId: id,
      },
    });

    if (!resource_allocations || resource_allocations.length === 0) {
      throw new NotFoundException('Resource allocations not found.');
    }

    return resource_allocations;
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

  async getByResourceId(resource_id: string) {
    return prisma.resourceAllocation.findMany({
      where: {
        resourceId: resource_id,
      },
    });
  }
}
