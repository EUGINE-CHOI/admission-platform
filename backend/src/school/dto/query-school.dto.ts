import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SchoolType, PublishStatus } from '../../../generated/prisma';

export class QuerySchoolDto {
  @IsString()
  @IsOptional()
  region?: string;

  @IsEnum(SchoolType)
  @IsOptional()
  type?: SchoolType;

  @IsString()
  @IsOptional()
  search?: string;
}

export class AdminQuerySchoolDto {
  @IsEnum(PublishStatus)
  @IsOptional()
  status?: PublishStatus;
}





