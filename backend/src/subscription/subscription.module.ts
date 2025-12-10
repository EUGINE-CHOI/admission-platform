import { Module } from '@nestjs/common';
import {
  SubscriptionController,
  PaymentWebhookController,
} from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PlanModule } from '../plan/plan.module';

@Module({
  imports: [PrismaModule, PlanModule],
  controllers: [SubscriptionController, PaymentWebhookController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

