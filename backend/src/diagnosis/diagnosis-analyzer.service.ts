import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SchoolType, DiagnosisLevel } from '../../generated/prisma';

interface StudentProfile {
  averageRank: number | null;
  totalActivities: number;
  activityCounts: Record<string, number>;
  totalVolunteerHours: number;
  readingCount: number;
  clubCount: number;
  competitionCount: number;
  certificateCount: number;
}

interface SchoolRequirement {
  type: SchoolType;
  minGrade: number;
  requiredActivities: string[];
  recommendedActivities: string[];
  importantFactors: string[];
  tipMessage: string;
}

@Injectable()
export class DiagnosisAnalyzerService {
  constructor(private prisma: PrismaService) {}

  // 학교 타입별 요구사항 정의
  private readonly schoolRequirements: Record<string, SchoolRequirement> = {
    SCIENCE: {
      type: SchoolType.SCIENCE,
      minGrade: 1.5,
      requiredActivities: ['수학/과학 경시대회', '과학 탐구 활동', 'R&E 연구'],
      recommendedActivities: ['과학 동아리', '발명대회', '과학전람회'],
      importantFactors: ['수학/과학 성적', '탐구 활동', '자기주도학습'],
      tipMessage: '과학고는 수학, 과학 교과 성적과 탐구 역량이 가장 중요합니다. 영재교육원 경험도 도움이 됩니다.',
    },
    FOREIGN_LANGUAGE: {
      type: SchoolType.FOREIGN_LANGUAGE,
      minGrade: 2.0,
      requiredActivities: ['영어 말하기 대회', '외국어 관련 활동'],
      recommendedActivities: ['영어 토론 동아리', '영자 신문 활동', '다문화 봉사'],
      importantFactors: ['영어 내신', '영어 면접', '글로벌 역량'],
      tipMessage: '외고는 영어 내신이 가장 중요하며, 면접에서 영어 말하기 능력을 평가합니다.',
    },
    INTERNATIONAL: {
      type: SchoolType.INTERNATIONAL,
      minGrade: 2.0,
      requiredActivities: ['국제 교류 활동', '글로벌 이슈 탐구'],
      recommendedActivities: ['MUN (모의유엔)', '국제 봉사', '외국어 동아리'],
      importantFactors: ['영어 내신', '글로벌 마인드', '국제 이슈 관심'],
      tipMessage: '국제고는 외고와 유사하지만 국제 이슈에 대한 관심과 글로벌 역량을 더 중시합니다.',
    },
    AUTONOMOUS_PRIVATE: {
      type: SchoolType.AUTONOMOUS_PRIVATE,
      minGrade: 2.5,
      requiredActivities: ['자기주도학습', '리더십 활동'],
      recommendedActivities: ['학생회', '동아리 회장', '멘토링'],
      importantFactors: ['내신 성적', '자기소개서', '면접'],
      tipMessage: '자사고는 내신 성적과 함께 자기주도학습 능력, 리더십을 종합적으로 평가합니다.',
    },
    ARTS: {
      type: SchoolType.ARTS,
      minGrade: 3.0,
      requiredActivities: ['실기 수상 경력', '예술 활동 포트폴리오'],
      recommendedActivities: ['예술 동아리', '공연/전시 참여', '개인 레슨'],
      importantFactors: ['실기 능력', '예술적 잠재력', '전공 관련 활동'],
      tipMessage: '예술고는 실기 능력이 가장 중요합니다. 꾸준한 연습과 수상 경력이 도움됩니다.',
    },
    SPORTS: {
      type: SchoolType.SPORTS,
      minGrade: 4.0,
      requiredActivities: ['체육 대회 입상', '선수 등록'],
      recommendedActivities: ['학교 대표 선수', '체육 동아리'],
      importantFactors: ['실기 능력', '체력', '선수 경력'],
      tipMessage: '체육고는 해당 종목의 실기 능력과 대회 성적이 가장 중요합니다.',
    },
    SPECIALIZED: {
      type: SchoolType.SPECIALIZED,
      minGrade: 3.5,
      requiredActivities: ['전공 관련 자격증', '직업 체험'],
      recommendedActivities: ['전공 동아리', '인턴십', '기술 대회'],
      importantFactors: ['전공 적성', '직업 의식', '기초 학력'],
      tipMessage: '특성화고는 전공에 대한 관심과 적성, 취업 의지를 중요하게 봅니다.',
    },
    GENERAL: {
      type: SchoolType.GENERAL,
      minGrade: 5.0,
      requiredActivities: [],
      recommendedActivities: ['동아리', '봉사활동', '독서'],
      importantFactors: ['내신 성적', '출결'],
      tipMessage: '일반고는 내신 성적과 출결 상황이 기본이며, 희망 학교 지역을 고려해 선택하세요.',
    },
  };

