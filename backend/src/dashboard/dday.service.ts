import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DDayItem {
  id: string;
  title: string;
  date: Date;
  daysLeft: number;
  type: 'admission' | 'task' | 'exam' | 'custom';
  school?: string;
  priority: 'urgent' | 'important' | 'normal';
  description?: string;
}

export interface DDayDashboard {
  mainDDay: DDayItem | null;
  upcoming: DDayItem[];
  passed: DDayItem[];
  milestones: {
    title: string;
    date: Date;
    completed: boolean;
  }[];
  timeline: {
    month: string;
    events: DDayItem[];
  }[];
}

@Injectable()
export class DDayService {
  constructor(private prisma: PrismaService) {}

  // D-Day 대시보드 조회
  async getDDayDashboard(studentId: string): Promise<DDayDashboard> {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 목표 학교의 입시 일정 조회
    const targetSchools = await this.prisma.targetSchool.findMany({
      where: { studentId },
      include: {
        school: {
          include: {
            schedules: {
              where: {
                startDate: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }, // 30일 전부터
              },
              orderBy: { startDate: 'asc' },
            },
          },
        },
      },
    });

    // 학생의 액션플랜 태스크 중 마감일이 있는 것들 조회
    const actionPlans = await this.prisma.actionPlan.findMany({
      where: { studentId, status: 'ACTIVE' },
      include: {
        tasks: {
          where: {
            dueDate: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
            status: { not: 'DONE' },
          },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    // 플랫하게 태스크 리스트 만들기
    const tasks = actionPlans.flatMap((plan) => plan.tasks);

    // D-Day 아이템 생성
    const ddayItems: DDayItem[] = [];

    // 입시 일정 추가
    for (const target of targetSchools) {
      for (const schedule of target.school.schedules) {
        const daysLeft = Math.ceil(
          (schedule.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        ddayItems.push({
          id: schedule.id,
          title: schedule.title,
          date: schedule.startDate,
          daysLeft,
          type: 'admission',
          school: target.school.name,
          priority: this.calculatePriority(daysLeft, 'admission'),
          description: schedule.note ?? undefined,
        });
      }
    }

    // Task 마감일 추가
    for (const task of tasks) {
      if (task.dueDate) {
        const daysLeft = Math.ceil(
          (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        ddayItems.push({
          id: task.id,
          title: task.title,
          date: task.dueDate,
          daysLeft,
          type: 'task',
          priority: this.calculatePriority(daysLeft, 'task'),
          description: task.description ?? undefined,
        });
      }
    }

    // 정렬 (가장 가까운 순)
    ddayItems.sort((a, b) => a.daysLeft - b.daysLeft);

    // 지난 일정과 다가오는 일정 분리
    const upcoming = ddayItems.filter((item) => item.daysLeft >= 0);
    const passed = ddayItems.filter((item) => item.daysLeft < 0).slice(0, 5);

    // 메인 D-Day (가장 중요한 다가오는 일정)
    const mainDDay = this.selectMainDDay(upcoming);

    // 마일스톤 생성
    const milestones = this.generateMilestones(now, targetSchools);

    // 타임라인 생성 (월별 그룹화)
    const timeline = this.generateTimeline(upcoming);

    return {
      mainDDay,
      upcoming: upcoming.slice(0, 10),
      passed,
      milestones,
      timeline,
    };
  }

  // 커스텀 D-Day 추가
  async addCustomDDay(
    studentId: string,
    data: {
      title: string;
      date: Date;
      description?: string;
      type?: 'exam' | 'custom';
    },
  ): Promise<DDayItem> {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 기존 또는 새 액션 플랜에 D-Day 추가
    let actionPlan = await this.prisma.actionPlan.findFirst({
      where: { studentId, status: 'ACTIVE' },
    });

    if (!actionPlan) {
      actionPlan = await this.prisma.actionPlan.create({
        data: {
          studentId,
          title: '개인 일정',
          startDate: now,
          endDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });
    }

    const task = await this.prisma.weeklyTask.create({
      data: {
        planId: actionPlan.id,
        weekNumber: 1,
        theme: 'D-Day',
        title: `[D-Day] ${data.title}`,
        description: data.description,
        dueDate: data.date,
        status: 'TODO',
      },
    });

    const daysLeft = Math.ceil(
      (data.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      id: task.id,
      title: data.title,
      date: data.date,
      daysLeft,
      type: data.type || 'custom',
      priority: this.calculatePriority(daysLeft, 'custom'),
      description: data.description,
    };
  }

  // D-Day 알림 설정 확인
  async checkDDayAlerts(studentId: string): Promise<{
    alerts: {
      item: DDayItem;
      message: string;
    }[];
  }> {
    const dashboard = await this.getDDayDashboard(studentId);
    const alerts: { item: DDayItem; message: string }[] = [];

    for (const item of dashboard.upcoming) {
      if (item.daysLeft === 0) {
        alerts.push({
          item,
          message: `🚨 오늘입니다! ${item.title}`,
        });
      } else if (item.daysLeft === 1) {
        alerts.push({
          item,
          message: `⚠️ 내일입니다! ${item.title}`,
        });
      } else if (item.daysLeft === 3) {
        alerts.push({
          item,
          message: `📢 3일 남았습니다: ${item.title}`,
        });
      } else if (item.daysLeft === 7) {
        alerts.push({
          item,
          message: `📅 일주일 남았습니다: ${item.title}`,
        });
      }
    }

    return { alerts };
  }

  private calculatePriority(
    daysLeft: number,
    type: string,
  ): 'urgent' | 'important' | 'normal' {
    if (daysLeft <= 3) return 'urgent';
    // 입시 일정은 30일 이내일 때 important, 일반 항목은 14일 이내일 때 important
    if (type === 'admission') {
      if (daysLeft <= 30) return 'important';
    } else {
      if (daysLeft <= 14) return 'important';
    }
    return 'normal';
  }

  private selectMainDDay(items: DDayItem[]): DDayItem | null {
    // 입시 일정 우선
    const admissionItems = items.filter((item) => item.type === 'admission');
    if (admissionItems.length > 0) {
      return admissionItems[0];
    }
    return items[0] || null;
  }

  private generateMilestones(
    now: Date,
    targetSchools: any[],
  ): DDayDashboard['milestones'] {
    const milestones: DDayDashboard['milestones'] = [];
    
    // 기본 마일스톤 (연간 입시 일정 기준)
    const year = now.getFullYear();
    const isAfterSeptember = now.getMonth() >= 8;
    const admissionYear = isAfterSeptember ? year : year - 1;

    const defaultMilestones = [
      { title: '1학기 기말고사', date: new Date(admissionYear, 5, 20) },
      { title: '2학기 중간고사', date: new Date(admissionYear, 9, 15) },
      { title: '원서 접수 시작', date: new Date(admissionYear, 10, 1) },
      { title: '원서 접수 마감', date: new Date(admissionYear, 10, 15) },
      { title: '1차 전형', date: new Date(admissionYear, 11, 1) },
      { title: '면접', date: new Date(admissionYear, 11, 15) },
      { title: '최종 발표', date: new Date(admissionYear, 11, 25) },
    ];

    for (const milestone of defaultMilestones) {
      milestones.push({
        ...milestone,
        completed: milestone.date < now,
      });
    }

    return milestones;
  }

  private generateTimeline(items: DDayItem[]): DDayDashboard['timeline'] {
    const grouped: Record<string, DDayItem[]> = {};

    for (const item of items) {
      const month = item.date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
      });

      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(item);
    }

    return Object.entries(grouped).map(([month, events]) => ({
      month,
      events,
    }));
  }
}

