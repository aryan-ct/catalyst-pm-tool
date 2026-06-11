import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AssetStatus, WorkingCondition } from '@prisma/client';

export class CreateAssetTrackingDto {
  @IsString()
  name!: string;

  @IsString()
  product!: string;

  @IsString()
  productName!: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @IsOptional()
  @IsString()
  productConfiguration?: string;

  @IsOptional()
  @IsString()
  laptopPin?: string;

  @IsOptional()
  @IsString()
  laptopPassword?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  assetPrice?: number;

  @IsOptional()
  @IsDateString()
  dateOfAllocation?: string;

  @IsOptional()
  @IsString()
  loans?: string;

  @IsOptional()
  @IsString()
  otherAccessories?: string;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsEnum(WorkingCondition)
  workingCondition?: WorkingCondition;

  @IsOptional()
  @IsString()
  previousUser?: string;

  @IsOptional()
  @IsString()
  allocatedTo?: string;

  @IsOptional()
  @IsString()
  allocatedToName?: string;
}

export class UpdateAssetTrackingDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  product?: string;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @IsOptional()
  @IsString()
  productConfiguration?: string;

  @IsOptional()
  @IsString()
  laptopPin?: string;

  @IsOptional()
  @IsString()
  laptopPassword?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  assetPrice?: number;

  @IsOptional()
  @IsDateString()
  dateOfAllocation?: string;

  @IsOptional()
  @IsString()
  loans?: string;

  @IsOptional()
  @IsString()
  otherAccessories?: string;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsEnum(WorkingCondition)
  workingCondition?: WorkingCondition;

  @IsOptional()
  @IsString()
  previousUser?: string;

  @IsOptional()
  @IsString()
  allocatedTo?: string;

  @IsOptional()
  @IsString()
  allocatedToName?: string;
}
