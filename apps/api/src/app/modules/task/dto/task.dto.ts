import { TaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateSubtaskDto } from '../../subtask/dto/subtask.dto';

export class CreateTaskDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsNumber()
  estimatedHours!: number;

  @IsEnum(TaskStatus)
  taskStatus: TaskStatus = TaskStatus.TODO;

  @IsNumber()
  actualHours!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignTo?: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto)
  subtasks?: CreateSubtaskDto[];
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsEnum(TaskStatus)
  taskStatus?: TaskStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignTo?: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto)
  subtasks?: CreateSubtaskDto[];

  @IsString()
  milestoneId!: string;
}
