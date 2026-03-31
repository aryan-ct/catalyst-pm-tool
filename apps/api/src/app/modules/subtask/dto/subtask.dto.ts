import { TaskType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateSubtaskDto {
  @IsString()
  title!: string;

  @IsEnum(TaskType)
  taskType!: TaskType;

  @IsString()
  taskId!: string;
}

export class UpdateSubtaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(TaskType)
  taskType?: TaskType;

  @IsOptional()
  @IsString()
  taskId?: string;
}
