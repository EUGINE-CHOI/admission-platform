import { IsString, IsOptional, IsInt, IsArray, IsEnum, IsBoolean, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================
// Mentor DTOs
// ============================================

export enum MentorCategory {
  SCIENCE_HIGH = 'SCIENCE_HIGH',
  FOREIGN_LANG_HIGH = 'FOREIGN_LANG_HIGH',
  INTERNATIONAL_HIGH = 'INTERNATIONAL_HIGH',
  ART_HIGH = 'ART_HIGH',
  AUTONOMOUS_PRIVATE = 'AUTONOMOUS_PRIVATE',
  GENERAL_HIGH = 'GENERAL_HIGH',
}

export class CreateMentorDto {
  @ApiProperty({ description: '표시 이름', example: '과학고 선배 A' })
  @IsString()
  displayName: string;

  @ApiProperty({ enum: MentorCategory, description: '학교 유형' })
  @IsEnum(MentorCategory)
  category: MentorCategory;

  @ApiProperty({ description: '입학 연도', example: 2024 })
  @IsInt()
  admissionYear: number;

  @ApiPropertyOptional({ description: '합격 학교 ID' })
  @IsOptional()
  @IsString()
  schoolId?: string;

  @ApiPropertyOptional({ description: '현재 학년', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  currentGrade?: number;

  @ApiPropertyOptional({ description: '자기소개' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: '강점 과목', example: ['수학', '과학'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  @ApiPropertyOptional({ description: '전문 분야', example: ['면접', '자소서'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ description: '시간당 요금 (0=무료)', example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  hourlyRate?: number;

  @ApiPropertyOptional({ description: '세션 시간 (분)', example: 30 })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(120)
  sessionDuration?: number;

  @ApiPropertyOptional({ description: '가능 요일', example: ['MON', 'WED', 'FRI'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableDays?: string[];
}

export class UpdateMentorDto {
  @ApiPropertyOptional({ description: '표시 이름' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ description: '자기소개' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: '현재 학년' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  currentGrade?: number;

  @ApiPropertyOptional({ description: '강점 과목' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  @ApiPropertyOptional({ description: '전문 분야' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ description: '시간당 요금' })
  @IsOptional()
  @IsInt()
  @Min(0)
  hourlyRate?: number;

  @ApiPropertyOptional({ description: '세션 시간 (분)' })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(120)
  sessionDuration?: number;

  @ApiPropertyOptional({ description: '주당 최대 세션 수' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxSessions?: number;

  @ApiPropertyOptional({ description: '가능 요일' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableDays?: string[];
}

// ============================================
// Session DTOs
// ============================================

export class RequestSessionDto {
  @ApiProperty({ description: '멘토 ID' })
  @IsString()
  mentorId: string;

  @ApiProperty({ description: '예약 일시', example: '2025-01-15T14:00:00Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ description: '멘토링 주제', example: '과학고 면접 준비' })
  @IsString()
  topic: string;

  @ApiPropertyOptional({ description: '사전 질문' })
  @IsOptional()
  @IsString()
  questions?: string;
}

export class UpdateSessionDto {
  @ApiPropertyOptional({ description: '멘토 메모' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: '세션 요약' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: '화상 미팅 URL' })
  @IsOptional()
  @IsString()
  meetingUrl?: string;
}

export class CancelSessionDto {
  @ApiProperty({ description: '취소 사유' })
  @IsString()
  reason: string;
}

// ============================================
// Review DTOs
// ============================================

export class CreateReviewDto {
  @ApiProperty({ description: '세션 ID' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: '전체 평점 (1-5)', example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: '리뷰 내용' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '익명 여부', default: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional({ description: '도움 정도 (1-5)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  helpfulness?: number;

  @ApiPropertyOptional({ description: '시간 준수 (1-5)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  punctuality?: number;

  @ApiPropertyOptional({ description: '전문성 (1-5)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  expertise?: number;

  @ApiPropertyOptional({ description: '친절함 (1-5)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  friendliness?: number;
}

// ============================================
// Query DTOs
// ============================================

export class MentorQueryDto {
  @ApiPropertyOptional({ enum: MentorCategory, description: '학교 유형 필터' })
  @IsOptional()
  @IsEnum(MentorCategory)
  category?: MentorCategory;

  @ApiPropertyOptional({ description: '학교 ID 필터' })
  @IsOptional()
  @IsString()
  schoolId?: string;

  @ApiPropertyOptional({ description: '검색어 (이름, 소개)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '최소 평점', example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ description: '무료 멘토만', default: false })
  @IsOptional()
  @IsBoolean()
  freeOnly?: boolean;

  @ApiPropertyOptional({ description: '페이지', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '페이지당 개수', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

