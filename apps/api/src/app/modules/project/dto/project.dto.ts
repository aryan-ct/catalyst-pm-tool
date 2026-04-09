import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ProjectStatus } from '@prisma/client';
import { CreateMilestoneDto } from '../../milestone/dto/milestone.dto';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  clientName!: string;

  @IsString()
  @MaxLength(255)
  description!: string;

  @IsOptional()
  @IsString()
  documentLink?: string;

  @IsDateString()
  @IsNotEmpty()
  commencementDate!: Date;

  @IsEnum(ProjectStatus)
  projectStatus!: ProjectStatus;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateMilestoneDto)
  milestones?: CreateMilestoneDto[];

  @IsOptional()
  @IsString()
  leadId?: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  clientName!: string;

  @IsString()
  @MaxLength(255)
  description!: string;

  @IsOptional()
  @IsString()
  documentLink?: string;

  @IsDateString()
  @IsNotEmpty()
  commencementDate!: Date;

  @IsEnum(ProjectStatus)
  projectStatus!: ProjectStatus;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateMilestoneDto)
  milestones?: CreateMilestoneDto[];
}
