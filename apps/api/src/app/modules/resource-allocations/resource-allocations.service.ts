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
    if (!createDto.length) return [];
    
    // We assume all items in the payload have the same date
    const targetDate = new Date(createDto[0].date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Delete existing daily allocations for this date to replace them
    const deletePromise = prisma.dailyTaskAllocation.deleteMany({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const resourceIds = [...new Set(createDto.map((dto) => dto.resourceId))];
    const projectIds = [...new Set(createDto.map((dto) => dto.projectId).filter((id): id is string => !!id))];

    const resources = await prisma.resource.findMany({
      where: { id: { in: resourceIds } },
    });

    const projects = projectIds.length
      ? await prisma.project.findMany({ where: { id: { in: projectIds } } })
      : [];

    const resourceMap = new Map(resources.map((r) => [r.id, r]));
    const projectMap = new Map(projects.map((p) => [p.id, p]));

    const missingResources = resourceIds.filter((id) => !resourceMap.has(id));
    if (missingResources.length > 0) {
      throw new NotFoundException(
        `Resources not found: ${missingResources.join(', ')}`,
      );
    }

    const missingProjects = projectIds.filter((id) => !projectMap.has(id));
    if (missingProjects.length > 0) {
      throw new NotFoundException(
        `Projects not found: ${missingProjects.join(', ')}`,
      );
    }

    // Creating via transaction to ensure all or nothing
    const createPromises = createDto.map((dto) => {
      return prisma.dailyTaskAllocation.create({
        data: {
          resourceId: dto.resourceId,
          ...(dto.projectId && { projectId: dto.projectId }),
          ...(dto.milestoneId && { milestoneId: dto.milestoneId }),
          ...(dto.taskId && { taskId: dto.taskId }),
          desc: dto.desc,
          estimatedHours: dto.estimatedHours,
          actualHours: dto.actualHours,
          date: new Date(dto.date),
        },
      });
    });

    return prisma.$transaction([deletePromise, ...createPromises]);
  }

  async findAll(filters: { start_date?: Date; end_date?: Date; role?: Role; page?: number; limit?: number }) {
    const { start_date, end_date, role, page, limit } = filters;

    // Optional role filtering would require a join or fetching resources first.
    // Since DailyTaskAllocation doesn't store role natively like the old table, 
    // we fetch valid resources if role is provided.
    let validResourceIds: string[] | undefined = undefined;
    if (role) {
      const resources = await prisma.resource.findMany({ where: { role }});
      validResourceIds = resources.map(r => r.id);
    }

    const whereClause: any = {
      ...(validResourceIds && { resourceId: { in: validResourceIds } }),
      ...((start_date || end_date) && {
        date: {
          ...(start_date && { gte: new Date(start_date) }),
          ...(end_date && { lte: new Date(end_date) }),
        }
      }),
    };

    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const take = limit;

      const [data, total] = await Promise.all([
        prisma.dailyTaskAllocation.findMany({
          where: whereClause,
          orderBy: { date: 'desc' },
          skip,
          take,
        }),
        prisma.dailyTaskAllocation.count({
          where: whereClause,
        })
      ]);

      return { data, total };
    }

    return prisma.dailyTaskAllocation.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });
  }

  async findMyAllocations(id: string, page?: number, limit?: number) {
    const resource = await prisma.resource.findUnique({
      where: {
        id,
      },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found.');
    }

    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const take = limit;

      const [data, total] = await Promise.all([
        prisma.dailyTaskAllocation.findMany({
          where: {
            resourceId: id,
          },
          orderBy: { date: 'desc' },
          skip,
          take,
        }),
        prisma.dailyTaskAllocation.count({
          where: {
            resourceId: id,
          },
        })
      ]);

      return { data, total };
    }

    const resource_allocations = await prisma.dailyTaskAllocation.findMany({
      where: {
        resourceId: id,
      },
      orderBy: { date: 'desc' },
    });

    return resource_allocations || [];
  }

  async update(id: string, updateDto: UpdateResourceAllocationsDto) {
    const allocation = await prisma.dailyTaskAllocation.findUnique({
      where: { id },
    });
    if (!allocation) {
      throw new NotFoundException('Daily task allocation not found.');
    }
    
    // Omit undefined dates or map them correctly
    const dataToUpdate: any = { ...updateDto };
    if (updateDto.date) {
        dataToUpdate.date = new Date(updateDto.date);
    }

    return prisma.dailyTaskAllocation.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async bulkUpdate(updates: { id: string, data: UpdateResourceAllocationsDto }[]) {
    const updatePromises = updates.map(update => {
       const dataToUpdate: any = { ...update.data };
       if (update.data.date) {
           dataToUpdate.date = new Date(update.data.date);
       }
       return prisma.dailyTaskAllocation.update({
           where: { id: update.id },
           data: dataToUpdate,
       });
    });
    return prisma.$transaction(updatePromises);
  }

  async getByResourceId(resource_id: string) {
    return prisma.dailyTaskAllocation.findMany({
      where: {
        resourceId: resource_id,
      },
    });
  }
}
