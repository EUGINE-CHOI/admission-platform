import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryPeriodDto } from '../dto';

@Injectable()
export class KpiService {
  constructor(private prisma: PrismaService) {}

  private getPeriodDates(period?: string): { start: Date; end: Date; previousStart: Date; previousEnd: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = now;
    let previousStart: Date;
    let previousEnd: Date;

    if (!period || period === 'month') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousStart = new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousEnd = new Date(start.getTime() - 1);
    } else if (period === 'week') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      previousStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
      previousEnd = new Date(start.getTime() - 1);
    } else if (/^\d{4}-\d{2}$/.test(period)) {
      const [year, month] = period.split('-').map(Number);
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0, 23, 59, 59);
      previousStart = new Date(year, month - 2, 1);
      previousEnd = new Date(year, month - 1, 0, 23, 59, 59);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    }

    return { start, end, previousStart, previousEnd };
  }

  async getKpiOverview(query: QueryPeriodDto) {
    const [activityRate, diagnosisRate, conversionRate, taskRate] = await Promise.all([
      this.getActivityRate(query),
      this.getDiagnosisRate(query),
      this.getConversionRate(query),
      this.getTaskRate(query),
    ]);

    const highlights: string[] = [];

    if (conversionRate.trend?.changePercent && conversionRate.trend.changePercent > 10) {
      highlights.push(`프리미엄 전환율이 전월 대비 ${conversionRate.trend.changePercent.toFixed(1)}% 상승했습니다`);
    }
    if (taskRate.value !== null && taskRate.value >= 70) {
      highlights.push(`Task 완료율이 ${taskRate.value.toFixed(1)}%로 양호합니다`);
    }
    if (diagnosisRate.value !== null && diagnosisRate.value < 50) {
      highlights.push(`진단 실행률이 ${diagnosisRate.value.toFixed(1)}%로 개선이 필요합니다`);
    }

    if (highlights.length === 0) {
      highlights.push('데이터가 수집되면 인사이트가 표시됩니다');
    }

    return {
      period: query.period || 'month',
      kpis: {
        activityRate: { value: activityRate.value, trend: activityRate.trend?.changePercent || 0 },
        diagnosisRate: { value: diagnosisRate.value, trend: diagnosisRate.trend?.changePercent || 0 },
        conversionRate: { value: conversionRate.value, trend: conversionRate.trend?.changePercent || 0 },
        taskRate: { value: taskRate.value, trend: taskRate.trend?.changePercent || 0 },
      },
      highlights,
    };
  }

  async getActivityRate(query: QueryPeriodDto) {
    const { start, end, previousStart, previousEnd } = this.getPeriodDates(query.period);

    const inputEventTypes = [
      'GRADE_ADDED',
      'ACTIVITY_ADDED',
      'READING_ADDED',
      'VOLUNTEER_ADDED',
      'ATTENDANCE_UPDATED',
    ];

    const [currentEvents, previousEvents, studentCount, eventsByType] = await Promise.all([
      this.prisma.eventLog.count({
        where: {
          type: { in: inputEventTypes as any },
          createdAt: { gte: start, lte: end },
        },
      }),
      this.prisma.eventLog.count({
        where: {
          type: { in: inputEventTypes as any },
          createdAt: { gte: previousStart, lte: previousEnd },
        },
      }),
      this.prisma.user.count({
        where: { role: 'STUDENT' },
      }),
      this.prisma.eventLog.groupBy({
        by: ['type'],
        _count: true,
        where: {
          type: { in: inputEventTypes as any },
          createdAt: { gte: start, lte: end },
        },
      }),
    ]);

    if (studentCount === 0) {
      return {
        period: query.period || 'month',
        metric: 'activity_input_rate',
        value: null,
        message: '데이터 없음',
      };
    }

    const currentRate = currentEvents / studentCount;
    const previousRate = studentCount > 0 ? previousEvents / studentCount : 0;
    const changePercent = previousRate > 0 ? ((currentRate - previousRate) / previousRate) * 100 : 0;

    return {
      period: query.period || 'month',
      metric: 'activity_input_rate',
      value: Math.round(currentRate * 100) / 100,
      unit: 'activities_per_student',
      breakdown: {
        totalEvents: currentEvents,
        totalStudents: studentCount,
        byEventType: Object.fromEntries(eventsByType.map((e) => [e.type, e._count])),
      },
      trend: {
        previousPeriod: Math.round(previousRate * 100) / 100,
        changePercent: Math.round(changePercent * 10) / 10,
      },
    };
  }

  async getDiagnosisRate(query: QueryPeriodDto) {
    const { start, end, previousStart, previousEnd } = this.getPeriodDates(query.period);

    const [currentDiagnosis, previousDiagnosis, studentCount, uniqueStudents] = await Promise.all([
      this.prisma.diagnosisResult.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      this.prisma.diagnosisResult.count({
        where: { createdAt: { gte: previousStart, lte: previousEnd } },
      }),
      this.prisma.user.count({
        where: { role: 'STUDENT' },
      }),
      this.prisma.diagnosisResult.groupBy({
        by: ['studentId'],
        where: { createdAt: { gte: start, lte: end } },
      }),
    ]);

    if (studentCount === 0) {
      return {
        period: query.period || 'month',
        metric: 'diagnosis_execution_rate',
        value: null,
        message: '데이터 없음',
      };
    }

    const currentRate = (currentDiagnosis / studentCount) * 100;
    const previousRate = (previousDiagnosis / studentCount) * 100;
    const changePercent = previousRate > 0 ? ((currentRate - previousRate) / previousRate) * 100 : 0;

    return {
      period: query.period || 'month',
      metric: 'diagnosis_execution_rate',
      value: Math.round(currentRate * 10) / 10,
      unit: 'percent',
      breakdown: {
        diagnosisCount: currentDiagnosis,
        activeStudents: studentCount,
        uniqueStudents: uniqueStudents.length,
      },
      trend: {
        previousPeriod: Math.round(previousRate * 10) / 10,
        changePercent: Math.round(changePercent * 10) / 10,
      },
    };
  }

  async getConversionRate(query: QueryPeriodDto) {
    const { start, end, previousStart, previousEnd } = this.getPeriodDates(query.period);

    const [newUsers, conversions, previousNewUsers, previousConversions, conversionsByPlan] = await Promise.all([
      this.prisma.user.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      this.prisma.subscription.count({
        where: {
          createdAt: { gte: start, lte: end },
          plan: { type: { not: 'FREE' } },
        },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: previousStart, lte: previousEnd } },
      }),
      this.prisma.subscription.count({
        where: {
          createdAt: { gte: previousStart, lte: previousEnd },
          plan: { type: { not: 'FREE' } },
        },
      }),
      this.prisma.subscription.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          plan: { type: { not: 'FREE' } },
        },
        include: { plan: { select: { type: true } } },
      }),
    ]);

    if (newUsers === 0) {
      return {
        period: query.period || 'month',
        metric: 'premium_conversion_rate',
        value: null,
        message: '데이터 없음',
      };
    }

    const currentRate = (conversions / newUsers) * 100;
    const previousRate = previousNewUsers > 0 ? (previousConversions / previousNewUsers) * 100 : 0;
    const changePercent = previousRate > 0 ? ((currentRate - previousRate) / previousRate) * 100 : 0;

    const byPlan: Record<string, number> = {};
    conversionsByPlan.forEach((s) => {
      byPlan[s.plan.type] = (byPlan[s.plan.type] || 0) + 1;
    });

    return {
      period: query.period || 'month',
      metric: 'premium_conversion_rate',
      value: Math.round(currentRate * 10) / 10,
      unit: 'percent',
      breakdown: {
        newUsers,
        conversions,
        byPlan,
      },
      trend: {
        previousPeriod: Math.round(previousRate * 10) / 10,
        changePercent: Math.round(changePercent * 10) / 10,
      },
    };
  }

  async getTaskRate(query: QueryPeriodDto) {
    const { start, end, previousStart, previousEnd } = this.getPeriodDates(query.period);

    const [currentTasks, previousTasks] = await Promise.all([
      this.prisma.weeklyTask.groupBy({
        by: ['status'],
        _count: true,
        where: { createdAt: { gte: start, lte: end } },
      }),
      this.prisma.weeklyTask.groupBy({
        by: ['status'],
        _count: true,
        where: { createdAt: { gte: previousStart, lte: previousEnd } },
      }),
    ]);

    const currentByStatus: Record<string, number> = {};
    let currentTotal = 0;
    currentTasks.forEach((t) => {
      currentByStatus[t.status] = t._count;
      currentTotal += t._count;
    });

    const previousByStatus: Record<string, number> = {};
    let previousTotal = 0;
    previousTasks.forEach((t) => {
      previousByStatus[t.status] = t._count;
      previousTotal += t._count;
    });

    if (currentTotal === 0) {
      return {
        period: query.period || 'month',
        metric: 'task_completion_rate',
        value: null,
        message: '데이터 없음',
      };
    }

    const currentDone = currentByStatus['DONE'] || 0;
    const previousDone = previousByStatus['DONE'] || 0;

    const currentRate = (currentDone / currentTotal) * 100;
    const previousRate = previousTotal > 0 ? (previousDone / previousTotal) * 100 : 0;
    const changePercent = previousRate > 0 ? ((currentRate - previousRate) / previousRate) * 100 : 0;

    return {
      period: query.period || 'month',
      metric: 'task_completion_rate',
      value: Math.round(currentRate * 10) / 10,
      unit: 'percent',
      breakdown: {
        totalTasks: currentTotal,
        byStatus: currentByStatus,
      },
      trend: {
        previousPeriod: Math.round(previousRate * 10) / 10,
        changePercent: Math.round(changePercent * 10) / 10,
      },
    };
  }
}




