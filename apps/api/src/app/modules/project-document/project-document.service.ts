import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../../config/prima.config';
import {
  CreateProjectDocumentDto,
  UpdateProjectDocumentDto,
} from './dto/project-document.dto';

@Injectable()
export class ProjectDocumentService {
  async findAllByProject(projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    return prisma.projectDocument.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(projectId: string, dto: CreateProjectDocumentDto) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    return prisma.projectDocument.create({
      data: { projectId, title: dto.title, link: dto.link },
    });
  }

  async update(documentId: string, dto: UpdateProjectDocumentDto) {
    const doc = await prisma.projectDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');

    return prisma.projectDocument.update({
      where: { id: documentId },
      data: { title: dto.title, link: dto.link },
    });
  }

  async remove(documentId: string) {
    const doc = await prisma.projectDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');

    await prisma.projectDocument.delete({ where: { id: documentId } });
    return { success: true };
  }
}
