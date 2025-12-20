import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryPeriodDto } from '../dto';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  private getPeriodDates(period?: string): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (!period || period === 'month') {
      // 최근 30일
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === 'week') {
      // 최근 7일
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'quarter') {
      // 최근 90일
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (/^\d{4}-\d{2}$/.test(period)) {
      // YYYY-MM 형식
      const [year, month] = period.split('-').map(Number);
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0, 23, 59, 59);
    } else if (/^\d{4}-W\d{2}$/.test(period)) {
      // YYYY-Www 형식 (ISO week)
      const [year, week] = period.split('-W').map(Number);
      start = this.getDateOfISOWeek(week, year);
      end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
      end.setHours(23, 59, 59);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
      // YYYY-MM-DD 형식
      start = new Date(period);
      end = new Date(period);
      end.setHours(23, 59, 59);
    } else {
      // 기본: 이번 달
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { start, end };
  }

  private getDateOfISOWeek(week: number, year: number): Date {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
  }

  async getOverview(query: QueryPeriodDto) {
    const { start, end } = this.getPeriodDates(query.period);

    // 사용자 통계
    const [totalUsers, newUsers, usersByRole] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ]);

    // 이벤트 통계
    const [totalEvents, eventsByType] = await Promise.all([
      this.prisma.eventLog.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      this.prisma.eventLog.groupBy({
        by: ['type'],
        _count: true,
        where: { createdAt: { gte: start, lte: end } },
      }),
    ]);

    // 구독 통계
    const [activeSubscriptions, subscriptionsByPlan] = await Promise.all([
      this.prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.subscription.groupBy({
        by: ['planId'],
        _count: true,
        where: { status: 'ACTIVE' },
      }),
    ]);

    // 플랜 정보 조회
    const plans = await this.prisma.plan.findMany();
    const planMap = new Map(plans.map((p) => [p.id, p.type]));

    const byPlan: Record<string, number> = {};
    subscriptionsByPlan.forEach((s) => {
      const planType = planMap.get(s.planId) || 'UNKNOWN';
      byPlan[planType] = s._count;
    });

    // FREE 사용자 계산 (구독 없는 사용자)
    const freeUsers = totalUsers - activeSubscriptions;
    byPlan['FREE'] = freeUsers > 0 ? freeUsers : 0;

    return {
      period: query.period || 'month',
      periodRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      users: {
        total: totalUsers,
        newThisPeriod: newUsers,
        byRole: Object.fromEntries(
          usersByRole.map((u) => [u.role, u._count]),
        ),
      },
      activities: {
        totalEvents,
        byType: Object.fromEntries(
          eventsByType.map((e) => [e.type, e._count]),
        ),
      },
      subscriptions: {
        activeCount: activeSubscriptions,
        byPlan,
      },
    };
  }

  async getUserStats(query: QueryPeriodDto) {
    const { start, end } = this.getPeriodDates(query.period);
    const groupBy = query.groupBy || 'day';

    // 일별/주별/월별 신규 가입자 집계
    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true, role: true },
      orderBy: { createdAt: 'asc' },
    });

    // 그룹화
    const grouped = new Map<string, { signups: number; byRole: Record<string, number> }>();

    users.forEach((user) => {
      let key: string;
      const date = user.createdAt;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const week = this.getISOWeek(date);
        key = `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped.has(key)) {
        grouped.set(key, { signups: 0, byRole: {} });
      }
      const entry = grouped.get(key)!;
      entry.signups++;
      entry.byRole[user.role] = (entry.byRole[user.role] || 0) + 1;
    });

    return {
      period: query.period || 'month',
      groupBy,
      data: Array.from(grouped.entries()).map(([date, stats]) => ({
        date,
        signups: stats.signups,
        byRole: stats.byRole,
      })),
      total: users.length,
    };
  }

  async getEventStats(query: QueryPeriodDto) {
    const { start, end } = this.getPeriodDates(query.period);

    const [eventsByType, eventsByDay] = await Promise.all([
      this.prisma.eventLog.groupBy({
        by: ['type'],
        _count: true,
        where: { createdAt: { gte: start, lte: end } },
        orderBy: { _count: { type: 'desc' } },
      }),
      this.prisma.eventLog.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { createdAt: true, type: true },
      }),
    ]);

    // 일별 집계
    const dailyMap = new Map<string, number>();
    eventsByDay.forEach((e) => {
      const key = e.createdAt.toISOString().split('T')[0];
      dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
    });

    return {
      period: query.period || 'month',
      totalEvents: eventsByDay.length,
      byType: eventsByType.map((e) => ({
        type: e.type,
        count: e._count,
      })),
      daily: Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  private getISOWeek(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}








