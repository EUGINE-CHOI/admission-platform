import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus } from '../../generated/prisma';

export interface GradeGoalInput {
  subject: string;
  targetRank: number;
  targetYear: number;
  targetSemester: number;
}

export interface GradeGoalWithProgress {
  id: string;
  subject: string;
  targetRank: number;
  targetYear: number;
  targetSemester: number;
  currentRank: number | null;
  gap: number | null;  // 목표 대비 차이 (양수: 목표 도달 못함, 음수: 목표 초과 달성)
  progress: number;    // 진행률 (0-100%)
  status: 'ACHIEVED' | 'ON_TRACK' | 'BEHIND' | 'NOT_STARTED';
  trend: 'UP' | 'DOWN' | 'FLAT' | 'N/A';
}

export interface GoalSummary {
  totalGoals: number;
  achievedGoals: number;
  onTrackGoals: number;
  behindGoals: number;
  overallProgress: number;
  subjectGoals: GradeGoalWithProgress[];
}

@Injectable()
export class GoalTrackerService {
  constructor(private prisma: PrismaService) {}

  // 목표 성적 설정
  async setGoal(studentId: string, input: GradeGoalInput): Promise<GradeGoalWithProgress> {
    if (input.targetRank < 1 || input.targetRank > 9) {
      throw new BadRequestException('목표 등급은 1~9 사이여야 합니다.');
    }

    const goal = await this.prisma.gradeGoal.upsert({
      where: {
        studentId_subject_targetYear_targetSemester: {
          studentId,
          subject: input.subject,
          targetYear: input.targetYear,
          targetSemester: input.targetSemester,
        },
      },
      update: { targetRank: input.targetRank },
      create: {
        studentId,
        ...input,
      },
    });

    return this.getGoalWithProgress(studentId, goal.id);
  }

  // 목표 삭제
  async deleteGoal(studentId: string, goalId: string): Promise<void> {
    const goal = await this.prisma.gradeGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.studentId !== studentId) {
      throw new NotFoundException('목표를 찾을 수 없습니다.');
    }

