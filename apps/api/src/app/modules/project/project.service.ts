import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { prisma } from '../../config/prima.config';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  async createProject(createProjectDto: CreateProjectDto) {
    const { milestones, leadId, ...projectData } = createProjectDto;

    if (leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead) throw new NotFoundException('Lead not found');
      if (lead.projectId) {
        throw new BadRequestException(
          'A project has already been created from this lead',
        );
      }
    }

    const project = await prisma.project.create({
      data: {
        ...projectData,

        milestones: milestones
          ? {
              create: milestones,
            }
          : undefined,
      },
      include: {
        milestones: true,
      },
    });

    if (leadId) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { projectId: project.id },
      });
    }

    return project;
  }

  async findAll(project_status?: ProjectStatus) {
    return prisma.project.findMany({
      where: {
        projectStatus: project_status,
      },
      include: {
        milestones: {
          include: {
            tasks: {
              include: { subTasks: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        milestones: {
          include: {
            tasks: {
              include: { subTasks: true },
            },
          },
        },
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async findMyProjectsByResourceAllocationId(
    _id: string,
    resource_allocation_id: string,
  ) {
    const resourceAllocation = await prisma.resourceAllocation.findUnique({
      where: {
        id: resource_allocation_id,
      },
    });

    if (!resourceAllocation) {
      throw new NotFoundException('Resource allocation not found.');
    }

    const projects = await prisma.project.findMany({
      where: {
        id: resourceAllocation.projectId,
      },
      include: { milestones: true },
    });

    if (!projects || projects.length === 0) {
      throw new NotFoundException('Projects not found');
    }

    return projects;
  }

  async updateProject(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const { milestones, ...updateData } = updateProjectDto;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { ...updateData },
      include: {
        milestones: {
          include: {
            tasks: {
              include: { subTasks: true },
            },
          },
        },
      },
    });

    return updatedProject;
  }
}
