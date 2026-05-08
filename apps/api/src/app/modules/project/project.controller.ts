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
  constructor(private readonly projectService: ProjectsService) { }

  // Create Project
  @Roles(UserRole.MANAGER, UserRole.HR)
  @Post('create')
  async createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.createProject(createProjectDto);
  }

  // Get all Project - accessible by all roles
  @Get('all')
  async getAllProjects(
    @Query('project_status') project_status?: ProjectStatus,
  ) {
    return this.projectService.findAll(project_status);
  }

  // Get projects assigned to the current user via resource allocations
  @Get('mine')
  async getMyProjects(@CurrentUser() user: client.Resource) {
    return this.projectService.findMyProjects(user.id);
  }

  // Get Project by ID
  @Roles(UserRole.MANAGER, UserRole.HR)
  @Get(':id')
  async getProjectById(@Param('id') id: string) {
    return this.projectService.findById(id);
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
