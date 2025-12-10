import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FamilyModule } from './family/family.module';
import { StudentModule } from './student/student.module';
import { SchoolModule } from './school/school.module';
import { DiagnosisModule } from './diagnosis/diagnosis.module';
import { AiModule } from './ai/ai.module';
import { TaskModule } from './task/task.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ConsultantModule } from './consultant/consultant.module';
import { ConsultationModule } from './consultation/consultation.module';
import { PlanModule } from './plan/plan.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    FamilyModule,
    StudentModule,
    SchoolModule,
    DiagnosisModule,
    AiModule,
    TaskModule,
    DashboardModule,
    ConsultantModule,
    ConsultationModule,
    PlanModule,
    SubscriptionModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
