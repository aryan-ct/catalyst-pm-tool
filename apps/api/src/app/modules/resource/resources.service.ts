import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateResourceDto, UpdateResourceDto } from './dto/resources.dto';
import { prisma } from '../../config/prima.config';
import { bcryptHashing } from '../../../utils/utils';
import { Role } from '@prisma/client';

@Injectable()
export class ResourcesService {
  async create(createResourceDto: CreateResourceDto) {
    const resourceInDb = await prisma.resource.findUnique({
      where: {
        email: createResourceDto.email,
      },
    });

    if (resourceInDb) {
      throw new ConflictException('Resource already exist with the email.');
    }

    const hashedPassword = await bcryptHashing.generatePasswordHash(
      createResourceDto.password,
    );

    const resource = await prisma.resource.create({
      data: { ...createResourceDto, password: hashedPassword },
    });
    return resource;
  }

  async update(id: string, updateResourceDto: UpdateResourceDto) {
    const resource = await prisma.resource.findUnique({
      where: {
        id,
      },
    });

    if (!resource) {
      throw new NotFoundException('Resourse does not exists.');
    }

    const updatedResource = await prisma.resource.update({
      where: { id },
      data: { ...updateResourceDto },
    });

    return updatedResource;
  }

  async findAll(role?: Role) {
    const resources = await prisma.resource.findMany({
      where: {
        role,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return resources;
  }

  async findById(id: string) {
    const resource = await prisma.resource.findUnique({
      where: {
        id,
      },
    });

    return resource;
  }
}
