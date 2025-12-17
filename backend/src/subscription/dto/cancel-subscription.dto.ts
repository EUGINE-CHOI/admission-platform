import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CancelSubscriptionDto {
  @IsString()
  @IsOptional()
  reason?: string;

  @IsBoolean()
  @IsOptional()
  immediate?: boolean;  // true면 즉시 취소, false면 기간 만료 후 취소
}








