import { IsNotEmpty, IsOptional, IsString, IsEnum, IsInt, IsNumber, Min } from 'class-validator';
import { AdmissionType } from '../../../generated/prisma';

export class CreateAdmissionDto {
  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @IsInt()
  @Min(2020)
  year: number;

  @IsEnum(AdmissionType)
  type: AdmissionType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  quota?: number;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsNumber()
  @IsOptional()
  gradeWeight?: number;

  @IsNumber()
  @IsOptional()
  interviewWeight?: number;

  @IsNumber()
  @IsOptional()
  essayWeight?: number;

  @IsNumber()
  @IsOptional()
  cutoffGrade?: number;

  @IsNumber()
  @IsOptional()
  competitionRate?: number;
}









