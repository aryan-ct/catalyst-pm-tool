import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateResourceDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsBoolean()
  isActive!: boolean;
}

export class UpdateResourceDto {
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsBoolean()
  isActive!: boolean;
}
