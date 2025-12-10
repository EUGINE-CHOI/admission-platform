import { Module } from '@nestjs/common';
import {
  DashboardController,
  CalendarController,
  ReportController,
} from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TaskModule } from '../task/task.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, TaskModule],
  controllers: [DashboardController, CalendarController, ReportController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}


