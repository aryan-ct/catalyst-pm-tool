import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateResourceAllocationDto {
  @IsString()
  resourceId!: string;

  @IsString()
  projectId!: string;

  @IsOptional()
  @IsString()
  desc?: string;
}

export class UpdateResourceAllocationsDto {
  @IsOptional()
  @IsString()
  resourceName?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  desc?: string;
}
