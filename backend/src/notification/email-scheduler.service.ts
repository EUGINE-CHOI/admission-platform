import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class EmailSchedulerService {
  private readonly logger = new Logger(EmailSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * 매일 아침 9시에 D-Day 알림 발송
   * 7일 이내 일정이 있는 사용자에게 알림
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDDayReminders() {
    this.logger.log('Starting D-Day reminder job...');

    try {
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

      // 7일 이내 D-Day 이벤트 조회
      const ddayEvents = await this.prisma.customDDay.findMany({
        where: {
          date: {
            gte: new Date(),
            lte: sevenDaysLater,
          },
        },
        include: {
          student: true,
        },
        orderBy: { date: 'asc' },
      });

      // 사용자별로 그룹핑
      const userEvents = new Map<string, { user: any; events: any[] }>();
      
      for (const event of ddayEvents) {
        const student = (event as any).student;
        if (!student) continue;
        
        if (!userEvents.has(event.studentId)) {
          userEvents.set(event.studentId, { user: student, events: [] });
        }
        userEvents.get(event.studentId)!.events.push(event);
      }

      this.logger.log(`Found ${userEvents.size} users with upcoming D-Days`);

      for (const [, { user, events }] of userEvents) {
        const emailEvents = events.map(e => ({
          title: e.title,
          date: e.date.toLocaleDateString('ko-KR'),
          daysLeft: Math.ceil(
            (e.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          ),
        }));

        await this.emailService.sendDDayReminder(
          user.email,
          user.name || '학생',
          emailEvents,
        );
      }

      this.logger.log(`D-Day reminders sent to ${userEvents.size} users`);
    } catch (error) {
      this.logger.error('Failed to send D-Day reminders:', error);
    }
  }

  /**
   * 매주 일요일 저녁 8시에 주간 리포트 발송
   */
  @Cron('0 20 * * 0') // 매주 일요일 20:00
  async sendWeeklyReports() {
    this.logger.log('Starting weekly report job...');

    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // 활성 학생들 조회
      const students = await this.prisma.user.findMany({
        where: {
          role: 'STUDENT',
        },
      });

      this.logger.log(`Found ${students.length} students for weekly report`);

      for (const student of students) {
        // 각 학생의 이번 주 태스크 조회
        const tasks = await this.prisma.weeklyTask.findMany({
          where: {
            plan: {
              studentId: student.id,
            },
            updatedAt: { gte: oneWeekAgo },
          },
        });

        // 이번 주 획득 뱃지 조회
        const badges = await this.prisma.userBadge.findMany({
          where: {
            userId: student.id,
            earnedAt: { gte: oneWeekAgo },
          },
        });

        const completedTasks = tasks.filter(t => t.status === 'DONE').length;
        const totalTasks = tasks.length;
        const badgesEarned = badges.length;

        // 활동이 없으면 스킵
        if (totalTasks === 0 && badgesEarned === 0) continue;

        await this.emailService.sendWeeklyReport(
          student.email,
          student.name || '학생',
          {
            completedTasks,
            totalTasks,
            badgesEarned: badgesEarned > 0 ? badgesEarned : undefined,
          },
        );
      }

      this.logger.log(`Weekly reports sent`);
    } catch (error) {
      this.logger.error('Failed to send weekly reports:', error);
    }
  }

  /**
   * 상담 1시간 전 리마인더 발송
   * 매시간 정각에 실행
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendConsultationReminders() {
    this.logger.log('Checking for upcoming consultations...');

    try {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      const consultations = await this.prisma.consultation.findMany({
        where: {
          status: 'CONFIRMED',
          scheduledAt: {
            gte: now,
            lte: oneHourLater,
          },
        },
        include: {
          student: true,
          consultant: true,
        },
      });

      this.logger.log(`Found ${consultations.length} consultations in the next hour`);

      for (const consultation of consultations) {
        const date = consultation.scheduledAt?.toLocaleDateString('ko-KR') || '';
        const time = consultation.scheduledAt?.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }) || '';

        // 학생에게 알림
        if (consultation.student?.email) {
          await this.emailService.sendConsultationNotification(
            consultation.student.email,
            consultation.student.name || '학생',
            'reminder',
            {
              date,
              time,
              consultantName: consultation.consultant?.name || undefined,
            },
          );
        }

        // 컨설턴트에게 알림
        if (consultation.consultant?.email) {
          await this.emailService.sendConsultationNotification(
            consultation.consultant.email,
            consultation.consultant.name || '컨설턴트',
            'reminder',
            {
              date,
              time,
              studentName: consultation.student?.name || undefined,
            },
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to send consultation reminders:', error);
    }
  }
}

