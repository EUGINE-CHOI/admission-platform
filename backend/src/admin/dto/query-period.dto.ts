import { IsOptional, IsString, Matches } from 'class-validator';

export class QueryPeriodDto {
  @IsOptional()
  @IsString()
  @Matches(/^(\d{4}-\d{2}|\d{4}-W\d{2}|\d{4}-\d{2}-\d{2}|week|month|quarter)$/, {
    message: 'period는 YYYY-MM, YYYY-Www, YYYY-MM-DD, week, month, quarter 형식이어야 합니다',
  })
  period?: string; // YYYY-MM (월간), YYYY-Www (주간), YYYY-MM-DD (일간), week, month, quarter

  @IsOptional()
  @IsString()
  groupBy?: 'day' | 'week' | 'month';
}

export class QueryAgentDto extends QueryPeriodDto {
  @IsOptional()
  @IsString()
  agentType?: string; // RECORD_SENTENCE, CLUB_RECOMMENDATION, etc.
}








