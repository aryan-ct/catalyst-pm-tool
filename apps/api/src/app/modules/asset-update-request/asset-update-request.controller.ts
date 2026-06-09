import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AssetUpdateRequestService } from './asset-update-request.service';
import {
  CreateAssetUpdateRequestDto,
  ReviewAssetUpdateRequestDto,
} from './dto/asset-update-request.dto';
import { Roles, UserRole } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { Resource, UpdateRequestStatus } from '@prisma/client';

@Controller('asset-update-requests')
export class AssetUpdateRequestController {
  constructor(private readonly service: AssetUpdateRequestService) {}

  @Post()
  @Roles(
    UserRole.MANAGER, UserRole.DEV, UserRole.TESTER,
    UserRole.DESIGNER, UserRole.BDE,
  )
  create(
    @Body() dto: CreateAssetUpdateRequestDto,
    @CurrentUser() user: Resource,
  ) {
    return this.service.create(dto, user.id, user.name);
  }

  @Get()
  @Roles(
    UserRole.HR, UserRole.JR_HR,
    UserRole.MANAGER, UserRole.DEV, UserRole.TESTER,
    UserRole.DESIGNER, UserRole.BDE,
  )
  findAll(
    @CurrentUser() user: Resource,
    @Query('status') status?: UpdateRequestStatus,
  ) {
    const isHR = user.role === UserRole.HR || user.role === UserRole.JR_HR;
    if (isHR) return this.service.findAll(status);
    return this.service.findByResource(user.id);
  }

  @Get('pending-count')
  @Roles(UserRole.HR, UserRole.JR_HR)
  getPendingCount() {
    return this.service.getPendingCount();
  }

  @Patch(':id/approve')
  @Roles(UserRole.HR, UserRole.JR_HR)
  approve(
    @Param('id') id: string,
    @Body() dto: ReviewAssetUpdateRequestDto,
    @CurrentUser() user: Resource,
  ) {
    return this.service.approve(id, dto, user.id, user.name);
  }

  @Patch(':id/reject')
  @Roles(UserRole.HR, UserRole.JR_HR)
  reject(
    @Param('id') id: string,
    @Body() dto: ReviewAssetUpdateRequestDto,
    @CurrentUser() user: Resource,
  ) {
    return this.service.reject(id, dto, user.id, user.name);
  }
}
