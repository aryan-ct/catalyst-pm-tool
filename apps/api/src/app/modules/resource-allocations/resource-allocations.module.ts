import { Module } from '@nestjs/common';
import { ResourceAllocationsController } from './resource-allocations.controller';
import { ResourceAllocationsService } from './resource-allocations.service';

@Module({
  controllers: [ResourceAllocationsController],
  providers: [ResourceAllocationsService],
})
export class ResourceAllocationsModule {}
