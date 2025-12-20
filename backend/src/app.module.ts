import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
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
import { CrawlerModule } from './crawler/crawler.module';
import { MiddleSchoolModule } from './middle-school/middle-school.module';
import { ClubModule } from './club/club.module';
import { NotificationModule } from './notification/notification.module';
import { NewsModule } from './news/news.module';
import { ReportModule } from './report/report.module';
import { EmailModule } from './email/email.module';
import { SynergyModule } from './synergy/synergy.module';
import { GamificationModule } from './gamification/gamification.module';
import { CommunityModule } from './community/community.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate Limiting: 기본 1분당 60회 제한
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1초
        limit: 3, // 초당 3회 (DDoS 방지)
      },
      {
        name: 'medium',
        ttl: 10000, // 10초
        limit: 20, // 10초당 20회
      },
      {
        name: 'long',
        ttl: 60000, // 1분
        limit: 100, // 1분당 100회
      },
    ]),
    CommonModule,
    PrismaModule,
    NotificationModule,
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
    CrawlerModule,
    MiddleSchoolModule,
    ClubModule,
    NewsModule,
    ReportModule,
    EmailModule,
    SynergyModule,
    GamificationModule,
    CommunityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 전역 Rate Limiting 가드
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