  // 학생 프로필 분석
  async analyzeStudentProfile(studentId: string): Promise<StudentProfile> {
    const [grades, activities, readings] = await Promise.all([
      this.prisma.grade.findMany({
        where: { studentId, status: 'APPROVED' },
      }),
      this.prisma.activity.findMany({
        where: { studentId, status: 'APPROVED' },
      }),
      this.prisma.readingLog.findMany({
        where: { studentId, status: 'APPROVED' },
      }),
    ]);

    const volunteers = await this.prisma.volunteer.findMany({
      where: { studentId, status: 'APPROVED' },
    });

    const activityCounts: Record<string, number> = {};
    activities.forEach((a) => {
      activityCounts[a.type] = (activityCounts[a.type] || 0) + 1;
    });

    const avgRank = grades.length > 0
      ? grades.reduce((sum, g) => sum + (g.rank || 5), 0) / grades.length
      : null;

    return {
      averageRank: avgRank,
      totalActivities: activities.length,
      activityCounts,
      totalVolunteerHours: volunteers.reduce((sum, v) => sum + v.hours, 0),
      readingCount: readings.length,
      clubCount: activityCounts['CLUB'] || 0,
      competitionCount: activityCounts['COMPETITION'] || 0,
      certificateCount: activityCounts['CERTIFICATE'] || 0,
    };
  }

  // 학교 타입별 적합도 분석
  analyzeSchoolFit(profile: StudentProfile, schoolType: SchoolType): {
    fitScore: number;
    level: DiagnosisLevel;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    tipMessage: string;
  } {
    const requirement = this.schoolRequirements[schoolType] || this.schoolRequirements.GENERAL;
    
    let fitScore = 0;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // 1. 성적 평가 (40점)
    if (profile.averageRank !== null) {
      if (profile.averageRank <= requirement.minGrade) {
        fitScore += 40;
        strengths.push(`평균 등급 ${profile.averageRank.toFixed(1)}등급으로 기준 충족`);
      } else if (profile.averageRank <= requirement.minGrade + 1) {
        fitScore += 25;
        weaknesses.push(`성적이 기준(${requirement.minGrade}등급)보다 다소 낮음`);
        recommendations.push('취약 과목 집중 학습으로 성적 향상 필요');
      } else {
        fitScore += 10;
        weaknesses.push(`성적 향상이 시급함 (현재 ${profile.averageRank.toFixed(1)}등급)`);
        recommendations.push('기초 학력 강화와 학습 습관 개선이 우선');
      }
    }

    // 2. 활동 평가 (30점)
    if (profile.totalActivities >= 5) {
      fitScore += 30;
      strengths.push(`다양한 비교과 활동 ${profile.totalActivities}개 보유`);
    } else if (profile.totalActivities >= 3) {
      fitScore += 20;
      recommendations.push('비교과 활동을 더 다양화하면 좋겠습니다');
    } else {
      fitScore += 5;
      weaknesses.push('비교과 활동이 부족합니다');
      recommendations.push(requirement.recommendedActivities.join(', ') + ' 활동을 추천합니다');
    }

    // 3. 학교 타입별 특화 평가 (30점)
    switch (schoolType) {
      case SchoolType.SCIENCE:
        if (profile.competitionCount >= 2) {
          fitScore += 30;
          strengths.push('과학/수학 경시대회 경험 보유');
        } else if (profile.competitionCount >= 1) {
          fitScore += 15;
          recommendations.push('경시대회 참가 경험을 더 쌓으세요');
        } else {
          weaknesses.push('경시대회 경험이 부족합니다');
          recommendations.push('교내 과학 경시대회부터 도전해보세요');
        }
        break;

      case SchoolType.FOREIGN_LANGUAGE:
      case SchoolType.INTERNATIONAL:
        if (profile.clubCount >= 1 && profile.competitionCount >= 1) {
          fitScore += 30;
          strengths.push('외국어 관련 동아리 및 대회 경험');
        } else {
          fitScore += 10;
          recommendations.push('영어 말하기 대회, 토론 동아리 활동을 추천합니다');
        }
        break;

      case SchoolType.AUTONOMOUS_PRIVATE:
        if (profile.totalActivities >= 4 && profile.totalVolunteerHours >= 20) {
          fitScore += 30;
          strengths.push('균형 잡힌 활동과 봉사 경험');
        } else {
          fitScore += 15;
          recommendations.push('리더십 활동과 봉사활동 시간을 늘려보세요');
        }
        break;

      case SchoolType.SPECIALIZED:
        if (profile.certificateCount >= 1) {
          fitScore += 30;
          strengths.push('전공 관련 자격증 보유');
        } else {
          fitScore += 10;
          recommendations.push('관심 분야의 자격증 취득을 고려해보세요');
        }
        break;

      default:
        fitScore += 15;
        if (profile.readingCount >= 5) {
          strengths.push('꾸준한 독서 습관');
          fitScore += 10;
        }
    }

    // 레벨 결정
    let level: DiagnosisLevel;
    if (fitScore >= 70) {
      level = DiagnosisLevel.FIT;
    } else if (fitScore >= 40) {
      level = DiagnosisLevel.CHALLENGE;
    } else {
      level = DiagnosisLevel.UNLIKELY;
    }

    return {
      fitScore,
      level,
      strengths,
      weaknesses,
      recommendations,
      tipMessage: requirement.tipMessage,
    };
  }

