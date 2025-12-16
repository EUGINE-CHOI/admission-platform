import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { StatsService } from './services/stats.service';
import { KpiService } from './services/kpi.service';
import { AiQualityService } from './services/ai-quality.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [StatsService, KpiService, AiQualityService],
  exports: [StatsService, KpiService, AiQualityService],
})
export class AdminModule {}






