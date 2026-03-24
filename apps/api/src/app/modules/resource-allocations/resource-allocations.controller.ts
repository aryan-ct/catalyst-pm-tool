import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ResourceAllocationsService } from './resource-allocations.service';
import {
  CreateResourceAllocationsDto,
  UpdateResourceAllocationsDto,
} from './dto/resource-allocations.dto';

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
  findAll() {
    return this.resourceAllocationsService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateResourceAllocationsDto,
  ) {
    return this.resourceAllocationsService.update(id, updateDto);
  }
}
