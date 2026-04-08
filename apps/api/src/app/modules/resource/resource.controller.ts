import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateResourceDto, UpdateResourceDto } from './dto/resources.dto';
import { ResourcesService } from './resources.service';
import { Role } from '@prisma/client';
import { Roles, UserRole } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import * as client from '@prisma/client';


@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) { }

  @Get('all')
  @Roles(UserRole.HR)
  async findAll(@Query('role') role?: Role) {
    return this.resourcesService.findAll(role);
  }

  @Get("me")
  async findMe(@CurrentUser() user: client.Resource) {
    return this.resourcesService.findById(user.id);
  }

  @Get(':id')
  @Roles(UserRole.HR)
  async findOneById(@Param('id') id: string) {
    return this.resourcesService.findById(id);
  }

  @Post('create')
  @Roles(UserRole.HR)
  async createResource(
    @Body() createResourceDto: CreateResourceDto,
  ): Promise<CreateResourceDto> {
    return this.resourcesService.create(createResourceDto);
  }

  @Patch('update/:id')
  @Roles(UserRole.HR)
  async updateResource(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(id, updateResourceDto);
  }
}
