import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddTargetSchoolDto, UpdatePriorityDto } from './dto';
import {
  PublishStatus,
  ApprovalStatus,
  DiagnosisLevel,
  School,
} from '../../generated/prisma';

interface StudentDataSummary {
  approvedGradesCount: number;
  averageRank: number | null;
  totalActivities: number;
  activityCounts: Record<string, number>;
  attendanceSummary: {
    absenceUnexcused: number;
    absenceOther: number;
    lateness: number;
  };
  totalVolunteerHours: number;
}

@Injectable()
export class DiagnosisService {
  private readonly GRADE_WEIGHT = 0.6;
  private readonly ACTIVITY_WEIGHT = 0.2;
  private readonly ATTENDANCE_WEIGHT = 0.1;
  private readonly VOLUNTEER_WEIGHT = 0.1;
  private readonly MIN_APPROVED_GRADES = 3;

  constructor(private prisma: PrismaService) {}

  // ========== 목표 학교 관리 (WP4.0) ==========
  async addTargetSchool(studentId: string, dto: AddTargetSchoolDto) {
    const school = await this.prisma.school.findUnique({
      where: { id: dto.schoolId },
    });

    if (!school) {
      throw new NotFoundException('학교를 찾을 수 없습니다');
    }

    if (school.publishStatus !== PublishStatus.PUBLISHED) {
      throw new BadRequestException('게시되지 않은 학교입니다');
    }

    const existing = await this.prisma.targetSchool.findUnique({
      where: {
        studentId_schoolId: { studentId, schoolId: dto.schoolId },
      },
    });

    if (existing) {
      throw new ConflictException('이미 목표 학교로 등록되어 있습니다');
    }

    const count = await this.prisma.targetSchool.count({
      where: { studentId },
    });

    if (count >= 5) {
      throw new BadRequestException('목표 학교는 최대 5개까지 등록할 수 있습니다');
    }

    const targetSchool = await this.prisma.targetSchool.create({
      data: {
        studentId,
        schoolId: dto.schoolId,
        priority: dto.priority || count + 1,
      },
      include: {
        school: {
          select: { id: true, name: true, type: true, region: true },
        },
      },
    });

    return {
      message: '목표 학교로 등록되었습니다',
      targetSchool,
    };
  }

  async removeTargetSchool(studentId: string, schoolId: string) {
    const targetSchool = await this.prisma.targetSchool.findUnique({
      where: {
        studentId_schoolId: { studentId, schoolId },
      },
    });

    if (!targetSchool) {
      throw new NotFoundException('목표 학교가 아닙니다');
    }

    await this.prisma.targetSchool.delete({
      where: { id: targetSchool.id },
    });

    return { message: '목표 학교에서 삭제되었습니다' };
  }

