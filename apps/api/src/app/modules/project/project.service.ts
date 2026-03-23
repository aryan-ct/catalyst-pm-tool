import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { prisma } from '../../config/prima.config';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  async createProject(createProjectDto: CreateProjectDto) {
    const project = await prisma.project.create({
      data: { ...createProjectDto },
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

  async updateProject(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const updatedProject = await prisma.project.update({
      where: {
        id,
      },
      data: { ...updateProjectDto },
    });

    return updatedProject;
  }
}
