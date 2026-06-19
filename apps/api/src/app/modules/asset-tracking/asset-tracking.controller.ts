import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AssetTrackingService } from './asset-tracking.service';
import {
  CreateAssetTrackingDto,
  UpdateAssetTrackingDto,
} from './dto/asset-tracking.dto';
import { Roles, UserRole } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { AssetStatus, Resource, Role } from '@prisma/client';

@Controller('asset-tracking')
export class AssetTrackingController {
  constructor(private readonly assetTrackingService: AssetTrackingService) {}

  @Get()
  @Roles(
    UserRole.HR,
    UserRole.JR_HR,
    UserRole.MANAGER,
    UserRole.DEV,
    UserRole.TESTER,
    UserRole.DESIGNER,
    UserRole.BDE,
  )
  async findAll(
    @CurrentUser() user: Resource,
    @Query('status') status?: AssetStatus,
  ) {
    if (this.assetTrackingService.isHRRole(user.role as Role)) {
      return this.assetTrackingService.findAll(status);
    }
    return this.assetTrackingService.findByResourceId(user.id);
  }

  @Get('my-asset')
  @Roles(
    UserRole.MANAGER,
    UserRole.DEV,
    UserRole.TESTER,
    UserRole.DESIGNER,
    UserRole.BDE,
  )
  async findMyAsset(@CurrentUser() user: Resource) {
    return this.assetTrackingService.findByResourceId(user.id);
  }

  @Get(':id')
  @Roles(UserRole.HR, UserRole.JR_HR)
  async findById(@Param('id') id: string) {
    return this.assetTrackingService.findById(id);
  }

  @Post()
  @Roles(
    UserRole.HR,
    UserRole.JR_HR,
    UserRole.MANAGER,
    UserRole.DEV,
    UserRole.TESTER,
    UserRole.DESIGNER,
    UserRole.BDE,
  )
  async create(
    @Body() dto: CreateAssetTrackingDto,
    @CurrentUser() user: Resource,
  ) {
    if (this.assetTrackingService.isHRRole(user.role as Role)) {
      return this.assetTrackingService.createByHR(dto);
    }
    return this.assetTrackingService.createByResource(dto, user.id, user.name);
  }

  @Patch(':id')
  @Roles(UserRole.HR, UserRole.JR_HR)
  async update(@Param('id') id: string, @Body() dto: UpdateAssetTrackingDto) {
    return this.assetTrackingService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.HR)
  async remove(@Param('id') id: string) {
    return this.assetTrackingService.remove(id);
  }
}
