import { IsString, IsDateString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ConsultationMethod } from '../../../generated/prisma';

export class CreateConsultationDto {
  @IsString()
  consultantId: string;

  @IsString()
  studentId: string;  // 상담 대상 자녀

  @IsDateString()
  scheduledAt: string;

  @IsEnum(ConsultationMethod)
  @IsOptional()
  method?: ConsultationMethod;

  @IsInt()
  @Min(30)
  @IsOptional()
  duration?: number;  // 분 단위, 기본 60분

  @IsString()
  @IsOptional()
  topic?: string;
}











