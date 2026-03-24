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
import { LeadStatus } from '@prisma/client';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get('all')
  async findAllLeads(@Query('lead_status') leadStatus?: LeadStatus) {
    return this.leadsService.findAllLeads(leadStatus);
  }

  @Get(':id')
  async findLeadById(@Param('id') id: string) {
    return this.leadsService.findLeadById(id);
  }

  @Post('create')
  async createLead(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.createLead(createLeadDto);
  }

  @Patch('/:id')
  async updateLead(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadsService.updateLead(id, updateLeadDto);
  }
}
