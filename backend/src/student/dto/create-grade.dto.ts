import { IsInt, IsNotEmpty, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateGradeDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsInt()
  @Min(2020)
  year: number;

  @IsInt()
  @Min(1)
  @Max(2)
  semester: number;

  @IsInt()
  @Min(0)
  @Max(100)
  written1: number; // 1회고사 (중간고사)

  @IsInt()
  @Min(0)
  @Max(100)
  written2: number; // 2회고사 (기말고사)

  @IsInt()
  @Min(0)
  @Max(100)
  performance: number; // 수행평가

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(9)
  rank?: number;
}

export class UpdateGradeDto {
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  written1?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  written2?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  performance?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(9)
  rank?: number;
}












