import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryPlanDto {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  activeOnly?: boolean;
}




