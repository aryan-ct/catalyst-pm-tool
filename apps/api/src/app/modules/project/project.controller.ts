import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { ProjectStatus } from '@prisma/client';
import { CurrentUser } from '../../decorators/current-user.decorator';
import * as client from '@prisma/client';
import { Roles, UserRole } from '../../decorators/roles.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}

  // Create Project
  @Roles(UserRole.MANAGER, UserRole.HR)
  @Post('create')
  async createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.createProject(createProjectDto);
  }

  // Get all Project
  @Roles(UserRole.MANAGER, UserRole.HR)
  @Get('all')
  async getAllProjects(
    @Query('project_status') project_status?: ProjectStatus,
  ) {
    return this.projectService.findAll(project_status);
  }

  // Get Project by ID
  @Roles(UserRole.MANAGER, UserRole.HR)
  @Get(':id')
  async getProjectById(@Param('id') id: string) {
    return this.projectService.findById(id);
  }

  // Get my projects by resource allocation id
  @Get('my/:resource-allocation-id')
  async getMyProjects(
    @CurrentUser() user: client.Resource,
    @Param('resource-allocation-id') resource_allocation_id: string,
  ) {
    this.projectService.findMyProjectsByResourceAllocationId(
      user.id,
      resource_allocation_id,
    );
  }

  // Updated project by Id
  @Roles(UserRole.MANAGER, UserRole.HR)
  @Patch(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.updateProject(id, updateProjectDto);
  }
}