  // 합격 예측 (경쟁률 기반)
  async predictAdmission(
    studentId: string,
    schoolId: string,
  ): Promise<{
    probability: number;
    confidence: string;
    factors: { name: string; impact: string; score: number }[];
  }> {
    const [profile, school, admissionHistory] = await Promise.all([
      this.analyzeStudentProfile(studentId),
      this.prisma.school.findUnique({
        where: { id: schoolId },
        include: { admissions: { orderBy: { year: 'desc' }, take: 3 } },
      }),
      this.prisma.admissionHistory.findMany({
        where: { schoolId },
        orderBy: { year: 'desc' },
        take: 3,
      }),
    ]);

    if (!school) {
      return { probability: 0, confidence: '데이터 없음', factors: [] };
    }

    const analysis = this.analyzeSchoolFit(profile, school.type);
    const factors: { name: string; impact: string; score: number }[] = [];

    // 성적 요소
    let gradeImpact = 'neutral';
    let gradeScore = 50;
    if (profile.averageRank !== null) {
      if (profile.averageRank <= 1.5) {
        gradeImpact = 'positive';
        gradeScore = 90;
      } else if (profile.averageRank <= 2.5) {
        gradeImpact = 'positive';
        gradeScore = 70;
      } else if (profile.averageRank <= 3.5) {
        gradeScore = 50;
      } else {
        gradeImpact = 'negative';
        gradeScore = 30;
      }
    }
    factors.push({ name: '내신 성적', impact: gradeImpact, score: gradeScore });

    // 경쟁률 요소
    const avgCompetitionRate = admissionHistory.length > 0
      ? admissionHistory.reduce((sum, h) => sum + (h.competitionRate || 0), 0) / admissionHistory.length
      : 5;
    
    let competitionImpact = 'neutral';
    let competitionScore = 50;
    if (avgCompetitionRate < 3) {
      competitionImpact = 'positive';
      competitionScore = 70;
    } else if (avgCompetitionRate > 7) {
      competitionImpact = 'negative';
      competitionScore = 30;
    }
    factors.push({ name: '경쟁률', impact: competitionImpact, score: competitionScore });

    // 활동 요소
    let activityImpact = 'neutral';
    let activityScore = 50;
    if (profile.totalActivities >= 5) {
      activityImpact = 'positive';
      activityScore = 80;
    } else if (profile.totalActivities >= 3) {
      activityScore = 60;
    } else {
      activityImpact = 'negative';
      activityScore = 30;
    }
    factors.push({ name: '비교과 활동', impact: activityImpact, score: activityScore });

    // 최종 확률 계산
    const probability = Math.round(
      (gradeScore * 0.5 + competitionScore * 0.2 + activityScore * 0.3)
    );

    let confidence = '보통';
    if (admissionHistory.length >= 3) {
      confidence = '높음';
    } else if (admissionHistory.length === 0) {
      confidence = '낮음 (데이터 부족)';
    }

    return { probability, confidence, factors };
  }

  // 맞춤 학교 추천
  async getPersonalizedRecommendations(
    studentId: string,
    preferences: { regions?: string[]; types?: SchoolType[] },
  ): Promise<{
    schools: Array<{
      school: any;
      fitScore: number;
      level: DiagnosisLevel;
      reason: string;
    }>;
  }> {
    const profile = await this.analyzeStudentProfile(studentId);

    const whereClause: any = {
      publishStatus: 'PUBLISHED',
    };

    if (preferences.regions?.length) {
      whereClause.region = { in: preferences.regions };
    }
    if (preferences.types?.length) {
      whereClause.type = { in: preferences.types };
    }

    const schools = await this.prisma.school.findMany({
      where: whereClause,
      take: 50,
    });

    const analyzed = schools.map((school) => {
      const analysis = this.analyzeSchoolFit(profile, school.type);
      let reason = '';
      
      if (analysis.level === DiagnosisLevel.FIT) {
        reason = '현재 역량으로 충분히 합격 가능합니다';
      } else if (analysis.level === DiagnosisLevel.CHALLENGE) {
        reason = '도전해볼 만한 학교입니다';
      } else {
        reason = '더 많은 준비가 필요합니다';
      }

      return {
        school,
        fitScore: analysis.fitScore,
        level: analysis.level,
        reason,
      };
    });

    analyzed.sort((a, b) => b.fitScore - a.fitScore);

    return { schools: analyzed.slice(0, 10) };
  }
}

