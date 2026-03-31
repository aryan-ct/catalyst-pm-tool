import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LeadsService } from './lead.service';
import { CreateLeadDto, UpdateLeadDto } from './dto/leads.dto';
import { LeadStatus, Role } from '@prisma/client';
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
  async createLead(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.createLead(createLeadDto);
  }

  @Roles(UserRole.MANAGER)
  @Patch('/:id')
  async updateLead(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadsService.updateLead(id, updateLeadDto);
  }
}
