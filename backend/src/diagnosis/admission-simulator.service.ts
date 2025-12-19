import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiagnosisLevel, ApprovalStatus } from '../../generated/prisma';

export interface SimulationInput {
  schoolId: string;
  hypotheticalGrades?: { subject: string; rank: number }[];
  hypotheticalActivities?: number;  // 활동 개수
  hypotheticalVolunteerHours?: number;
}

export interface SimulationResult {
  schoolName: string;
  schoolType: string;
  currentLevel: DiagnosisLevel;
  currentScore: number;
  simulatedLevel: DiagnosisLevel;
  simulatedScore: number;
  scoreDifference: number;
  levelChanged: boolean;
  changeFactors: {
    factor: string;
    impact: number;  // 양수: 점수 상승, 음수: 점수 하락
    description: string;
  }[];
  recommendations: string[];
  probabilityEstimate: number;  // 합격 예상 확률 (0-100%)
}

export interface ScenarioComparison {
  baseCase: SimulationResult;
  scenarios: {
    name: string;
    result: SimulationResult;
    improvement: number;
  }[];
}

@Injectable()
export class AdmissionSimulatorService {
  constructor(private prisma: PrismaService) {}

  // 현재 점수 계산
  private async calculateCurrentScore(studentId: string): Promise<{
    gradeScore: number;
    activityScore: number;
    volunteerScore: number;
    attendanceScore: number;
    totalScore: number;
    avgRank: number | null;
    activityCount: number;
    volunteerHours: number;
  }> {
    const [grades, activities, volunteers, attendances] = await Promise.all([
      this.prisma.grade.findMany({
        where: { studentId, status: ApprovalStatus.APPROVED },
      }),
      this.prisma.activity.findMany({
        where: { studentId, status: ApprovalStatus.APPROVED },
      }),
      this.prisma.volunteer.findMany({
        where: { studentId, status: ApprovalStatus.APPROVED },
      }),
      this.prisma.attendance.findMany({
        where: { studentId, status: ApprovalStatus.APPROVED },
      }),
    ]);

    // 평균 등급 계산
    const validGrades = grades.filter(g => g.rank !== null);
    const avgRank = validGrades.length > 0
      ? validGrades.reduce((sum, g) => sum + (g.rank as number), 0) / validGrades.length
      : null;

    // 점수 계산 (등급 기반)
    let gradeScore = 0;
    if (avgRank !== null) {
      gradeScore = Math.max(0, (9 - avgRank) / 8 * 50);  // 최대 50점
    }

    // 활동 점수 (최대 25점)
    const activityCount = activities.length;
    const activityScore = Math.min(25, activityCount * 5);

    // 봉사 점수 (최대 15점)
    const volunteerHours = volunteers.reduce((sum, v) => sum + v.hours, 0);
    const volunteerScore = Math.min(15, volunteerHours / 4);

    // 출결 점수 (최대 10점)
    const totalAbsences = attendances.reduce(
      (sum, a) => sum + a.absenceUnexcused + a.latenessCount,
      0
    );
    const attendanceScore = Math.max(0, 10 - totalAbsences * 2);

    const totalScore = gradeScore + activityScore + volunteerScore + attendanceScore;

    return {
      gradeScore,
      activityScore,
      volunteerScore,
      attendanceScore,
      totalScore,
      avgRank,
      activityCount,
      volunteerHours,
    };
  }

  // 점수 → 진단 레벨 변환
  private scoreToLevel(score: number, cutoffGrade?: number | null): DiagnosisLevel {
    // cutoffGrade가 있으면 그에 맞게 조정
    const threshold = cutoffGrade ? (9 - cutoffGrade) / 8 * 50 + 25 : 60;
    
    if (score >= threshold) return DiagnosisLevel.FIT;
    if (score >= threshold - 15) return DiagnosisLevel.CHALLENGE;
    return DiagnosisLevel.UNLIKELY;
  }