  async getTargetSchools(studentId: string) {
    const targetSchools = await this.prisma.targetSchool.findMany({
      where: { studentId },
      orderBy: { priority: 'asc' },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            type: true,
            region: true,
            website: true,
            admissions: {
              where: { publishStatus: PublishStatus.PUBLISHED },
              select: { cutoffGrade: true, competitionRate: true },
              take: 1,
            },
          },
        },
      },
    });

    if (targetSchools.length === 0) {
      return {
        targetSchools: [],
        message: '목표 학교를 설정해주세요',
      };
    }

    return { targetSchools };
  }

  async updatePriority(
    studentId: string,
    schoolId: string,
    dto: UpdatePriorityDto,
  ) {
    const targetSchool = await this.prisma.targetSchool.findUnique({
      where: {
        studentId_schoolId: { studentId, schoolId },
      },
    });

    if (!targetSchool) {
      throw new NotFoundException('목표 학교가 아닙니다');
    }

    const updated = await this.prisma.targetSchool.update({
      where: { id: targetSchool.id },
      data: { priority: dto.priority },
    });

    return {
      message: '우선순위가 변경되었습니다',
      targetSchool: updated,
    };
  }

  // ========== 진단 실행 (WP4.1, WP4.2) ==========
  async runDiagnosis(studentId: string) {
    const summary = await this.getStudentDataSummary(studentId);

    if (summary.approvedGradesCount < this.MIN_APPROVED_GRADES) {
      throw new BadRequestException(
        `진단을 위해 최소 ${this.MIN_APPROVED_GRADES}과목 이상의 승인된 성적이 필요합니다`,
      );
    }

    const targetSchools = await this.prisma.targetSchool.findMany({
      where: { studentId },
      include: {
        school: {
          include: {
            admissions: {
              where: { publishStatus: PublishStatus.PUBLISHED },
              take: 1,
            },
          },
        },
      },
    });

    if (targetSchools.length === 0) {
      throw new BadRequestException('먼저 목표 학교를 설정해주세요');
    }

    const results: any[] = [];
    for (const target of targetSchools) {
      const result = await this.diagnoseSchool(
        studentId,
        target.school as any,
        summary,
      );
      results.push(result);
    }

    return {
      message: '진단이 완료되었습니다',
      summary: {
        averageRank: summary.averageRank,
        totalActivities: summary.totalActivities,
        totalVolunteerHours: summary.totalVolunteerHours,
      },
      results,
    };
  }

  private async diagnoseSchool(
    studentId: string,
    school: School & { admissions?: any[] },
    summary?: StudentDataSummary,
  ) {
    if (!summary) {
      summary = await this.getStudentDataSummary(studentId);
      if (summary.approvedGradesCount < this.MIN_APPROVED_GRADES) {
        throw new BadRequestException(
          `진단을 위해 최소 ${this.MIN_APPROVED_GRADES}과목 이상의 승인된 성적이 필요합니다`,
        );
      }
    }

    const gradeScore = this.calculateGradeScore(summary.averageRank);
    const activityScore = this.calculateActivityScore(summary);
    const attendanceScore = this.calculateAttendanceScore(summary);
    const volunteerScore = this.calculateVolunteerScore(
      summary.totalVolunteerHours,
    );

    const score =
      gradeScore * this.GRADE_WEIGHT +
      activityScore * this.ACTIVITY_WEIGHT +
      attendanceScore * this.ATTENDANCE_WEIGHT +
      volunteerScore * this.VOLUNTEER_WEIGHT;

    const cutoffGrade = school.admissions?.[0]?.cutoffGrade;
    const level = this.determineLevel(summary.averageRank, cutoffGrade);

    const { strengths, weaknesses, recommendations } =
      this.analyzeStrengthsWeaknesses(
        summary,
        gradeScore,
        activityScore,
        attendanceScore,
        volunteerScore,
        cutoffGrade,
      );

    const diagnosis = await this.prisma.diagnosisResult.create({
      data: {
        studentId,
        schoolId: school.id,
        level,
        score,
        gradeScore,
        activityScore,
        attendanceScore,
        volunteerScore,
        strengths: JSON.stringify(strengths),
        weaknesses: JSON.stringify(weaknesses),
        recommendations: JSON.stringify(recommendations),
      },
    });

    return {
      diagnosisId: diagnosis.id,
      schoolId: school.id,
      schoolName: school.name,
      schoolType: school.type,
      level,
      score: Math.round(score * 10) / 10,
      gradeScore: Math.round(gradeScore * 10) / 10,
      activityScore: Math.round(activityScore * 10) / 10,
      attendanceScore: Math.round(attendanceScore * 10) / 10,
      volunteerScore: Math.round(volunteerScore * 10) / 10,
      cutoffGrade,
      strengths,
      weaknesses,
      recommendations,
      createdAt: diagnosis.createdAt,
    };
  }

  // ========== 추천 학교 (WP4.3) ==========
  async getRecommendations(studentId: string, region?: string) {
    const summary = await this.getStudentDataSummary(studentId);

    if (summary.approvedGradesCount < this.MIN_APPROVED_GRADES) {
      throw new BadRequestException(
        `추천을 위해 최소 ${this.MIN_APPROVED_GRADES}과목 이상의 승인된 성적이 필요합니다`,
      );
    }

    const whereClause: any = {
      publishStatus: PublishStatus.PUBLISHED,
    };

    if (region) {
      whereClause.region = region;
    }

    const schools = await this.prisma.school.findMany({
      where: whereClause,
      include: {
        admissions: {
          where: { publishStatus: PublishStatus.PUBLISHED },
          take: 1,
        },
      },
    });

    if (schools.length === 0) {
      return {
        recommendations: [],
        message: '현재 추천 가능한 학교가 없습니다',
      };
    }

    const scored = schools.map((school) => {
      const gradeScore = this.calculateGradeScore(summary.averageRank);
      const activityScore = this.calculateActivityScore(summary);
      const attendanceScore = this.calculateAttendanceScore(summary);
      const volunteerScore = this.calculateVolunteerScore(
        summary.totalVolunteerHours,
      );

      const score =
        gradeScore * this.GRADE_WEIGHT +
        activityScore * this.ACTIVITY_WEIGHT +
        attendanceScore * this.ATTENDANCE_WEIGHT +
        volunteerScore * this.VOLUNTEER_WEIGHT;

      const cutoffGrade = school.admissions?.[0]?.cutoffGrade;
      const level = this.determineLevel(summary.averageRank, cutoffGrade);

      return {
        school,
        score,
        level,
        cutoffGrade,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const top3 = scored.slice(0, 3);

    const recommendations = top3.map((item, index) => ({
      rank: index + 1,
      schoolId: item.school.id,
      schoolName: item.school.name,
      type: item.school.type,
      region: item.school.region,
      level: item.level,
      score: Math.round(item.score * 10) / 10,
      cutoffGrade: item.cutoffGrade,
      reason: this.getRecommendationReason(item.level, item.score),
    }));

    // 추천 결과 저장
    for (const rec of recommendations) {
      await this.prisma.recommendedSchool.create({
        data: {
          studentId,
          schoolId: rec.schoolId,
          rank: rec.rank,
          level: rec.level,
          score: rec.score,
          reason: rec.reason,
        },
      });
    }

    return {
      recommendations,
      message:
        recommendations.length < 3 ? '추천 가능한 학교가 제한적입니다' : null,
    };
  }

  // ========== 진단 결과 조회 (WP4.4) ==========
  async getLatestResult(studentId: string) {
    const result = await this.prisma.diagnosisResult.findFirst({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        school: {
          select: { id: true, name: true, type: true, region: true },
        },
      },
    });

    if (!result) {
      return {
        result: null,
        message: '아직 진단을 실행하지 않았습니다',
      };
    }

    return {
      result: {
        ...result,
        strengths: JSON.parse(result.strengths || '[]'),
        weaknesses: JSON.parse(result.weaknesses || '[]'),
        recommendations: JSON.parse(result.recommendations || '[]'),
      },
    };
  }

  async getDiagnosisHistory(studentId: string, limit: number = 10) {
    const results = await this.prisma.diagnosisResult.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        school: {
          select: { id: true, name: true, type: true, region: true },
        },
      },
    });

    return {
      results: results.map((r) => ({
        ...r,
        strengths: JSON.parse(r.strengths || '[]'),
        weaknesses: JSON.parse(r.weaknesses || '[]'),
        recommendations: JSON.parse(r.recommendations || '[]'),
      })),
    };
  }

  async getSchoolDiagnosisResult(studentId: string, schoolId: string) {
    const result = await this.prisma.diagnosisResult.findFirst({
      where: { studentId, schoolId },
      orderBy: { createdAt: 'desc' },
      include: {
        school: {
          select: { id: true, name: true, type: true, region: true },
        },
      },
    });

    if (!result) {
      return {
        result: null,
        message: '해당 학교에 대한 진단 기록이 없습니다',
      };
    }

    return {
      result: {
        ...result,
        strengths: JSON.parse(result.strengths || '[]'),
        weaknesses: JSON.parse(result.weaknesses || '[]'),
        recommendations: JSON.parse(result.recommendations || '[]'),
      },
    };
  }

  // ========== 학부모용 조회 ==========
  async getChildDiagnosisResults(parentId: string, childId: string) {
    await this.validateFamilyRelation(parentId, childId);
    return this.getDiagnosisHistory(childId);
  }

  async getChildRecommendations(parentId: string, childId: string) {
    await this.validateFamilyRelation(parentId, childId);

    const recommendations = await this.prisma.recommendedSchool.findMany({
      where: { studentId: childId },
      orderBy: [{ diagnosedAt: 'desc' }, { rank: 'asc' }],
      take: 3,
      include: {
        school: {
          select: { id: true, name: true, type: true, region: true },
        },
      },
    });

    return { recommendations };
  }

  // ========== 점수 계산 로직 ==========
  private async getStudentDataSummary(
    studentId: string,
  ): Promise<StudentDataSummary> {
    // 승인된 성적
    const grades = await this.prisma.grade.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
    });

    const gradesWithRank = grades.filter((g) => g.rank !== null);
    const averageRank =
      gradesWithRank.length > 0
        ? gradesWithRank.reduce((sum, g) => sum + (g.rank || 0), 0) /
          gradesWithRank.length
        : null;

    // 승인된 활동
    const activities = await this.prisma.activity.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
    });

    const activityCounts = activities.reduce(
      (acc: Record<string, number>, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      },
      {},
    );

    // 승인된 출결
    const attendances = await this.prisma.attendance.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
    });

    const attendanceSummary = attendances.reduce(
      (acc, a) => {
        acc.absenceUnexcused += a.absenceUnexcused;
        acc.absenceOther += a.absenceDisease + a.absenceOther;
        acc.lateness += a.latenessCount + a.earlyLeaveCount;
        return acc;
      },
      { absenceUnexcused: 0, absenceOther: 0, lateness: 0 },
    );

    // 승인된 봉사
    const volunteers = await this.prisma.volunteer.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
    });

    const totalVolunteerHours = volunteers.reduce((sum, v) => sum + v.hours, 0);

    return {
      approvedGradesCount: grades.length,
      averageRank,
      totalActivities: activities.length,
      activityCounts,
      attendanceSummary,
      totalVolunteerHours,
    };
  }

  private calculateGradeScore(averageRank: number | null): number {
    if (averageRank === null) return 0;
    return ((10 - averageRank) / 9) * 100;
  }

  private calculateActivityScore(summary: StudentDataSummary): number {
    const baseScore = Math.min(summary.totalActivities * 10, 50);
    let bonus = 0;
    const counts = summary.activityCounts || {};

    if (counts.CLUB) bonus += 5;
    if (counts.SUBJECT) bonus += 10;
    if (counts.VOLUNTEER) bonus += 5;
    if (counts.CAREER) bonus += 5;
    if (counts.AUTONOMOUS) bonus += 5;

    return Math.min(baseScore + bonus, 100);
  }

  private calculateAttendanceScore(summary: StudentDataSummary): number {
    const att = summary.attendanceSummary || {
      absenceUnexcused: 0,
      absenceOther: 0,
      lateness: 0,
    };
    let score = 100;
    score -= att.absenceUnexcused * 10;
    score -= att.absenceOther * 2;
    score -= att.lateness * 1;
    return Math.max(score, 0);
  }

  private calculateVolunteerScore(totalHours: number): number {
    return Math.min(totalHours * 5, 100);
  }

  private determineLevel(
    averageRank: number | null,
    cutoffGrade: number | null | undefined,
  ): DiagnosisLevel {
    if (averageRank === null || cutoffGrade === null || cutoffGrade === undefined) {
      if (averageRank === null) return DiagnosisLevel.CHALLENGE;
      if (averageRank <= 3) return DiagnosisLevel.FIT;
      if (averageRank <= 5) return DiagnosisLevel.CHALLENGE;
      return DiagnosisLevel.UNLIKELY;
    }

    const diff = averageRank - cutoffGrade;
    if (diff <= 0.5) return DiagnosisLevel.FIT;
    if (diff <= 1.5) return DiagnosisLevel.CHALLENGE;
    return DiagnosisLevel.UNLIKELY;
  }

  private analyzeStrengthsWeaknesses(
    summary: StudentDataSummary,
    gradeScore: number,
    activityScore: number,
    attendanceScore: number,
    volunteerScore: number,
    cutoffGrade: number | null | undefined,
  ) {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // 내신 분석
    if (gradeScore >= 70) {
      strengths.push('내신 관리가 양호합니다');
    } else if (gradeScore >= 50) {
      weaknesses.push('내신 등급 개선이 필요합니다');
      recommendations.push('주요 과목 성적 향상에 집중해보세요');
    } else {
      weaknesses.push('내신 등급이 많이 부족합니다');
      recommendations.push('기초 학력 향상과 내신 관리가 시급합니다');
    }

    // 활동 분석
    if (activityScore >= 70) {
      strengths.push('활동 기록이 풍부합니다');
    } else if (activityScore >= 30) {
      weaknesses.push('활동 기록이 부족합니다');
      recommendations.push('동아리 활동을 추가해보세요');
    } else {
      weaknesses.push('활동 기록이 매우 부족합니다');
      recommendations.push('다양한 비교과 활동 참여가 필요합니다');
    }

    // 출결 분석
    if (attendanceScore >= 95) {
      strengths.push('출결이 우수합니다');
    } else if (attendanceScore >= 80) {
      // 보통 수준
    } else {
      weaknesses.push('미인정 결석이 많습니다');
      recommendations.push('출결 관리에 신경써주세요');
    }

    // 봉사 분석
    if (volunteerScore >= 80) {
      strengths.push('봉사활동이 충분합니다');
    } else if (volunteerScore >= 40) {
      weaknesses.push('봉사 시간이 부족합니다');
      recommendations.push('봉사활동 시간을 20시간 이상으로 늘려보세요');
    } else {
      weaknesses.push('봉사활동 기록이 매우 부족합니다');
      recommendations.push('정기적인 봉사활동 참여가 필요합니다');
    }

    return { strengths, weaknesses, recommendations };
  }

  private getRecommendationReason(
    level: DiagnosisLevel,
    score: number,
  ): string {
    if (level === DiagnosisLevel.FIT) {
      return '내신과 활동이 전형 요건에 적합합니다';
    } else if (level === DiagnosisLevel.CHALLENGE) {
      return '활동을 보강하면 합격 가능성이 높아집니다';
    } else {
      return '도전적인 목표이지만 꾸준한 노력이 필요합니다';
    }
  }

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

