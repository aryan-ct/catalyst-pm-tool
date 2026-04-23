import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { LeadsService } from './lead.service';
import { CreateLeadDto, UpdateLeadDto } from './dto/leads.dto';
import { LeadStatus } from '@prisma/client';
import { Roles, UserRole } from '../../decorators/roles.decorator';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Roles(UserRole.MANAGER, UserRole.BDE)
  @Get('all')
  async findAllLeads(@Query('lead_status') leadStatus?: LeadStatus) {
    return this.leadsService.findAllLeads(leadStatus);
  }

  @Roles(UserRole.MANAGER, UserRole.BDE)
  @Get(':id')
  async findLeadById(@Param('id') id: string) {
    return this.leadsService.findLeadById(id);
  }

  @Roles(UserRole.BDE, UserRole.MANAGER)
  @Post('create')
  async createLead(
    @Body() createLeadDto: CreateLeadDto,
    @CurrentUser() user: any,
  ) {
    if (user.role === UserRole.BDE && createLeadDto.leadStatus !== 'ACTIVE') {
      throw new ForbiddenException('BDEs can only add active leads');
    }
    return this.leadsService.createLead(createLeadDto, user.id);
  }

  @Roles(UserRole.MANAGER, UserRole.BDE)
  @Patch('/:id')
  async updateLead(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @CurrentUser() user: any,
  ) {
    if (user.role === UserRole.BDE) {
      const lead = await this.leadsService.findLeadById(id);
      if (lead.createdById !== user.id) {
        if (
          updateLeadDto.clientName !== undefined ||
          updateLeadDto.projectName !== undefined ||
          updateLeadDto.links !== undefined
        ) {
          throw new ForbiddenException('BDEs can only update details of leads they created');
        }
      }
    } else if (user.role === UserRole.MANAGER) {
      if (updateLeadDto.leadStatus !== undefined) {
        throw new ForbiddenException('Managers cannot update lead status');
      }
    }
    return this.leadsService.updateLead(id, updateLeadDto);
  }
}
