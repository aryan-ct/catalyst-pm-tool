import { IsString, MinLength } from 'class-validator';

export class CreateTaskCommentDto {
  @IsString()
  @MinLength(1)
  content!: string;
}

export class UpdateTaskCommentDto {
  @IsString()
  @MinLength(1)
  content!: string;
}
