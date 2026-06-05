import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseArrayPipe,
} from '@nestjs/common';
import { ResourceAllocationsService } from './resource-allocations.service';
import {
  CreateResourceAllocationDto,
  UpdateResourceAllocationsDto,
} from './dto/resource-allocations.dto';
import * as client from '@prisma/client';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { Roles, UserRole } from '../../decorators/roles.decorator';

@Controller('resource-allocations')
export class ResourceAllocationsController {
  constructor(
    private readonly resourceAllocationsService: ResourceAllocationsService,
  ) {}

  @Post('create')
  @Roles(UserRole.HR, UserRole.JR_HR)
  create(
    @Body(new ParseArrayPipe({ items: CreateResourceAllocationDto }))
    createDto: CreateResourceAllocationDto[],
  ) {
    return this.resourceAllocationsService.create(createDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: client.Resource,
    @Query('start_date') start_date: Date,
    @Query('end_date') end_date: Date,
    @Query('role') role: client.Role,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Removed restriction so all users can see historical team allocations
    return this.resourceAllocationsService.findAll({
      role,
      end_date,
      start_date,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('me')
  getMyAllocations(
    @CurrentUser() user: client.Resource,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.resourceAllocationsService.findMyAllocations(
      user.id,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  // Get Resource allocation resource id
  @Roles(UserRole.HR, UserRole.JR_HR)
  @Get('resource/:resource_id')
  async getResourceAllocationByRoleAndId(
    @Param('resource_id') resource_id: client.Role,
  ) {
    return this.resourceAllocationsService.getByResourceId(resource_id);
  }

  @Patch('bulk-update')
  bulkUpdate(
    @Body() updates: { id: string; data: UpdateResourceAllocationsDto }[],
  ) {
    return this.resourceAllocationsService.bulkUpdate(updates);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateResourceAllocationsDto,
  ) {
    return this.resourceAllocationsService.update(id, updateDto);
  }
}
