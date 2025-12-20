import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Role, TaskStatus, ApprovalStatus } from '../../generated/prisma';

export interface WeeklyReportContent {
  studentName: string;
  weekStart: Date;
  weekEnd: Date;
  taskSummary: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
  };
  gradeSummary: {
    newGrades: number;
    averageRank: number | null;
    trend: 'UP' | 'DOWN' | 'FLAT' | 'N/A';
  };
  activitySummary: {
    newActivities: number;
    totalActivities: number;
  };
  highlights: string[];
  recommendations: string[];
  nextWeekFocus: string[];
}

export interface WeeklyReportResult {
  studentId: string;
  studentName: string;
  parentEmail: string;
  sent: boolean;
  error?: string;
}

@Injectable()
export class WeeklyReportService {
  private readonly logger = new Logger(WeeklyReportService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // 주간 리포트 내용 생성
  async generateWeeklyReport(studentId: string): Promise<WeeklyReportContent> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error('학생을 찾을 수 없습니다.');
    }

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(now);
    weekEnd.setHours(23, 59, 59, 999);

    // Task 요약
    const tasks = await this.prisma.weeklyTask.findMany({
      where: {
        plan: { studentId },
        OR: [
          { updatedAt: { gte: weekStart, lte: weekEnd } },
          { dueDate: { gte: weekStart, lte: weekEnd } },
        ],
      },
    });

    const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    // 성적 요약
    const grades = await this.prisma.grade.findMany({
      where: {
        studentId,
        status: ApprovalStatus.APPROVED,
      },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
    });

    const recentGrades = grades.filter(
      g => new Date(g.createdAt) >= weekStart && new Date(g.createdAt) <= weekEnd
    );

    const validGrades = grades.filter(g => g.rank !== null);
    const averageRank = validGrades.length > 0
      ? validGrades.reduce((sum, g) => sum + (g.rank as number), 0) / validGrades.length
      : null;

    // 성적 추세 계산
    let gradeTrend: 'UP' | 'DOWN' | 'FLAT' | 'N/A' = 'N/A';
    if (validGrades.length >= 2) {
      const latestAvg = validGrades.slice(0, Math.ceil(validGrades.length / 2))
        .reduce((sum, g) => sum + (g.rank as number), 0) / Math.ceil(validGrades.length / 2);
      const olderAvg = validGrades.slice(Math.ceil(validGrades.length / 2))
        .reduce((sum, g) => sum + (g.rank as number), 0) / Math.floor(validGrades.length / 2);
      
      if (latestAvg < olderAvg - 0.3) gradeTrend = 'UP';
      else if (latestAvg > olderAvg + 0.3) gradeTrend = 'DOWN';
      else gradeTrend = 'FLAT';
    }

    // 활동 요약
    const activities = await this.prisma.activity.findMany({
      where: { studentId },
    });

    const recentActivities = activities.filter(
      a => new Date(a.createdAt) >= weekStart && new Date(a.createdAt) <= weekEnd
    );

    // 하이라이트 생성
    const highlights: string[] = [];
    
    if (completionRate >= 80) {
      highlights.push(`🎉 이번 주 Task 완료율 ${completionRate}% 달성!`);
    }
    if (recentGrades.length > 0) {
      highlights.push(`📊 이번 주 ${recentGrades.length}개 과목 성적이 입력되었습니다.`);
    }
    if (recentActivities.length > 0) {
      highlights.push(`🏆 이번 주 ${recentActivities.length}개 활동이 추가되었습니다.`);
    }
    if (gradeTrend === 'UP') {
      highlights.push('📈 성적이 상승 추세입니다!');
    }

    // 추천 사항 생성
    const recommendations: string[] = [];
    
    if (completionRate < 50) {
      recommendations.push('Task 완료율이 낮습니다. 우선순위가 높은 항목부터 진행해보세요.');
    }
    if (averageRank && averageRank > 4) {
      recommendations.push('주요 과목 학습에 더 집중해보세요.');
    }
    if (activities.length < 3) {
      recommendations.push('비교과 활동을 추가하면 입시에 도움이 됩니다.');
    }

    // 다음 주 중점 사항
    const nextWeekFocus: string[] = [];
    
