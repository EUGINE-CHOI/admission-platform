import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import {
  GradeAnalysisController,
  SchoolCompareController,
  PlanToTaskController,
  InterviewPrepController,
  DDayController,
} from './synergy.controller';
import { GradeAnalysisService } from '../student/grade-analysis.service';
import { SchoolCompareService } from '../school/school-compare.service';
import { PlanToTaskService } from '../task/plan-to-task.service';
import { InterviewPrepService } from '../ai/interview-prep.service';
import { DDayService } from '../dashboard/dday.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [
    GradeAnalysisController,
    SchoolCompareController,
    PlanToTaskController,
    InterviewPrepController,
    DDayController,
  ],
  providers: [
    GradeAnalysisService,
    SchoolCompareService,
    PlanToTaskService,
    InterviewPrepService,
    DDayService,
  ],
  exports: [
    GradeAnalysisService,
    SchoolCompareService,
    PlanToTaskService,
    InterviewPrepService,
    DDayService,
  ],
})
export class SynergyModule {}

