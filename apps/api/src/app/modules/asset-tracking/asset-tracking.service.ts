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

    const newAsset = await prisma.assetTracking.create({
      data: {
        ...dto,
        assetPrice: dto.assetPrice !== undefined ? dto.assetPrice : undefined,
        dateOfAllocation: dto.dateOfAllocation
          ? new Date(dto.dateOfAllocation)
          : undefined,
      },
    });

    if (dto.allocatedTo) {
      await prisma.assetAllocationHistory.create({
        data: {
          assetId: newAsset.id,
          allocatedTo: dto.allocatedTo,
          allocatedToName: dto.allocatedToName || 'Unknown',
          allocatedAt: dto.dateOfAllocation ? new Date(dto.dateOfAllocation) : new Date(),
        },
      });
    }

    return newAsset;
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

    const newAsset = await prisma.assetTracking.create({
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

    await prisma.assetAllocationHistory.create({
      data: {
        assetId: newAsset.id,
        allocatedTo: resourceId,
        allocatedToName: resourceName,
        allocatedAt: new Date(),
      },
    });

    return newAsset;
  }

  async update(id: string, dto: UpdateAssetTrackingDto) {
    const asset = await prisma.assetTracking.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found.');

    if (dto.allocatedTo !== undefined && dto.allocatedTo !== asset.allocatedTo) {
      // Close open allocations
      await prisma.assetAllocationHistory.updateMany({
        where: { assetId: id, returnedAt: null },
        data: { returnedAt: new Date() },
      });

      // Create new allocation record
      if (dto.allocatedTo) {
        await prisma.assetAllocationHistory.create({
          data: {
            assetId: id,
            allocatedTo: dto.allocatedTo,
            allocatedToName: dto.allocatedToName || 'Unknown',
            allocatedAt: dto.dateOfAllocation ? new Date(dto.dateOfAllocation) : new Date(),
          },
        });
      }
      
      if (asset.allocatedToName) {
        dto.previousUser = asset.allocatedToName;
      }
    }

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

  async getHistory(id: string) {
    const asset = await prisma.assetTracking.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found.');

    return prisma.assetAllocationHistory.findMany({
      where: { assetId: id },
      orderBy: { allocatedAt: 'desc' },
    });
  }
}
