import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { SchoolType } from '../../../generated/prisma';

export class CreateSchoolDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(SchoolType)
  type: SchoolType;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  features?: string;
}






