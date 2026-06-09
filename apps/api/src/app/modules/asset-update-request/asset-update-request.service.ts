import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { prisma } from '../../config/prima.config';
import { UpdateRequestStatus } from '@prisma/client';
import {
  CreateAssetUpdateRequestDto,
  ReviewAssetUpdateRequestDto,
} from './dto/asset-update-request.dto';

const REQUESTABLE_FIELDS = new Set([
  'productName',
  'serialNumber',
  'workingCondition',
  'productConfiguration',
  'otherAccessories',
  'comments',
]);

@Injectable()
export class AssetUpdateRequestService {
  async create(
    dto: CreateAssetUpdateRequestDto,
    resourceId: string,
    resourceName: string,
  ) {
    const asset = await prisma.assetTracking.findUnique({
      where: { id: dto.assetId },
    });
    if (!asset) throw new NotFoundException('Asset not found.');

    if (asset.allocatedTo !== resourceId) {
      throw new ForbiddenException('You can only request updates for your own asset.');
    }

    const invalidFields = Object.keys(dto.requestedChanges).filter(
      (f) => !REQUESTABLE_FIELDS.has(f),
    );
    if (invalidFields.length) {
      throw new BadRequestException(
        `Fields not requestable: ${invalidFields.join(', ')}`,
      );
    }

    const existing = await prisma.assetUpdateRequest.findFirst({
      where: { assetId: dto.assetId, status: UpdateRequestStatus.PENDING },
    });
    if (existing) {
      throw new BadRequestException(
        'A pending update request already exists for this asset.',
      );
    }

    return prisma.assetUpdateRequest.create({
      data: {
        assetId: dto.assetId,
        assetName: asset.name,
        requestedById: resourceId,
        requestedByName: resourceName,
        requestedChanges: dto.requestedChanges as any,
        reason: dto.reason,
      },
    });
  }

  async findAll(status?: UpdateRequestStatus) {
    return prisma.assetUpdateRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByResource(resourceId: string) {
    return prisma.assetUpdateRequest.findMany({
      where: { requestedById: resourceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingCount() {
    return prisma.assetUpdateRequest.count({
      where: { status: UpdateRequestStatus.PENDING },
    });
  }

  async approve(
    id: string,
    dto: ReviewAssetUpdateRequestDto,
    reviewerId: string,
    reviewerName: string,
  ) {
    const request = await prisma.assetUpdateRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Request not found.');
    if (request.status !== UpdateRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be approved.');
    }

    const changes = request.requestedChanges as Record<
      string,
      { from: string; to: string }
    >;

    const assetPatch: Record<string, any> = {};
    for (const [field, entry] of Object.entries(changes)) {
      if (REQUESTABLE_FIELDS.has(field)) {
        assetPatch[field] = entry.to;
      }
    }

    await prisma.$transaction([
      prisma.assetTracking.update({
        where: { id: request.assetId },
        data: assetPatch,
      }),
      prisma.assetUpdateRequest.update({
        where: { id },
        data: {
          status: UpdateRequestStatus.APPROVED,
          hrComment: dto.hrComment,
          reviewedById: reviewerId,
          reviewedByName: reviewerName,
        },
      }),
    ]);

    return { message: 'Request approved and asset updated.' };
  }

  async reject(
    id: string,
    dto: ReviewAssetUpdateRequestDto,
    reviewerId: string,
    reviewerName: string,
  ) {
    const request = await prisma.assetUpdateRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Request not found.');
    if (request.status !== UpdateRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be rejected.');
    }

    return prisma.assetUpdateRequest.update({
      where: { id },
      data: {
        status: UpdateRequestStatus.REJECTED,
        hrComment: dto.hrComment,
        reviewedById: reviewerId,
        reviewedByName: reviewerName,
      },
    });
  }
}
