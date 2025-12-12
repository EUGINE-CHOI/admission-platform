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
  written: number;

  @IsInt()
  @Min(0)
  @Max(100)
  performance: number;

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
  written?: number;

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






