import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateResourceAllocationDto,
  UpdateResourceAllocationsDto,
} from './dto/resource-allocations.dto';
import { prisma } from '../../config/prima.config';
import { Role } from '@prisma/client';

@Injectable()
export class ResourceAllocationsService {
  async create(createDto: CreateResourceAllocationDto[]) {
    const resourceIds = [...new Set(createDto.map((dto) => dto.resourceId))];
    const projectIds = [...new Set(createDto.map((dto) => dto.projectId))];

    const resources = await prisma.resource.findMany({
      where: { id: { in: resourceIds } },
    });

    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
    });

    const resourceMap = new Map(resources.map((r) => [r.id, r]));
    const projectMap = new Map(projects.map((p) => [p.id, p]));

    const missingResources = resourceIds.filter((id) => !resourceMap.has(id));
    if (missingResources.length > 0) {
      throw new NotFoundException(`Resources not found: ${missingResources.join(', ')}`);
    }

    const missingProjects = projectIds.filter((id) => !projectMap.has(id));
    if (missingProjects.length > 0) {
      throw new NotFoundException(`Projects not found: ${missingProjects.join(', ')}`);
    }

    // Creating via transaction to ensure all or nothing
    const createPromises = createDto.map((dto) => {
      const resource = resourceMap.get(dto.resourceId);
      return prisma.resourceAllocation.create({
        data: {
          resourceId: dto.resourceId,
          projectId: dto.projectId,
          desc: dto.desc,
          resourceName: resource!.name,
          role: resource!.role,
        },
      });
    });

    return prisma.$transaction(createPromises);
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
