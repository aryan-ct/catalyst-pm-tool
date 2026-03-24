import { LeadStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  clientName!: string;

  @IsOptional()
  @IsString()
  projectName?: string;

  @IsEnum(LeadStatus)
  leadStatus!: LeadStatus;
}

export class UpdateLeadDto {
  @IsString()
  @IsOptional()
  clientName?: string;

  @IsString()
  @IsOptional()
  projectName?: string;

  @IsEnum(LeadStatus)
  @IsOptional()
  leadStatus?: LeadStatus;
}
