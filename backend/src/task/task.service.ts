import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus, EventType } from '../../generated/prisma';
import { UpdateTaskStatusDto, QueryEventsDto } from './dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  // ========== WP6.1: Task 조회 ==========
  async getCurrentWeekTasks(studentId: string) {
    const activePlan = await this.prisma.actionPlan.findFirst({
      where: { studentId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    if (!activePlan) {
      return { tasks: [], message: '활성화된 플랜이 없습니다' };
    }

    // 현재 주차 계산
    const now = new Date();
    const planStart = new Date(activePlan.startDate);
    const diffTime = now.getTime() - planStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const currentWeek = Math.max(1, Math.min(12, Math.floor(diffDays / 7) + 1));

    const tasks = await this.prisma.weeklyTask.findMany({
      where: { planId: activePlan.id, weekNumber: currentWeek },
      orderBy: { createdAt: 'asc' },
    });

    return {
      planId: activePlan.id,
      weekNumber: currentWeek,
      theme: tasks[0]?.theme || null,
      tasks,
    };
  }

  async getPlanTasks(studentId: string, planId: string) {
    const plan = await this.prisma.actionPlan.findFirst({
      where: { id: planId, studentId },
      include: {
        tasks: {
          orderBy: [{ weekNumber: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('플랜을 찾을 수 없습니다');
    }

    // 주차별 그룹화
    const weeklyGroups = plan.tasks.reduce((acc: any, task) => {
      const week = task.weekNumber;
      if (!acc[week]) {
        acc[week] = {
          weekNumber: week,
          theme: task.theme,
          tasks: [],
        };
      }
      acc[week].tasks.push(task);
      return acc;
    }, {});

    return {
      planId: plan.id,
      title: plan.title,
      startDate: plan.startDate,
      endDate: plan.endDate,
      status: plan.status,
      weeks: Object.values(weeklyGroups),
    };
  }

  async getWeekTasks(studentId: string, planId: string, weekNum: number) {
    const plan = await this.prisma.actionPlan.findFirst({
      where: { id: planId, studentId },
    });

    if (!plan) {
      throw new NotFoundException('플랜을 찾을 수 없습니다');
    }

    const tasks = await this.prisma.weeklyTask.findMany({
      where: { planId, weekNumber: weekNum },
      orderBy: { createdAt: 'asc' },
    });

    return {
      weekNumber: weekNum,
      theme: tasks[0]?.theme || null,
      tasks,
    };
  }

  // ========== WP6.2: Task 상태 변경 ==========
  async updateTaskStatus(
    studentId: string,
    taskId: string,
    dto: UpdateTaskStatusDto,
  ) {
    const task = await this.prisma.weeklyTask.findUnique({
      where: { id: taskId },
      include: { plan: true },
    });

    if (!task) {
      throw new NotFoundException('Task를 찾을 수 없습니다');
    }

    if (task.plan.studentId !== studentId) {
      throw new ForbiddenException('이 작업을 변경할 권한이 없습니다');
    }

    const now = new Date();
    const updateData: any = {
      status: dto.status as TaskStatus,
    };

    // 완료 시 completedAt 설정
    if (dto.status === 'DONE') {
      updateData.completedAt = now;
    } else if (dto.status === 'TODO') {
      updateData.completedAt = null;
    }

    const updated = await this.prisma.weeklyTask.update({
      where: { id: taskId },
      data: updateData,
    });

    // Event Log 기록
    let eventType: EventType;
    let eventTitle: string;
    let eventDescription: string | undefined;

    switch (dto.status) {
      case 'IN_PROGRESS':
        eventType = EventType.TASK_STARTED;
        eventTitle = `할 일 시작: ${task.title}`;
        break;
      case 'DONE':
        eventType = EventType.TASK_COMPLETED;
        eventTitle = `할 일 완료: ${task.title}`;
        break;
      case 'SKIPPED':
        eventType = EventType.TASK_SKIPPED;
        eventTitle = `할 일 건너뜀: ${task.title}`;
        eventDescription = dto.reason;
        break;
      default:
        eventType = EventType.TASK_STARTED;
        eventTitle = `할 일 상태 변경: ${task.title}`;
    }

    const event = await this.createEvent(
      task.plan.studentId,
      eventType,
      eventTitle,
      eventDescription,
      taskId,
    );

    return { task: updated, event };
  }

  async getPlanProgress(studentId: string, planId: string) {
    const plan = await this.prisma.actionPlan.findFirst({
      where: { id: planId, studentId },
    });

    if (!plan) {
      throw new NotFoundException('플랜을 찾을 수 없습니다');
    }

    const tasks = await this.prisma.weeklyTask.findMany({
      where: { planId },
    });

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'DONE').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const skipped = tasks.filter((t) => t.status === 'SKIPPED').length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;

    return {
      planId,
      totalTasks: total,
      completed,
      inProgress,
      skipped,
      todo,
      progressRate: total > 0 ? Math.round((completed / total) * 100 * 10) / 10 : 0,
      completionRate: total > 0 ? Math.round(((completed + skipped) / total) * 100 * 10) / 10 : 0,
    };
  }

  // ========== WP6.3: Event Log ==========
  async createEvent(
    studentId: string,
    type: EventType,
    title: string,
    description?: string,
    referenceId?: string,
    metadata?: any,
  ) {
    return this.prisma.eventLog.create({
      data: {
        studentId,
        type,
        title,
        description,
        referenceId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  async getEvents(studentId: string, query: QueryEventsDto) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = { studentId };

    if (query.type) {
      where.type = query.type as EventType;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [events, total] = await Promise.all([
      this.prisma.eventLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.eventLog.count({ where }),
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getChildEvents(parentId: string, childId: string, query: QueryEventsDto) {
    await this.validateFamilyRelation(parentId, childId);
    return this.getEvents(childId, query);
  }

  // ========== WP6.4: Timeline ==========
  async getTimeline(studentId: string, query: QueryEventsDto) {
    const events = await this.getEvents(studentId, { ...query, limit: '50' });

    // 월별 그룹화
    const grouped = events.events.reduce((acc: any, event) => {
      const date = new Date(event.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[key]) {
        acc[key] = {
          month: key,
          events: [],
        };
      }
      acc[key].events.push(event);
      return acc;
    }, {});

    return {
      timeline: Object.values(grouped),
      pagination: events.pagination,
    };
  }

  async getChildTimeline(parentId: string, childId: string, query: QueryEventsDto) {
    await this.validateFamilyRelation(parentId, childId);
    return this.getTimeline(childId, query);
  }

  // ========== 유틸리티 ==========
  private async validateFamilyRelation(parentId: string, childId: string) {
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
      select: { familyId: true },
    });

    const child = await this.prisma.user.findUnique({
      where: { id: childId },
      select: { familyId: true },
    });

    if (
      !parent?.familyId ||
      !child?.familyId ||
      parent.familyId !== child.familyId
    ) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }
  }
}










