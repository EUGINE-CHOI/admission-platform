import { IsNotEmpty, IsOptional, IsString, IsEnum, IsInt, IsDateString, Min } from 'class-validator';
import { ScheduleType } from '../../../generated/prisma';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @IsInt()
  @Min(2020)
  year: number;

  @IsEnum(ScheduleType)
  type: ScheduleType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  note?: string;
}








