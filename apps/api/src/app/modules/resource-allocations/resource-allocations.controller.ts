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
  @Roles(UserRole.HR)
  create(
    @Body(new ParseArrayPipe({ items: CreateResourceAllocationDto }))
    createDto: CreateResourceAllocationDto[],
  ) {
    return this.resourceAllocationsService.create(createDto);
  }

  @Get()
  @Roles(UserRole.HR)
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
  @Roles(UserRole.HR)
  @Get('resource/:resource_id')
  async getResourceAllocationByRoleAndId(
    @Param('resource_id') resource_id: client.Role,
  ) {
    return this.resourceAllocationsService.getByResourceId(resource_id);
  }

  @Patch(':id')
  @Roles(UserRole.HR)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateResourceAllocationsDto,
  ) {
    return this.resourceAllocationsService.update(id, updateDto);
  }
}
