import { Module, Global } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { EmailSchedulerService } from './email-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Global()
@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [NotificationController],
  providers: [NotificationService, EmailSchedulerService],
  exports: [NotificationService],
})
export class NotificationModule {}



