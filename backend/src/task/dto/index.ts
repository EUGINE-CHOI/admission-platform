import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class UpdateTaskStatusDto {
  @IsEnum(['TODO', 'IN_PROGRESS', 'DONE', 'SKIPPED'])
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'SKIPPED';

  @IsString()
  @IsOptional()
  reason?: string; // SKIPPED 시 사유
}

export class QueryEventsDto {
  @IsString()
  @IsOptional()
  type?: string; // EventType 필터

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}





