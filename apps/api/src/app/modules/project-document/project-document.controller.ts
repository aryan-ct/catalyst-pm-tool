import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ProjectDocumentService } from './project-document.service';
import {
  CreateProjectDocumentDto,
  UpdateProjectDocumentDto,
} from './dto/project-document.dto';
import { Roles, UserRole } from '../../decorators/roles.decorator';

@Controller('projects')
export class ProjectDocumentController {
  constructor(private readonly projectDocumentService: ProjectDocumentService) {}

  @Get(':projectId/documents')
  getDocuments(@Param('projectId') projectId: string) {
    return this.projectDocumentService.findAllByProject(projectId);
  }

  @Post(':projectId/documents')
  @Roles(UserRole.MANAGER)
  addDocument(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectDocumentDto,
  ) {
    return this.projectDocumentService.create(projectId, dto);
  }

  @Patch(':projectId/documents/:documentId')
  @Roles(UserRole.MANAGER)
  updateDocument(
    @Param('documentId') documentId: string,
    @Body() dto: UpdateProjectDocumentDto,
  ) {
    return this.projectDocumentService.update(documentId, dto);
  }

  @Delete(':projectId/documents/:documentId')
  @Roles(UserRole.MANAGER)
  deleteDocument(@Param('documentId') documentId: string) {
    return this.projectDocumentService.remove(documentId);
  }
}
