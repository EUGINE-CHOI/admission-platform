import { IsString, IsEnum, IsOptional } from 'class-validator';
import { PlanType } from '../../../generated/prisma';

export class CreateSubscriptionDto {
  @IsEnum(PlanType)
  planType: PlanType;

  @IsString()
  @IsOptional()
  paymentMethodId?: string;  // 결제 수단 ID (PG)
}

export class UpgradeSubscriptionDto {
  @IsEnum(PlanType)
  newPlanType: PlanType;
}

export class DowngradeSubscriptionDto {
  @IsEnum(PlanType)
  newPlanType: PlanType;
}

export class UpdatePaymentMethodDto {
  @IsString()
  paymentMethodId: string;
}








