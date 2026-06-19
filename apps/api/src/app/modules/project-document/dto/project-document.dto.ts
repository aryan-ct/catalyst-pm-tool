import { IsString, MinLength } from 'class-validator';

export class CreateProjectDocumentDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  link!: string;
}

export class UpdateProjectDocumentDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  link!: string;
}
