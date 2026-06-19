import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '../../config/prima.config';
import { AssetStatus, Role } from '@prisma/client';
import {
  CreateAssetTrackingDto,
  UpdateAssetTrackingDto,
} from './dto/asset-tracking.dto';

@Injectable()
export class AssetTrackingService {
  async findAll(status?: AssetStatus) {
    return prisma.assetTracking.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByResourceId(resourceId: string) {
    return prisma.assetTracking.findMany({
      where: { allocatedTo: resourceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const asset = await prisma.assetTracking.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found.');
    return asset;
  }

  async createByHR(dto: CreateAssetTrackingDto) {
    const product = await prisma.assetTracking.findUnique({
      where: {
        serialNumber: dto.serialNumber,
      },
    });

    if (product) {
      throw new ConflictException(
        `Product with the serial number ${product.serialNumber} already exists.`,
      );
    }

    return prisma.assetTracking.create({
      data: {
        ...dto,
        assetPrice: dto.assetPrice !== undefined ? dto.assetPrice : undefined,
        dateOfAllocation: dto.dateOfAllocation
          ? new Date(dto.dateOfAllocation)
          : undefined,
      },
    });
  }

  async createByResource(
    dto: CreateAssetTrackingDto,
    resourceId: string,
    resourceName: string,
  ) {
    const product = await prisma.assetTracking.findUnique({
      where: {
        serialNumber: dto.serialNumber,
      },
    });

    if (product) {
      throw new ConflictException(
        `Product with the serial number ${product.serialNumber} already exists.`,
      );
    }

    return prisma.assetTracking.create({
      data: {
        ...dto,
        status: AssetStatus.ALLOCATED,
        allocatedTo: resourceId,
        allocatedToName: resourceName,
        addedByResourceId: resourceId,
        assetPrice: undefined,
        dateOfAllocation: undefined,
        loans: undefined,
        previousUser: undefined,
      },
    });
  }

  async update(id: string, dto: UpdateAssetTrackingDto) {
    const asset = await prisma.assetTracking.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found.');

    return prisma.assetTracking.update({
      where: { id },
      data: {
        ...dto,
        assetPrice: dto.assetPrice !== undefined ? dto.assetPrice : undefined,
        dateOfAllocation: dto.dateOfAllocation
          ? new Date(dto.dateOfAllocation)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    const asset = await prisma.assetTracking.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found.');

    await prisma.assetTracking.delete({ where: { id } });
    return { message: 'Asset deleted successfully.' };
  }

  isHRRole(role: Role) {
    return role === Role.HR || role === Role.JR_HR;
  }
}