    await this.prisma.gradeGoal.delete({ where: { id: goalId } });
  }

  // 단일 목표 + 진행률 조회
  async getGoalWithProgress(studentId: string, goalId: string): Promise<GradeGoalWithProgress> {
    const goal = await this.prisma.gradeGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.studentId !== studentId) {
      throw new NotFoundException('목표를 찾을 수 없습니다.');
    }

    // 해당 과목의 현재 성적 조회
    const grades = await this.prisma.grade.findMany({
      where: {
        studentId,
        subject: goal.subject,
        status: ApprovalStatus.APPROVED,
      },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
    });

    const currentGrade = grades[0];
    const currentRank = currentGrade?.rank || null;

    // 성적 추이 계산
    let trend: 'UP' | 'DOWN' | 'FLAT' | 'N/A' = 'N/A';
    if (grades.length >= 2 && grades[0].rank !== null && grades[1].rank !== null) {
      const diff = grades[1].rank - grades[0].rank;
      if (diff > 0) trend = 'UP';
      else if (diff < 0) trend = 'DOWN';
      else trend = 'FLAT';
    }

    // 진행률 및 상태 계산
    let gap: number | null = null;
    let progress = 0;
    let status: 'ACHIEVED' | 'ON_TRACK' | 'BEHIND' | 'NOT_STARTED' = 'NOT_STARTED';

    if (currentRank !== null) {
      gap = currentRank - goal.targetRank;  // 양수면 목표 미달성

      // 진행률 계산 (9등급 → 목표 등급까지의 진행률)
      // 예: 현재 5등급, 목표 2등급 → (9-5)/(9-2) = 4/7 = 57%
      const maxRank = 9;
      if (goal.targetRank < maxRank) {
        progress = Math.min(100, Math.max(0, 
          ((maxRank - currentRank) / (maxRank - goal.targetRank)) * 100
        ));
      }

      if (currentRank <= goal.targetRank) {
        status = 'ACHIEVED';
        progress = 100;
      } else if (trend === 'UP') {
        status = 'ON_TRACK';
      } else {
        status = 'BEHIND';
      }
    }

    return {
      id: goal.id,
      subject: goal.subject,
      targetRank: goal.targetRank,
      targetYear: goal.targetYear,
      targetSemester: goal.targetSemester,
      currentRank,
      gap,
      progress: Math.round(progress),
      status,
      trend,
    };
  }

  // 전체 목표 요약 조회
  async getGoalSummary(studentId: string): Promise<GoalSummary> {
    const goals = await this.prisma.gradeGoal.findMany({
      where: { studentId },
      orderBy: [{ targetYear: 'desc' }, { targetSemester: 'desc' }, { subject: 'asc' }],
    });

    if (goals.length === 0) {
      return {
        totalGoals: 0,
        achievedGoals: 0,
        onTrackGoals: 0,
        behindGoals: 0,
        overallProgress: 0,
        subjectGoals: [],
      };
    }

    const subjectGoals: GradeGoalWithProgress[] = [];
    let achievedGoals = 0;
    let onTrackGoals = 0;
    let behindGoals = 0;
    let totalProgress = 0;

    for (const goal of goals) {
      const goalWithProgress = await this.getGoalWithProgress(studentId, goal.id);
      subjectGoals.push(goalWithProgress);
      totalProgress += goalWithProgress.progress;

      switch (goalWithProgress.status) {
        case 'ACHIEVED':
          achievedGoals++;
          break;
        case 'ON_TRACK':
          onTrackGoals++;
          break;
        case 'BEHIND':
          behindGoals++;
          break;
      }
    }

    return {
      totalGoals: goals.length,
      achievedGoals,
      onTrackGoals,
      behindGoals,
      overallProgress: Math.round(totalProgress / goals.length),
      subjectGoals,
    };
  }

  // 추천 목표 생성 (현재 성적 기반)
  async getRecommendedGoals(studentId: string): Promise<GradeGoalInput[]> {
    const grades = await this.prisma.grade.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
    });

    // 과목별 최신 성적 추출
    const latestGrades: Record<string, { rank: number; year: number; semester: number }> = {};
    for (const grade of grades) {
      if (!latestGrades[grade.subject] && grade.rank !== null) {
        latestGrades[grade.subject] = {
          rank: grade.rank,
          year: grade.year,
          semester: grade.semester,
        };
      }
    }

    // 추천 목표 생성 (현재 등급 - 1, 최소 1등급)
    const recommendations: GradeGoalInput[] = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const nextSemester = currentMonth < 8 ? 2 : 1;
    const nextYear = currentMonth < 8 ? currentYear : currentYear + 1;

    for (const [subject, data] of Object.entries(latestGrades)) {
      recommendations.push({
        subject,
        targetRank: Math.max(1, data.rank - 1),  // 1등급 상승 목표
        targetYear: nextYear,
        targetSemester: nextSemester,
      });
    }

    return recommendations;
  }

  // 과목별 목표 달성 예측
  async predictGoalAchievement(studentId: string, subject: string): Promise<{
    currentRank: number | null;
    predictedRank: number | null;
    confidence: number;
    factors: string[];
  }> {
    const grades = await this.prisma.grade.findMany({
      where: { studentId, subject, status: ApprovalStatus.APPROVED },
      orderBy: [{ year: 'asc' }, { semester: 'asc' }],
    });

    if (grades.length < 2) {
      return {
        currentRank: grades[0]?.rank || null,
        predictedRank: null,
        confidence: 0,
        factors: ['성적 데이터가 부족하여 예측이 불가능합니다.'],
      };
    }

    const validGrades = grades.filter(g => g.rank !== null);
    if (validGrades.length < 2) {
      return {
        currentRank: validGrades[0]?.rank || null,
        predictedRank: null,
        confidence: 0,
        factors: ['유효한 등급 데이터가 부족합니다.'],
      };
    }

    // 간단한 선형 추세 계산
    const ranks = validGrades.map(g => g.rank as number);
    const currentRank = ranks[ranks.length - 1];

    // 최근 3개 학기 평균 변화율 계산
    const recentChanges: number[] = [];
    for (let i = Math.max(0, ranks.length - 3); i < ranks.length - 1; i++) {
      recentChanges.push(ranks[i] - ranks[i + 1]);  // 양수: 상승, 음수: 하락
    }

    const avgChange = recentChanges.length > 0
      ? recentChanges.reduce((a, b) => a + b, 0) / recentChanges.length
      : 0;

    const predictedRank = Math.max(1, Math.min(9, Math.round(currentRank - avgChange)));

    // 신뢰도 계산 (데이터 수 기반)
    const confidence = Math.min(90, validGrades.length * 15);

    const factors: string[] = [];
    if (avgChange > 0.5) {
      factors.push('최근 성적이 상승 추세입니다.');
    } else if (avgChange < -0.5) {
      factors.push('최근 성적이 하락 추세입니다.');
    } else {
      factors.push('성적이 안정적으로 유지되고 있습니다.');
    }

    if (validGrades.length >= 4) {
      factors.push('충분한 데이터로 신뢰도가 높습니다.');
    } else {
      factors.push('더 많은 성적 데이터가 있으면 예측 정확도가 향상됩니다.');
    }

    return {
      currentRank,
      predictedRank,
      confidence,
      factors,
    };
  }
}

