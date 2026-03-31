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

  @IsOptional()
  @IsString()
  bugSheet?: string;

  @IsString()
  milestoneDescription!: string;

  @IsNumber()
  @Min(1)
  estimatedHours!: number;
}

export class UpdateMilestoneDto {
  @IsOptional()
  @IsString()
  milestoneName?: string;

  @IsOptional()
  @IsString()
  bugSheet?: string;

  @IsOptional()
  @IsString()
  milestoneDescription?: string;

  @IsOptional()
  @IsDateString()
  completionDate?: Date;
}
