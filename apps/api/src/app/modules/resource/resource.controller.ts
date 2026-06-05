import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateResourceDto, ResetPasswordDto, UpdateResourceDto } from './dto/resources.dto';
import { ResourcesService } from './resources.service';
import { Role } from '@prisma/client';
import { Roles, UserRole } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import * as client from '@prisma/client';


@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) { }

  @Get('all')
  @Roles(UserRole.MANAGER, UserRole.HR, UserRole.JR_HR, UserRole.DEV, UserRole.TESTER, UserRole.BDE, UserRole.DESIGNER)
  async findAll(@Query('role') role?: Role) {
    return this.resourcesService.findAll(role);
  }

  @Get("me")
  async findMe(@CurrentUser() user: client.Resource) {
    if (user?.role === UserRole.HR) {
      return {
        email: process.env.HR_EMAIL_ID || 'hr@catalyst.sh',
        role: Role.HR,
        isActive: true,
      };
    }

    return this.resourcesService.findById(user.id);
  }

  @Get(':id')
  @Roles(UserRole.HR, UserRole.JR_HR)
  async findOneById(@Param('id') id: string) {
    return this.resourcesService.findById(id);
  }

  @Post('create')
  @Roles(UserRole.HR, UserRole.JR_HR)
  async createResource(
    @Body() createResourceDto: CreateResourceDto,
  ): Promise<CreateResourceDto> {
    return this.resourcesService.create(createResourceDto);
  }

  @Patch('update/:id')
  @Roles(UserRole.HR, UserRole.JR_HR)
  async updateResource(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(id, updateResourceDto);
  }

  @Patch('reset-password/:id')
  @Roles(UserRole.HR, UserRole.JR_HR)
  async resetPassword(
    @Param('id') id: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.resourcesService.resetPassword(id, resetPasswordDto);
  }
}
