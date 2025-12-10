import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskService } from '../task/task.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private taskService: TaskService,
  ) {}

  // ========== WP7.1: 학생 대시보드 ==========
  async getStudentDashboard(studentId: string) {
    // 1. 오늘의 할 일 (현재 주차 Task)
    const currentWeekData: any = await this.taskService.getCurrentWeekTasks(studentId);
    const todayTasks = currentWeekData.tasks?.filter(
      (t: any) => t.status === 'TODO' || t.status === 'IN_PROGRESS',
    ) || [];

    // 2. 이번 주 플랜 요약
    let weekSummary: any = null;
    if (currentWeekData.planId) {
      const progress = await this.taskService.getPlanProgress(
        studentId,
        currentWeekData.planId,
      );
      weekSummary = {
        planId: currentWeekData.planId,
        weekNumber: currentWeekData.weekNumber,
        theme: currentWeekData.theme,
        totalTasks: currentWeekData.tasks?.length || 0,
        completedTasks: currentWeekData.tasks?.filter((t: any) => t.status === 'DONE').length || 0,
        progressRate: progress.progressRate,
      };
    }

    // 3. 추천 학교 (최신 3개)
    const recommendedSchools = await this.prisma.recommendedSchool.findMany({
      where: { studentId },
      orderBy: [{ diagnosedAt: 'desc' }, { rank: 'asc' }],
      take: 3,
      include: {
        school: { select: { id: true, name: true, type: true } },
      },
    });

    // 4. 다가오는 입시 일정 (7일 이내)
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);

    const targetSchoolIds = await this.prisma.targetSchool.findMany({
      where: { studentId },
      select: { schoolId: true },
    });

    const favoriteSchoolIds = await this.prisma.favoriteSchool.findMany({
      where: { studentId },
      select: { schoolId: true },
    });

    const schoolIds = [
      ...new Set([
        ...targetSchoolIds.map((t) => t.schoolId),
        ...favoriteSchoolIds.map((f) => f.schoolId),
      ]),
    ];

    const upcomingSchedules = await this.prisma.admissionSchedule.findMany({
      where: {
        schoolId: { in: schoolIds },
        publishStatus: 'PUBLISHED',
        startDate: { gte: now, lte: sevenDaysLater },
      },
      orderBy: { startDate: 'asc' },
      take: 5,
      include: {
        school: { select: { name: true } },
      },
    });

    // 5. 최근 이벤트 (3개)
    const recentEvents = await this.prisma.eventLog.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    return {
      todayTasks,
      weekSummary,
      recommendedSchools: recommendedSchools.map((r) => ({
        schoolId: r.schoolId,
        name: r.school.name,
        type: r.school.type,
        score: r.score,
        level: r.level,
        rank: r.rank,
      })),
      upcomingSchedules: upcomingSchedules.map((s) => ({
        id: s.id,
        schoolName: s.school.name,
        type: s.type,
        title: s.title,
        date: s.startDate,
        daysLeft: Math.ceil(
          (s.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
      })),
      recentEvents,
    };
  }

  // ========== WP7.2: 학부모 대시보드 ==========
  async getParentDashboard(parentId: string) {
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
      select: { familyId: true },
    });

    if (!parent?.familyId) {
      return {
        children: [],
        message: '자녀 계정을 먼저 연결해 주세요',
      };
    }

    const children = await this.prisma.user.findMany({
      where: {
        familyId: parent.familyId,
        role: 'STUDENT',
      },
      select: { id: true, name: true },
    });

    if (children.length === 0) {
      return {
        children: [],
        message: '자녀 계정을 먼저 연결해 주세요',
      };
    }

    const childrenSnapshots = await Promise.all(
      children.map(async (child) => {
        // 최신 진단 결과
        const latestDiagnosis = await this.prisma.diagnosisResult.findFirst({
          where: { studentId: child.id },
          orderBy: { createdAt: 'desc' },
          include: { school: { select: { name: true } } },
        });

        // 액션 플랜 진행도
        const activePlan = await this.prisma.actionPlan.findFirst({
          where: { studentId: child.id, status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
        });

        let planProgress: any = null;
        if (activePlan) {
          const tasks = await this.prisma.weeklyTask.findMany({
            where: { planId: activePlan.id },
          });
          const completed = tasks.filter((t: any) => t.status === 'DONE').length;
          const now = new Date();
          const planStart = new Date(activePlan.startDate);
          const diffDays = Math.floor(
            (now.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24),
          );
          const currentWeek = Math.max(1, Math.min(12, Math.floor(diffDays / 7) + 1));

          planProgress = {
            title: activePlan.title,
            progressRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
            currentWeek,
          };
        }

        // 다가오는 일정
        const now = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(now.getDate() + 7);

        const targetSchoolIds = await this.prisma.targetSchool.findMany({
          where: { studentId: child.id },
          select: { schoolId: true },
        });

        const upcomingSchedule = await this.prisma.admissionSchedule.findFirst({
          where: {
            schoolId: { in: targetSchoolIds.map((t) => t.schoolId) },
            publishStatus: 'PUBLISHED',
            startDate: { gte: now, lte: sevenDaysLater },
          },
          orderBy: { startDate: 'asc' },
          include: { school: { select: { name: true } } },
        });

        return {
          childId: child.id,
          name: child.name,
          snapshot: {
            diagnosis: latestDiagnosis
              ? {
                  lastRun: latestDiagnosis.createdAt,
                  topSchool: latestDiagnosis.school?.name || '전체 진단',
                  topScore: latestDiagnosis.score,
                  level: latestDiagnosis.level,
                }
              : null,
            plan: planProgress,
            upcomingSchedule: upcomingSchedule
              ? {
                  title: upcomingSchedule.title,
                  schoolName: upcomingSchedule.school.name,
                  date: upcomingSchedule.startDate,
                  daysLeft: Math.ceil(
                    (upcomingSchedule.startDate.getTime() - now.getTime()) /
                      (1000 * 60 * 60 * 24),
                  ),
                }
              : null,
          },
        };
      }),
    );

    return { children: childrenSnapshots };
  }

  async getChildDashboard(parentId: string, childId: string) {
    await this.validateFamilyRelation(parentId, childId);
    return this.getStudentDashboard(childId);
  }

  // ========== WP7.3: 캘린더 ==========
  async getAdmissionCalendar(studentId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // 목표 학교 + 관심 학교
    const targetSchoolIds = await this.prisma.targetSchool.findMany({
      where: { studentId },
      select: { schoolId: true },
    });

    const favoriteSchoolIds = await this.prisma.favoriteSchool.findMany({
      where: { studentId },
      select: { schoolId: true },
    });

    const schoolIds = [
      ...new Set([
        ...targetSchoolIds.map((t) => t.schoolId),
        ...favoriteSchoolIds.map((f) => f.schoolId),
      ]),
    ];

    if (schoolIds.length === 0) {
      return {
        year,
        month,
        schedules: [],
        message: '목표 학교를 먼저 설정하면 해당 학교의 일정을 확인할 수 있습니다',
      };
    }

    const schedules = await this.prisma.admissionSchedule.findMany({
      where: {
        schoolId: { in: schoolIds },
        publishStatus: 'PUBLISHED',
        OR: [
          { startDate: { gte: startDate, lte: endDate } },
          { endDate: { gte: startDate, lte: endDate } },
        ],
      },
      orderBy: { startDate: 'asc' },
      include: {
        school: { select: { id: true, name: true, type: true } },
      },
    });

    return {
      year,
      month,
      schedules: schedules.map((s) => ({
        id: s.id,
        schoolId: s.school.id,
        schoolName: s.school.name,
        schoolType: s.school.type,
        type: s.type,
        title: s.title,
        startDate: s.startDate,
        endDate: s.endDate,
        location: s.location,
        note: s.note,
      })),
    };
  }

  async getUpcomingSchedules(studentId: string, days = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);

    const targetSchoolIds = await this.prisma.targetSchool.findMany({
      where: { studentId },
      select: { schoolId: true },
    });

    const favoriteSchoolIds = await this.prisma.favoriteSchool.findMany({
      where: { studentId },
      select: { schoolId: true },
    });

    const schoolIds = [
      ...new Set([
        ...targetSchoolIds.map((t) => t.schoolId),
        ...favoriteSchoolIds.map((f) => f.schoolId),
      ]),
    ];

    const schedules = await this.prisma.admissionSchedule.findMany({
      where: {
        schoolId: { in: schoolIds },
        publishStatus: 'PUBLISHED',
        startDate: { gte: now, lte: future },
      },
      orderBy: { startDate: 'asc' },
      include: {
        school: { select: { name: true } },
      },
    });

    return {
      schedules: schedules.map((s) => ({
        id: s.id,
        schoolName: s.school.name,
        type: s.type,
        title: s.title,
        date: s.startDate,
        daysLeft: Math.ceil(
          (s.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
      })),
    };
  }

  // ========== WP7.4: 보고서 ==========
  async getDiagnosisReport(studentId: string) {
    const latestDiagnosis = await this.prisma.diagnosisResult.findFirst({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: { school: true },
    });

    if (!latestDiagnosis) {
      throw new BadRequestException('진단을 먼저 실행해 주세요');
    }

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { name: true, grade: true, schoolName: true },
    });

    const recommendations = await this.prisma.recommendedSchool.findMany({
      where: { studentId },
      orderBy: [{ diagnosedAt: 'desc' }, { rank: 'asc' }],
      take: 5,
      include: { school: true },
    });

    return {
      reportType: 'diagnosis',
      generatedAt: new Date(),
      student: {
        name: student?.name,
        grade: student?.grade,
        schoolName: student?.schoolName,
      },
      diagnosis: {
        date: latestDiagnosis.createdAt,
        school: latestDiagnosis.school?.name || '종합 진단',
        score: latestDiagnosis.score,
        level: latestDiagnosis.level,
        gradeScore: latestDiagnosis.gradeScore,
        activityScore: latestDiagnosis.activityScore,
        attendanceScore: latestDiagnosis.attendanceScore,
        volunteerScore: latestDiagnosis.volunteerScore,
        strengths: JSON.parse(latestDiagnosis.strengths || '[]'),
        weaknesses: JSON.parse(latestDiagnosis.weaknesses || '[]'),
        recommendations: JSON.parse(latestDiagnosis.recommendations || '[]'),
      },
      recommendedSchools: recommendations.map((r) => ({
        rank: r.rank,
        name: r.school.name,
        type: r.school.type,
        score: r.score,
        level: r.level,
        reason: r.reason,
      })),
    };
  }

  async getComprehensiveReport(studentId: string) {
    // 진단 보고서 기반
    const diagnosisReport = await this.getDiagnosisReport(studentId);

    // 액션 플랜
    const activePlan = await this.prisma.actionPlan.findFirst({
      where: { studentId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { tasks: true },
    });

    let planSummary: any = null;
    if (activePlan) {
      const completed = activePlan.tasks.filter((t: any) => t.status === 'DONE').length;
      planSummary = {
        title: activePlan.title,
        startDate: activePlan.startDate,
        endDate: activePlan.endDate,
        goals: JSON.parse(activePlan.goals || '[]'),
        totalTasks: activePlan.tasks.length,
        completedTasks: completed,
        progressRate: activePlan.tasks.length > 0
          ? Math.round((completed / activePlan.tasks.length) * 100)
          : 0,
      };
    }

    // AI 조언 요약 (최근 것들)
    const aiOutputs = await this.prisma.aIOutput.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { type: true, response: true, createdAt: true },
    });

    // 다가오는 일정
    const upcomingData = await this.getUpcomingSchedules(studentId, 30);

    return {
      ...diagnosisReport,
      reportType: 'comprehensive',
      generatedAt: new Date(),
      actionPlan: planSummary,
      aiAdviceSummary: aiOutputs.map((o: any) => ({
        type: o.type,
        summary: o.response.substring(0, 200) + '...',
        date: o.createdAt,
      })),
      upcomingSchedules: upcomingData.schedules,
    };
  }

  async getChildReport(parentId: string, childId: string, type: 'diagnosis' | 'comprehensive') {
    await this.validateFamilyRelation(parentId, childId);
    
    if (type === 'diagnosis') {
      return this.getDiagnosisReport(childId);
    }
    return this.getComprehensiveReport(childId);
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


