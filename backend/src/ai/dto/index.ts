import { IsString, IsOptional, IsArray, IsEnum, IsDateString } from 'class-validator';

// WP5.2: 생기부 문장 생성
export class GenerateRecordSentenceDto {
  @IsString()
  @IsOptional()
  activityId?: string; // 특정 활동 ID (없으면 전체 활동 종합)
}

// WP5.3: 동아리 추천
export class GenerateClubRecommendationDto {
  @IsArray()
  @IsOptional()
  interests?: string[]; // 관심 분야
}

// WP5.3: 교과 조언
export class GenerateSubjectAdviceDto {
  @IsString()
  @IsOptional()
  focusSubject?: string; // 집중할 과목
}

// WP5.3: 독서 추천
export class GenerateReadingRecommendationDto {
  @IsString()
  @IsOptional()
  genre?: string; // 선호 장르

  @IsString()
  @IsOptional()
  purpose?: string; // 독서 목적 (입시준비, 교양 등)
}

// WP5.3: 독후 가이드
export class GenerateReadingGuideDto {
  @IsString()
  bookTitle: string;

  @IsString()
  @IsOptional()
  author?: string;
}

// WP5.4: 액션 플랜 생성
export class GenerateActionPlanDto {
  @IsDateString()
  @IsOptional()
  startDate?: string; // 시작일 (기본: 오늘)
}

// WP5.5: 피드백
export class CreateFeedbackDto {
  @IsEnum(['LIKE', 'DISLIKE', 'EDITED'])
  type: 'LIKE' | 'DISLIKE' | 'EDITED';

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  editedContent?: string;
}

export class UpdateFeedbackDto {
  @IsEnum(['LIKE', 'DISLIKE', 'EDITED'])
  @IsOptional()
  type?: 'LIKE' | 'DISLIKE' | 'EDITED';

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  editedContent?: string;
}









