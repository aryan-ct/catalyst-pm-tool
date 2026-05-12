import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateResourceDto, ResetPasswordDto, UpdateResourceDto } from './dto/resources.dto';
import { prisma } from '../../config/prima.config';
import { bcryptHashing } from '../../../utils/utils';
import { Role } from '@prisma/client';

@Injectable()
export class ResourcesService implements OnModuleInit {
  async onModuleInit() {
    const hrExists = await prisma.resource.findFirst({
      where: { role: Role.HR },
    });

    if (!hrExists) {
      const email = process.env.HR_EMAIL_ID || 'hr@catalyst.sh';
      const password = process.env.HR_PASSWORD || 'hr@12345';
      const name = process.env.HR_NAME || 'hr';

      const hashedPassword = await bcryptHashing.generatePasswordHash(password);

      await prisma.resource.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: Role.HR,
          isActive: true,
        },
      });
      console.log('HR resource created automatically from environment variables.');
    }
  }

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
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return resources;
  }

  async resetPassword(id: string, dto: ResetPasswordDto) {
    const resource = await prisma.resource.findUnique({ where: { id } });

    if (!resource) {
      throw new NotFoundException('Resource does not exist.');
    }

    const hashedPassword = await bcryptHashing.generatePasswordHash(dto.newPassword);
    await prisma.resource.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Password reset successfully.' };
  }

  async findById(id: string) {
    const resource = await prisma.resource.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return resource;
  }
}
