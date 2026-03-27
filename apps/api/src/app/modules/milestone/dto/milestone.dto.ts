import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMilestoneDto {
  @IsString()
  milestoneName!: string;

  @IsString()
  milestoneDescription!: string;

  @IsNumber()
  @Min(1)
  estimatedHours!: number;

  @IsOptional()
  @IsString()
  projectId?: string;
}

export class UpdateMilestoneDto {
  @IsOptional()
  @IsString()
  milestoneName?: string;

  @IsOptional()
  @IsString()
  milestoneDescription?: string;

  @IsOptional()
  @IsDateString()
  completionDate?: Date;
}
