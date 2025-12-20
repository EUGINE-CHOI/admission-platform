import { IsNotEmpty, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class AddTargetSchoolDto {
  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  priority?: number;
}

export class UpdatePriorityDto {
  @IsInt()
  @Min(1)
  @Max(5)
  priority: number;
}










