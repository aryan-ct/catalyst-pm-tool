import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ResourceAllocationsService } from './resource-allocations.service';
import {
  CreateResourceAllocationsDto,
  UpdateResourceAllocationsDto,
} from './dto/resource-allocations.dto';
import * as client from '@prisma/client';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller('resource-allocations')
export class ResourceAllocationsController {
  constructor(
    private readonly resourceAllocationsService: ResourceAllocationsService,
  ) {}

  @Post('create')
  create(@Body() createDto: CreateResourceAllocationsDto) {
    return this.resourceAllocationsService.create(createDto);
  }

  @Get()
  findAll(
    @Query('start_date') start_date: Date,
    @Query('end_date') end_date: Date,
    @Query('role') role: client.Role,
  ) {
    return this.resourceAllocationsService.findAll({
      role,
      end_date,
      start_date,
    });
  }

  @Get('me')
  getMyAllocations(@CurrentUser() user: client.Resource) {
    return this.resourceAllocationsService.findMyAllocations(user.id);
  }

  // Get Resource allocation resource id
  @Get('resource/:resource_id')
  async getResourceAllocationByRoleAndId(
    @Param('resource_id') resource_id: client.Role,
  ) {
    return this.resourceAllocationsService.getByResourceId(resource_id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateResourceAllocationsDto,
  ) {
    return this.resourceAllocationsService.update(id, updateDto);
  }
}
