import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  clientName!: string;

  @IsString()
  @Max(255)
  description!: string;

  @IsOptional()
  @IsString()
  documentLink?: string;

  @IsDateString()
  @IsNotEmpty()
  commencementDate!: Date;

  @IsEnum({ enum: ProjectStatus })
  projectStatus!: ProjectStatus;
}

export class UpdateProjectDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  clientName!: string;

  @IsString()
  @Max(255)
  description!: string;

  @IsOptional()
  @IsString()
  documentLink?: string;

  @IsDateString()
  @IsNotEmpty()
  commencementDate!: Date;

  @IsEnum({ enum: ProjectStatus })
  projectStatus!: ProjectStatus;
}
