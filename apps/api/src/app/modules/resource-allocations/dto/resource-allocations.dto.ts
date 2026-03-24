import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateResourceAllocationsDto {
  @IsString()
  resourceName!: string;

  @IsArray()
  @IsString({ each: true })
  projectIds!: string[];
}

export class UpdateResourceAllocationsDto {
  @IsOptional()
  @IsString()
  resourceName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  projectIds?: string[];
}
