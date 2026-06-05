import { IsArray, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateResourceAllocationDto {
  @IsString()
  resourceId!: string;

  @IsOptional()
  @IsString()
  projectId?: string;
  
  @IsOptional()
  @IsString()
  milestoneId?: string;
  
  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsNumber()
  actualHours?: number;
  
  @IsDateString()
  date!: string;
}

export class UpdateResourceAllocationsDto {
  @IsOptional()
  @IsString()
  projectId?: string;
  
  @IsOptional()
  @IsString()
  milestoneId?: string;
  
  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsNumber()
  actualHours?: number;
  
  @IsOptional()
  @IsDateString()
  date?: string;
}
