import { Module } from '@nestjs/common';
import {
  SubscriptionController,
  PaymentWebhookController,
} from './subscription.controller';
import { PaymentController } from './payment.controller';
import { SubscriptionService } from './subscription.service';
import { TossPaymentService } from './toss-payment.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PlanModule } from '../plan/plan.module';

@Module({
  imports: [PrismaModule, PlanModule],
  controllers: [SubscriptionController, PaymentWebhookController, PaymentController],
  providers: [SubscriptionService, TossPaymentService],
  exports: [SubscriptionService, TossPaymentService],
})
export class SubscriptionModule {}

