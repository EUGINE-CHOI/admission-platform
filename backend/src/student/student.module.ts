import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { GoalTrackerController } from './goal-tracker.controller';
import { GoalTrackerService } from './goal-tracker.service';
import { GradeAnalysisService } from './grade-analysis.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [StudentController, GoalTrackerController],
  providers: [StudentService, GoalTrackerService, GradeAnalysisService],
  exports: [StudentService, GoalTrackerService, GradeAnalysisService],
})
export class StudentModule {}









