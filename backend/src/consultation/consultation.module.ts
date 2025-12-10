import { Module, forwardRef } from '@nestjs/common';
import { ConsultationController, ReceivedReportsController } from './consultation.controller';
import { ConsultationService } from './consultation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [PrismaModule, AiModule, forwardRef(() => SubscriptionModule)],
  controllers: [ConsultationController, ReceivedReportsController],
  providers: [ConsultationService],
  exports: [ConsultationService],
})
export class ConsultationModule {}

