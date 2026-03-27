import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { prisma } from '../../config/prima.config';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  async createProject(createProjectDto: CreateProjectDto) {
    const { milestones, ...projectData } = createProjectDto;
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

    return project;
  }

  async findAll(project_status?: ProjectStatus) {
    return prisma.project.findMany({
      where: {
        projectStatus: project_status,
      },
    });
  }

  async findById(id: string) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async findMyProjectsByResourceAllocationId(
    id: string,
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
        id: {
          in: resourceAllocation.projectIds,
        },
      },
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
      where: {
        id,
      },
      data: { ...updateData },
    });

    return updatedProject;
  }
}
