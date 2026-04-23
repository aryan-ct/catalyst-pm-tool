import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeadDto, UpdateLeadDto } from './dto/leads.dto';
import { prisma } from '../../config/prima.config';
import { LeadStatus } from '@prisma/client';

@Injectable()
export class LeadsService {
  async createLead(createLeadDto: CreateLeadDto, createdById?: string) {
    const createdLead = await prisma.lead.create({ data: { ...createLeadDto, createdById } });
    return createdLead;
  }

  async updateLead(id: string, updateLeadDto: UpdateLeadDto) {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    return prisma.lead.update({ where: { id }, data: updateLeadDto });
  }

  async findAllLeads(leadStatus?: LeadStatus) {
    return prisma.lead.findMany({ where: { leadStatus }, orderBy: { createdAt: 'desc' } });
  }

  async findLeadById(id: string) {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    return lead;
  }
}
