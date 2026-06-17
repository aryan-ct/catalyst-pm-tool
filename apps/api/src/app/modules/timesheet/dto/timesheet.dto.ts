import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTimeLogItemDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  taskTitle: string;

  @IsOptional()
  @IsString()
  taskDescription?: string;

  @IsNotEmpty()
  @IsNumber()
  workingHours: number;
}

export class CreateTimesheetDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsString()
  resourceId: string;

  @IsOptional()
  @IsNumber()
  totalHours?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTimeLogItemDto)
  logs?: CreateTimeLogItemDto[];
}

export class CreateTimeLogDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  taskTitle: string;

  @IsOptional()
  @IsString()
  taskDescription?: string;

  @IsNotEmpty()
  @IsNumber()
  workingHours: number;
}

export class UpdateTimeLogDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  taskTitle?: string;

  @IsOptional()
  @IsNumber()
  workingHours?: number;
}
