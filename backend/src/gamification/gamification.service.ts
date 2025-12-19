import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeCategory } from '../../generated/prisma';

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  iconUrl: string | null;
  points: number;
  earnedAt?: Date;
  isEarned: boolean;
}

export interface UserBadgeSummary {
  totalBadges: number;
  earnedBadges: number;
  totalPoints: number;
  recentBadges: BadgeInfo[];
  badgesByCategory: Record<string, { earned: number; total: number }>;
}

export interface BadgeCondition {
  type: 'COUNT' | 'STREAK' | 'MILESTONE';
  target: string;
  threshold: number;
}

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  // 뱃지 시드 데이터 생성
  async seedBadges(): Promise<{ created: number }> {
    const badges = [
      // 출석 관련
      {
        name: '첫 발걸음',
        description: '처음으로 로그인했습니다',
        category: BadgeCategory.ATTENDANCE,
        condition: JSON.stringify({ type: 'MILESTONE', target: 'login', threshold: 1 }),
        points: 10,
      },
      {
        name: '꾸준한 학생',
        description: '7일 연속 로그인',
        category: BadgeCategory.ATTENDANCE,
        condition: JSON.stringify({ type: 'STREAK', target: 'login', threshold: 7 }),
        points: 50,
      },
      {
        name: '열정 가득',
        description: '30일 연속 로그인',
        category: BadgeCategory.ATTENDANCE,
        condition: JSON.stringify({ type: 'STREAK', target: 'login', threshold: 30 }),
        points: 200,
      },
      // Task 완료 관련
      {
        name: '시작이 반',
        description: '첫 번째 Task 완료',
        category: BadgeCategory.TASK,
        condition: JSON.stringify({ type: 'COUNT', target: 'task_complete', threshold: 1 }),
        points: 10,
      },
      {
        name: '실행력 있는',
        description: 'Task 10개 완료',
        category: BadgeCategory.TASK,
        condition: JSON.stringify({ type: 'COUNT', target: 'task_complete', threshold: 10 }),
        points: 50,
      },
      {
        name: '목표 달성왕',
        description: 'Task 50개 완료',
        category: BadgeCategory.TASK,
        condition: JSON.stringify({ type: 'COUNT', target: 'task_complete', threshold: 50 }),
        points: 200,
      },
      {
        name: '완벽한 한 주',
        description: '주간 Task 100% 완료',
        category: BadgeCategory.TASK,
        condition: JSON.stringify({ type: 'MILESTONE', target: 'week_complete', threshold: 1 }),
        points: 100,
      },
      // 데이터 입력 관련
      {
        name: '성적 관리자',
        description: '첫 성적 입력',
        category: BadgeCategory.DATA_INPUT,
        condition: JSON.stringify({ type: 'COUNT', target: 'grade_input', threshold: 1 }),
        points: 10,
      },
      {
        name: '활동 기록가',
        description: '활동 5개 이상 입력',
        category: BadgeCategory.DATA_INPUT,
        condition: JSON.stringify({ type: 'COUNT', target: 'activity_input', threshold: 5 }),
        points: 30,
      },
      {
        name: '독서왕',
        description: '독서 기록 10권 달성',
        category: BadgeCategory.DATA_INPUT,
        condition: JSON.stringify({ type: 'COUNT', target: 'reading_input', threshold: 10 }),
        points: 50,
      },
      {
        name: '데이터 마스터',
        description: '모든 데이터 영역 입력 완료',
        category: BadgeCategory.DATA_INPUT,
        condition: JSON.stringify({ type: 'MILESTONE', target: 'all_data', threshold: 1 }),
        points: 100,
      },
      // 진단 관련
      {
        name: '첫 진단',
        description: '첫 번째 입시 진단 실행',
        category: BadgeCategory.DIAGNOSIS,
        condition: JSON.stringify({ type: 'COUNT', target: 'diagnosis_run', threshold: 1 }),
        points: 20,
      },
      {
        name: '분석가',
        description: '진단 5회 이상 실행',
        category: BadgeCategory.DIAGNOSIS,
        condition: JSON.stringify({ type: 'COUNT', target: 'diagnosis_run', threshold: 5 }),
        points: 50,
      },
      {
        name: '목표 학교 설정',
        description: '목표 학교 3개 이상 설정',
        category: BadgeCategory.DIAGNOSIS,
        condition: JSON.stringify({ type: 'COUNT', target: 'target_school', threshold: 3 }),
        points: 30,
      },
      // AI 사용 관련
      {
        name: 'AI 친구',
        description: 'AI 멘토 첫 사용',
        category: BadgeCategory.AI_USAGE,
        condition: JSON.stringify({ type: 'COUNT', target: 'ai_usage', threshold: 1 }),
        points: 10,
      },
      {
        name: 'AI 마스터',
        description: 'AI 기능 10회 이상 사용',
        category: BadgeCategory.AI_USAGE,
        condition: JSON.stringify({ type: 'COUNT', target: 'ai_usage', threshold: 10 }),
        points: 50,
      },
      {
        name: '액션 플래너',
        description: 'AI 액션 플랜 생성',
        category: BadgeCategory.AI_USAGE,
        condition: JSON.stringify({ type: 'COUNT', target: 'action_plan', threshold: 1 }),
        points: 30,
      },
      // 마일스톤 관련
      {
        name: '입시 준비생',
        description: '프로필 설정 완료',
        category: BadgeCategory.MILESTONE,
        condition: JSON.stringify({ type: 'MILESTONE', target: 'profile_complete', threshold: 1 }),
        points: 20,
      },
      {
        name: '성적 상승',
        description: '성적이 전 학기 대비 상승',
        category: BadgeCategory.MILESTONE,
        condition: JSON.stringify({ type: 'MILESTONE', target: 'grade_up', threshold: 1 }),
        points: 100,
      },
      {
        name: 'FIT 달성',
        description: '목표 학교에서 FIT 진단 결과 획득',
        category: BadgeCategory.MILESTONE,
        condition: JSON.stringify({ type: 'MILESTONE', target: 'fit_achieved', threshold: 1 }),
        points: 200,
      },
    ];

    let created = 0;
    for (const badge of badges) {
      await this.prisma.badge.upsert({
        where: { name: badge.name },
        update: badge,
        create: badge,
      });
      created++;
    }

    return { created };
  }

  // 사용자 뱃지 요약 조회
  async getUserBadgeSummary(userId: string): Promise<UserBadgeSummary> {
    const [allBadges, userBadges] = await Promise.all([
      this.prisma.badge.findMany({ where: { isActive: true } }),
      this.prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
      }),
    ]);

    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));
    const totalPoints = userBadges.reduce((sum, ub) => sum + ub.badge.points, 0);

    const recentBadges: BadgeInfo[] = userBadges.slice(0, 5).map(ub => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      category: ub.badge.category,
      iconUrl: ub.badge.iconUrl,
      points: ub.badge.points,
      earnedAt: ub.earnedAt,
      isEarned: true,
    }));

    // 카테고리별 집계
    const badgesByCategory: Record<string, { earned: number; total: number }> = {};
    for (const badge of allBadges) {
      const cat = badge.category;
      if (!badgesByCategory[cat]) {
        badgesByCategory[cat] = { earned: 0, total: 0 };
      }
      badgesByCategory[cat].total++;
      if (earnedBadgeIds.has(badge.id)) {
        badgesByCategory[cat].earned++;
      }
    }

    return {
      totalBadges: allBadges.length,
      earnedBadges: userBadges.length,
      totalPoints,
      recentBadges,
      badgesByCategory,
    };
  }

  // 모든 뱃지 조회 (획득 여부 포함)
  async getAllBadges(userId: string): Promise<BadgeInfo[]> {
    const [allBadges, userBadges] = await Promise.all([
      this.prisma.badge.findMany({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { points: 'asc' }],
      }),
      this.prisma.userBadge.findMany({
        where: { userId },
      }),
    ]);

    const earnedMap = new Map(userBadges.map(ub => [ub.badgeId, ub.earnedAt]));

    return allBadges.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      category: badge.category,
      iconUrl: badge.iconUrl,
      points: badge.points,
      earnedAt: earnedMap.get(badge.id),
      isEarned: earnedMap.has(badge.id),
    }));
  }

  // 뱃지 부여
  async awardBadge(userId: string, badgeName: string): Promise<BadgeInfo | null> {
    const badge = await this.prisma.badge.findUnique({
      where: { name: badgeName },
    });

    if (!badge || !badge.isActive) return null;

    // 이미 획득했는지 확인
    const existing = await this.prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });

    if (existing) return null;

    const userBadge = await this.prisma.userBadge.create({
      data: { userId, badgeId: badge.id },
      include: { badge: true },
    });

    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      category: badge.category,
      iconUrl: badge.iconUrl,
      points: badge.points,
      earnedAt: userBadge.earnedAt,
      isEarned: true,
    };
  }

  // 조건 기반 자동 뱃지 체크
  async checkAndAwardBadges(userId: string, eventType: string): Promise<BadgeInfo[]> {
    const awardedBadges: BadgeInfo[] = [];

    // 이벤트 타입에 따른 통계 조회 및 뱃지 부여
    switch (eventType) {
      case 'task_complete': {
        const count = await this.prisma.weeklyTask.count({
          where: {
            plan: { studentId: userId },
            status: 'DONE',
          },
        });
        
        if (count >= 1) {
          const badge = await this.awardBadge(userId, '시작이 반');
          if (badge) awardedBadges.push(badge);
        }
        if (count >= 10) {
          const badge = await this.awardBadge(userId, '실행력 있는');
          if (badge) awardedBadges.push(badge);
        }
        if (count >= 50) {
          const badge = await this.awardBadge(userId, '목표 달성왕');
          if (badge) awardedBadges.push(badge);
        }
        break;
      }

      case 'grade_input': {
        const count = await this.prisma.grade.count({ where: { studentId: userId } });
        if (count >= 1) {
          const badge = await this.awardBadge(userId, '성적 관리자');
          if (badge) awardedBadges.push(badge);
        }
        break;
      }

      case 'activity_input': {
        const count = await this.prisma.activity.count({ where: { studentId: userId } });
        if (count >= 5) {
          const badge = await this.awardBadge(userId, '활동 기록가');
          if (badge) awardedBadges.push(badge);
        }
        break;
      }

      case 'reading_input': {
        const count = await this.prisma.readingLog.count({ where: { studentId: userId } });
        if (count >= 10) {
          const badge = await this.awardBadge(userId, '독서왕');
          if (badge) awardedBadges.push(badge);
        }
        break;
      }

      case 'diagnosis_run': {
        const count = await this.prisma.diagnosisResult.count({ where: { studentId: userId } });
        if (count >= 1) {
          const badge = await this.awardBadge(userId, '첫 진단');
          if (badge) awardedBadges.push(badge);
        }
        if (count >= 5) {
          const badge = await this.awardBadge(userId, '분석가');
          if (badge) awardedBadges.push(badge);
        }
        break;
      }

      case 'target_school': {
        const count = await this.prisma.targetSchool.count({ where: { studentId: userId } });
        if (count >= 3) {
          const badge = await this.awardBadge(userId, '목표 학교 설정');
          if (badge) awardedBadges.push(badge);
        }
        break;
      }

      case 'ai_usage': {
        const count = await this.prisma.aIOutput.count({ where: { studentId: userId } });
        if (count >= 1) {
          const badge = await this.awardBadge(userId, 'AI 친구');
          if (badge) awardedBadges.push(badge);
        }
        if (count >= 10) {
          const badge = await this.awardBadge(userId, 'AI 마스터');
          if (badge) awardedBadges.push(badge);
        }
        break;
      }

      case 'action_plan': {
        const count = await this.prisma.actionPlan.count({ where: { studentId: userId } });
        if (count >= 1) {
          const badge = await this.awardBadge(userId, '액션 플래너');
          if (badge) awardedBadges.push(badge);
        }
        break;
      }

      case 'fit_achieved': {
        const badge = await this.awardBadge(userId, 'FIT 달성');
        if (badge) awardedBadges.push(badge);
        break;
      }

      case 'login': {
        const badge = await this.awardBadge(userId, '첫 발걸음');
        if (badge) awardedBadges.push(badge);
        break;
      }
    }

    return awardedBadges;
  }
}