  // 점수 → 합격 확률 추정
  private estimateProbability(score: number, cutoffGrade?: number | null): number {
    const threshold = cutoffGrade ? (9 - cutoffGrade) / 8 * 50 + 25 : 60;
    
    if (score >= threshold + 10) return Math.min(95, 70 + (score - threshold - 10) * 1.5);
    if (score >= threshold) return 50 + (score - threshold) * 2;
    if (score >= threshold - 10) return 30 + (score - threshold + 10) * 2;
    return Math.max(5, 30 + (score - threshold + 10) * 2);
  }

  // 시뮬레이션 실행
  async runSimulation(studentId: string, input: SimulationInput): Promise<SimulationResult> {
    const school = await this.prisma.school.findUnique({
      where: { id: input.schoolId },
      include: {
        admissions: {
          where: { publishStatus: 'PUBLISHED' },
          orderBy: { year: 'desc' },
          take: 1,
        },
      },
    });

    if (!school) {
      throw new NotFoundException('학교를 찾을 수 없습니다.');
    }

    const currentData = await this.calculateCurrentScore(studentId);
    const cutoffGrade = school.admissions[0]?.cutoffGrade;

    // 현재 레벨 계산
    const currentLevel = this.scoreToLevel(currentData.totalScore, cutoffGrade);

    // 시뮬레이션 점수 계산
    let simulatedGradeScore = currentData.gradeScore;
    let simulatedActivityScore = currentData.activityScore;
    let simulatedVolunteerScore = currentData.volunteerScore;

    const changeFactors: SimulationResult['changeFactors'] = [];

    // 가상 성적 반영
    if (input.hypotheticalGrades && input.hypotheticalGrades.length > 0) {
      const hypotheticalAvgRank = 
        input.hypotheticalGrades.reduce((sum, g) => sum + g.rank, 0) / input.hypotheticalGrades.length;
      simulatedGradeScore = Math.max(0, (9 - hypotheticalAvgRank) / 8 * 50);
      
      const gradeImpact = simulatedGradeScore - currentData.gradeScore;
      if (gradeImpact !== 0) {
        changeFactors.push({
          factor: '성적 변화',
          impact: gradeImpact,
          description: currentData.avgRank !== null
            ? `평균 등급 ${currentData.avgRank.toFixed(1)} → ${hypotheticalAvgRank.toFixed(1)}`
            : `평균 등급 ${hypotheticalAvgRank.toFixed(1)}으로 설정`,
        });
      }
    }

    // 가상 활동 수 반영
    if (input.hypotheticalActivities !== undefined) {
      const newActivityScore = Math.min(25, input.hypotheticalActivities * 5);
      const activityImpact = newActivityScore - simulatedActivityScore;
      if (activityImpact !== 0) {
        simulatedActivityScore = newActivityScore;
        changeFactors.push({
          factor: '활동 변화',
          impact: activityImpact,
          description: `활동 ${currentData.activityCount}개 → ${input.hypotheticalActivities}개`,
        });
      }
    }

    // 가상 봉사 시간 반영
    if (input.hypotheticalVolunteerHours !== undefined) {
      const newVolunteerScore = Math.min(15, input.hypotheticalVolunteerHours / 4);
      const volunteerImpact = newVolunteerScore - simulatedVolunteerScore;
      if (volunteerImpact !== 0) {
        simulatedVolunteerScore = newVolunteerScore;
        changeFactors.push({
          factor: '봉사활동 변화',
          impact: volunteerImpact,
          description: `봉사 ${currentData.volunteerHours}시간 → ${input.hypotheticalVolunteerHours}시간`,
        });
      }
    }

    const simulatedScore = 
      simulatedGradeScore + 
      simulatedActivityScore + 
      simulatedVolunteerScore + 
      currentData.attendanceScore;

    const simulatedLevel = this.scoreToLevel(simulatedScore, cutoffGrade);
    const levelChanged = currentLevel !== simulatedLevel;

    // 추천 사항 생성
    const recommendations: string[] = [];
    
    if (simulatedGradeScore < 40) {
      recommendations.push('성적 향상이 가장 큰 영향을 줍니다. 주요 과목 집중 학습을 권장합니다.');
    }
    if (simulatedActivityScore < 20) {
      const neededActivities = Math.ceil((20 - simulatedActivityScore) / 5);
      recommendations.push(`비교과 활동 ${neededActivities}개 이상 추가를 권장합니다.`);
    }
    if (simulatedVolunteerScore < 10) {
      const neededHours = Math.ceil((10 - simulatedVolunteerScore) * 4);
      recommendations.push(`봉사활동 ${neededHours}시간 이상 추가를 권장합니다.`);
    }

    if (levelChanged) {
      if (simulatedLevel === DiagnosisLevel.FIT) {
        recommendations.push('🎉 시뮬레이션 결과 적합 수준에 도달합니다!');
      } else if (simulatedLevel === DiagnosisLevel.UNLIKELY && currentLevel !== DiagnosisLevel.UNLIKELY) {
        recommendations.push('⚠️ 현재 계획대로라면 합격이 어려울 수 있습니다.');
      }
    }

    return {
      schoolName: school.name,
      schoolType: school.type,
      currentLevel,
      currentScore: Math.round(currentData.totalScore * 10) / 10,
      simulatedLevel,
      simulatedScore: Math.round(simulatedScore * 10) / 10,
      scoreDifference: Math.round((simulatedScore - currentData.totalScore) * 10) / 10,
      levelChanged,
      changeFactors,
      recommendations,
      probabilityEstimate: Math.round(this.estimateProbability(simulatedScore, cutoffGrade)),
    };
  }

