import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { WeeklyReportController } from './weekly-report.controller';
import { WeeklyReportService } from './weekly-report.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, AuthModule, EmailModule, ScheduleModule.forRoot()],
  controllers: [ReportController, WeeklyReportController],
  providers: [ReportService, WeeklyReportService],
  exports: [ReportService, WeeklyReportService],
})
export class ReportModule {}