    const upcomingTasks = await this.prisma.weeklyTask.findMany({
      where: {
        plan: { studentId },
        status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
        dueDate: {
          gte: weekEnd,
          lte: new Date(weekEnd.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      take: 3,
    });

    upcomingTasks.forEach(task => {
      nextWeekFocus.push(`📌 ${task.title}`);
    });

    if (nextWeekFocus.length === 0) {
      nextWeekFocus.push('다음 주 계획을 세워보세요!');
    }

    return {
      studentName: student.name || '학생',
      weekStart,
      weekEnd,
      taskSummary: {
        total: tasks.length,
        completed: completedTasks,
        inProgress: inProgressTasks,
        completionRate,
      },
      gradeSummary: {
        newGrades: recentGrades.length,
        averageRank: averageRank ? Math.round(averageRank * 10) / 10 : null,
        trend: gradeTrend,
      },
      activitySummary: {
        newActivities: recentActivities.length,
        totalActivities: activities.length,
      },
      highlights,
      recommendations,
      nextWeekFocus,
    };
  }

  // 이메일 HTML 생성
  private generateEmailHtml(report: WeeklyReportContent): string {
    const trendEmoji = {
      UP: '📈',
      DOWN: '📉',
      FLAT: '➡️',
      'N/A': '❓',
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 30px; border-radius: 10px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .section { background: #f8fafc; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .section h2 { color: #6366f1; font-size: 18px; margin-top: 0; }
    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .stat-box { background: white; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: bold; color: #6366f1; }
    .stat-label { font-size: 12px; color: #64748b; }
    .list { list-style: none; padding: 0; }
    .list li { padding: 10px; background: white; margin: 8px 0; border-radius: 6px; border-left: 4px solid #6366f1; }
    .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px; }
    .progress-bar { background: #e2e8f0; border-radius: 10px; height: 10px; overflow: hidden; }
    .progress-fill { background: linear-gradient(90deg, #6366f1, #a855f7); height: 100%; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📚 주간 학습 리포트</h1>
    <p>${report.studentName}님의 ${report.weekStart.toLocaleDateString('ko-KR')} ~ ${report.weekEnd.toLocaleDateString('ko-KR')} 현황</p>
  </div>

  <div class="section">
    <h2>📋 Task 현황</h2>
    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-value">${report.taskSummary.completionRate}%</div>
        <div class="stat-label">완료율</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${report.taskSummary.completed}/${report.taskSummary.total}</div>
        <div class="stat-label">완료/전체</div>
      </div>
    </div>
    <div style="margin-top: 15px;">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${report.taskSummary.completionRate}%"></div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>📊 성적 현황</h2>
    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-value">${report.gradeSummary.averageRank || '-'}</div>
        <div class="stat-label">평균 등급</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${trendEmoji[report.gradeSummary.trend]}</div>
        <div class="stat-label">추세</div>
      </div>
    </div>
  </div>

  ${report.highlights.length > 0 ? `
  <div class="section">
    <h2>🌟 이번 주 하이라이트</h2>
    <ul class="list">
      ${report.highlights.map(h => `<li>${h}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${report.recommendations.length > 0 ? `
  <div class="section">
    <h2>💡 추천 사항</h2>
    <ul class="list">
      ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="section">
    <h2>🎯 다음 주 중점 사항</h2>
    <ul class="list">
      ${report.nextWeekFocus.map(f => `<li>${f}</li>`).join('')}
    </ul>
  </div>

  <div class="footer">
    <p>3m5m - 생기부 입력 3분, 합격 전략 5분</p>
    <p>더 자세한 내용은 <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard/parent">대시보드</a>에서 확인하세요.</p>
  </div>
</body>
</html>
    `;
  }

  // 특정 학생의 리포트 발송
  async sendWeeklyReport(studentId: string): Promise<WeeklyReportResult> {
    try {
      const student = await this.prisma.user.findUnique({
        where: { id: studentId },
        include: {
          family: {
            include: {
              members: {
                where: { role: Role.PARENT },
              },
            },
          },
        },
      });

      if (!student) {
        return {
          studentId,
          studentName: '알 수 없음',
          parentEmail: '',
          sent: false,
          error: '학생을 찾을 수 없습니다.',
        };
      }

      const parent = student.family?.members[0];
      if (!parent) {
        return {
          studentId,
          studentName: student.name || '알 수 없음',
          parentEmail: '',
          sent: false,
          error: '연결된 학부모가 없습니다.',
        };
      }

      const report = await this.generateWeeklyReport(studentId);
      const html = this.generateEmailHtml(report);

      await this.emailService.sendEmail({
        to: parent.email,
        subject: `[3m5m] ${report.studentName}님의 주간 학습 리포트`,
        html,
      });

      // 발송 기록 저장
      await this.prisma.weeklyReportLog.create({
        data: {
          studentId,
          parentId: parent.id,
          weekStart: report.weekStart,
          weekEnd: report.weekEnd,
          content: JSON.stringify(report),
          emailSent: true,
        },
      });

      return {
        studentId,
        studentName: student.name || '알 수 없음',
        parentEmail: parent.email,
        sent: true,
      };
    } catch (error) {
      this.logger.error(`Failed to send weekly report for student ${studentId}:`, error);
      return {
        studentId,
        studentName: '',
        parentEmail: '',
        sent: false,
        error: error.message,
      };
    }
  }

  // 모든 학생에게 주간 리포트 발송 (Cron Job)
  @Cron(CronExpression.EVERY_WEEK)  // 매주 실행 (기본: 일요일 00:00)
  async sendAllWeeklyReports(): Promise<WeeklyReportResult[]> {
    this.logger.log('Starting weekly report generation...');

    const students = await this.prisma.user.findMany({
      where: {
        role: Role.STUDENT,
        familyId: { not: null },  // 가족 연결된 학생만
      },
    });

    const results: WeeklyReportResult[] = [];

    for (const student of students) {
      const result = await this.sendWeeklyReport(student.id);
      results.push(result);
    }

    const successCount = results.filter(r => r.sent).length;
    this.logger.log(`Weekly reports sent: ${successCount}/${results.length}`);

    return results;
  }

  // 특정 학생의 주간 리포트 미리보기
  async previewWeeklyReport(studentId: string): Promise<{ report: WeeklyReportContent; html: string }> {
    const report = await this.generateWeeklyReport(studentId);
    const html = this.generateEmailHtml(report);
    return { report, html };
  }

  // 과거 리포트 조회
  async getReportHistory(studentId: string, limit = 10): Promise<any[]> {
    const logs = await this.prisma.weeklyReportLog.findMany({
      where: { studentId },
      orderBy: { sentAt: 'desc' },
      take: limit,
    });

    return logs.map(log => ({
      id: log.id,
      weekStart: log.weekStart,
      weekEnd: log.weekEnd,
      sentAt: log.sentAt,
      emailSent: log.emailSent,
      content: JSON.parse(log.content),
    }));
  }
}

