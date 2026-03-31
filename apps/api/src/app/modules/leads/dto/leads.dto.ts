import { LeadStatus } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  clientName!: string;

  @IsOptional()
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  links?: string[];

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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  links?: string[];

  @IsOptional()
  @IsEnum(LeadStatus)
  leadStatus?: LeadStatus;
}
