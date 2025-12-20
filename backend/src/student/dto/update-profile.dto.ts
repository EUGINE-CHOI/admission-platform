import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  schoolName?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(3)
  grade?: number;
}










