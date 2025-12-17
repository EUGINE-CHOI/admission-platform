import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum WebhookEventType {
  PAYMENT_APPROVED = 'PAYMENT_APPROVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_CANCELLED = 'PAYMENT_CANCELLED',
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',
}

export class PaymentWebhookDto {
  @IsEnum(WebhookEventType)
  eventType: WebhookEventType;

  @IsString()
  paymentKey: string;

  @IsString()
  orderId: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  failReason?: string;

  @IsString()
  @IsOptional()
  transactionId?: string;
}








