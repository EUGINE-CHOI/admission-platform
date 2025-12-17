import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateAttendanceDto {
  @IsInt()
  @Min(2020)
  year: number;

  @IsInt()
  @Min(1)
  @Max(2)
  semester: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  absenceDisease?: number = 0;

  @IsInt()
  @IsOptional()
  @Min(0)
  absenceUnexcused?: number = 0;

  @IsInt()
  @IsOptional()
  @Min(0)
  absenceOther?: number = 0;

  @IsInt()
  @IsOptional()
  @Min(0)
  latenessCount?: number = 0;

  @IsInt()
  @IsOptional()
  @Min(0)
  earlyLeaveCount?: number = 0;
}

export class UpdateAttendanceDto {
  @IsInt()
  @IsOptional()
  @Min(0)
  absenceDisease?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  absenceUnexcused?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  absenceOther?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  latenessCount?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  earlyLeaveCount?: number;
}









