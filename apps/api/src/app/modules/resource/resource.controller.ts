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

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get('all')
  @Roles(UserRole.HR)
  async findAll(@Query('role') role?: Role) {
    return this.resourcesService.findAll(role);
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return this.resourcesService.findById(id);
  }

  @Post('create')
  async createResource(
    @Body() createResourceDto: CreateResourceDto,
  ): Promise<CreateResourceDto> {
    return this.resourcesService.create(createResourceDto);
  }

  @Patch('update/:id')
  async updateResource(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(id, updateResourceDto);
  }
}