  // 시나리오 비교
  async compareScenarios(studentId: string, schoolId: string): Promise<ScenarioComparison> {
    // 기본 케이스 (현재 상태)
    const baseCase = await this.runSimulation(studentId, { schoolId });

    // 시나리오 1: 성적 1등급 상승
    const scenario1 = await this.runSimulation(studentId, {
      schoolId,
      hypotheticalGrades: await this.getHypotheticalGrades(studentId, -1),
    });

    // 시나리오 2: 활동 3개 추가
    const currentActivities = await this.prisma.activity.count({
      where: { studentId, status: ApprovalStatus.APPROVED },
    });
    const scenario2 = await this.runSimulation(studentId, {
      schoolId,
      hypotheticalActivities: currentActivities + 3,
    });

    // 시나리오 3: 봉사 20시간 추가
    const currentVolunteers = await this.prisma.volunteer.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
    });
    const currentHours = currentVolunteers.reduce((sum, v) => sum + v.hours, 0);
    const scenario3 = await this.runSimulation(studentId, {
      schoolId,
      hypotheticalVolunteerHours: currentHours + 20,
    });

    // 시나리오 4: 종합 개선 (모두 적용)
    const scenario4 = await this.runSimulation(studentId, {
      schoolId,
      hypotheticalGrades: await this.getHypotheticalGrades(studentId, -1),
      hypotheticalActivities: currentActivities + 3,
      hypotheticalVolunteerHours: currentHours + 20,
    });

    return {
      baseCase,
      scenarios: [
        {
          name: '성적 1등급 상승',
          result: scenario1,
          improvement: scenario1.simulatedScore - baseCase.currentScore,
        },
        {
          name: '활동 3개 추가',
          result: scenario2,
          improvement: scenario2.simulatedScore - baseCase.currentScore,
        },
        {
          name: '봉사 20시간 추가',
          result: scenario3,
          improvement: scenario3.simulatedScore - baseCase.currentScore,
        },
        {
          name: '종합 개선 (모두 적용)',
          result: scenario4,
          improvement: scenario4.simulatedScore - baseCase.currentScore,
        },
      ],
    };
  }

  // 가상 성적 생성 (등급 조정)
  private async getHypotheticalGrades(
    studentId: string,
    adjustment: number  // 양수: 등급 하락, 음수: 등급 상승
  ): Promise<{ subject: string; rank: number }[]> {
    const grades = await this.prisma.grade.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
    });

    // 과목별 최신 성적만 추출
    const latestBySubject: Map<string, number> = new Map();
    for (const grade of grades) {
      if (grade.rank !== null && !latestBySubject.has(grade.subject)) {
        latestBySubject.set(grade.subject, grade.rank);
      }
    }

    return Array.from(latestBySubject.entries()).map(([subject, rank]) => ({
      subject,
      rank: Math.max(1, Math.min(9, rank + adjustment)),
    }));
  }

  // 목표 점수까지 필요한 개선 사항 분석
  async getImprovementPlan(
    studentId: string,
    schoolId: string,
    targetLevel: DiagnosisLevel = DiagnosisLevel.FIT
  ): Promise<{
    currentScore: number;
    targetScore: number;
    gap: number;
    improvements: {
      area: string;
      currentValue: number | string;
      targetValue: number | string;
      potentialGain: number;
      difficulty: 'EASY' | 'MEDIUM' | 'HARD';
      timeEstimate: string;
    }[];
    estimatedWeeks: number;
  }> {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        admissions: {
          where: { publishStatus: 'PUBLISHED' },
          orderBy: { year: 'desc' },
          take: 1,
        },
      },
    });

    if (!school) {
      throw new NotFoundException('학교를 찾을 수 없습니다.');
    }

    const currentData = await this.calculateCurrentScore(studentId);
    const cutoffGrade = school.admissions[0]?.cutoffGrade;

    // 목표 점수 계산
    let targetScore: number;
    switch (targetLevel) {
      case DiagnosisLevel.FIT:
        targetScore = cutoffGrade ? (9 - cutoffGrade) / 8 * 50 + 35 : 70;
        break;
      case DiagnosisLevel.CHALLENGE:
        targetScore = cutoffGrade ? (9 - cutoffGrade) / 8 * 50 + 20 : 55;
        break;
      default:
        targetScore = 40;
    }

    const gap = targetScore - currentData.totalScore;
    const improvements: typeof arguments[0] extends never ? never : any[] = [];

    // 성적 개선 분석
    if (currentData.gradeScore < 45) {
      const neededImprovement = Math.min(15, gap * 0.5);
      const currentAvg = currentData.avgRank || 5;
      const targetAvg = Math.max(1, currentAvg - (neededImprovement / 50 * 8));
      
      improvements.push({
        area: '성적',
        currentValue: `평균 ${currentAvg.toFixed(1)}등급`,
        targetValue: `평균 ${targetAvg.toFixed(1)}등급`,
        potentialGain: neededImprovement,
        difficulty: neededImprovement > 10 ? 'HARD' : neededImprovement > 5 ? 'MEDIUM' : 'EASY',
        timeEstimate: '3-6개월',
      });
    }

    // 활동 개선 분석
    if (currentData.activityScore < 25) {
      const maxGain = 25 - currentData.activityScore;
      const neededActivities = Math.ceil(maxGain / 5);
      
      improvements.push({
        area: '비교과 활동',
        currentValue: `${currentData.activityCount}개`,
        targetValue: `${currentData.activityCount + neededActivities}개`,
        potentialGain: maxGain,
        difficulty: neededActivities > 3 ? 'MEDIUM' : 'EASY',
        timeEstimate: `${neededActivities * 2}-${neededActivities * 4}주`,
      });
    }

    // 봉사 개선 분석
    if (currentData.volunteerScore < 15) {
      const maxGain = 15 - currentData.volunteerScore;
      const neededHours = Math.ceil(maxGain * 4);
      
      improvements.push({
        area: '봉사활동',
        currentValue: `${currentData.volunteerHours}시간`,
        targetValue: `${currentData.volunteerHours + neededHours}시간`,
        potentialGain: maxGain,
        difficulty: neededHours > 30 ? 'MEDIUM' : 'EASY',
        timeEstimate: `${Math.ceil(neededHours / 4)}-${Math.ceil(neededHours / 2)}주`,
      });
    }

    // 예상 소요 기간 계산
    const estimatedWeeks = gap > 20 ? 24 : gap > 10 ? 12 : 6;

    return {
      currentScore: Math.round(currentData.totalScore * 10) / 10,
      targetScore: Math.round(targetScore * 10) / 10,
      gap: Math.round(gap * 10) / 10,
      improvements,
      estimatedWeeks,
    };
  }
}

