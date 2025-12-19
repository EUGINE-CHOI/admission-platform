import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SchoolCompareItem {
  id: string;
  name: string;
  type: string;
  region: string;
  website?: string;
  competitionRate?: number;
  cutoffGrade?: number;
  admissionType?: string;
  specialFeatures: string[];
}

export interface CompareResult {
  schools: SchoolCompareItem[];
  comparison: {
    category: string;
    values: (string | number | null)[];
    winner?: number; // 가장 좋은 학교의 인덱스
  }[];
  recommendation?: string;
}

@Injectable()
export class SchoolCompareService {
  constructor(private prisma: PrismaService) {}

  // 여러 학교 비교
  async compareSchools(schoolIds: string[]): Promise<CompareResult> {
    if (schoolIds.length < 2 || schoolIds.length > 5) {
      throw new BadRequestException('2~5개 학교를 선택해주세요');
    }

    const schools = await this.prisma.school.findMany({
      where: { id: { in: schoolIds } },
      include: {
        admissions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        schedules: {
          where: {
            startDate: { gte: new Date() },
          },
          take: 3,
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (schools.length !== schoolIds.length) {
      throw new BadRequestException('일부 학교를 찾을 수 없습니다');
    }

    // 학교 정보 정리
    const schoolItems: SchoolCompareItem[] = schools.map((school) => {
      const admission = school.admissions[0];
      const features: string[] = [];

      // 학교 유형별 특징
      if (school.type === 'SPECIAL') features.push('특목고');
      if (school.type === 'AUTONOMOUS') features.push('자사고');
      if (school.type === 'SPECIALIZED') features.push('특성화고');
      if (school.type === 'GENERAL') features.push('일반고');

      return {
        id: school.id,
        name: school.name,
        type: this.getSchoolTypeName(school.type),
        region: school.region,
        website: school.website ?? undefined,
        competitionRate: admission?.competitionRate ?? undefined,
        cutoffGrade: admission?.cutoffGrade ?? undefined,
        admissionType: admission?.type ?? undefined,
        specialFeatures: features,
      };
    });

    // 비교 항목 생성
    const comparison: CompareResult['comparison'] = [
      {
        category: '학교 유형',
        values: schoolItems.map((s) => s.type),
      },
      {
        category: '지역',
        values: schoolItems.map((s) => s.region),
      },
      {
        category: '경쟁률',
        values: schoolItems.map((s) => s.competitionRate ?? null),
        winner: this.findLowestIndex(schoolItems.map((s) => s.competitionRate)),
      },
      {
        category: '커트라인 등급',
        values: schoolItems.map((s) => s.cutoffGrade ?? null),
        winner: this.findHighestIndex(schoolItems.map((s) => s.cutoffGrade)),
      },
      {
        category: '전형 방식',
        values: schoolItems.map((s) => s.admissionType ?? '정보 없음'),
      },
      {
        category: '특징',
        values: schoolItems.map((s) => s.specialFeatures.join(', ') || '일반'),
      },
    ];

    // 추천 메시지 생성
    const recommendation = this.generateRecommendation(schoolItems);

    return {
      schools: schoolItems,
      comparison,
      recommendation,
    };
  }

  // 학생의 목표 학교들 비교
  async compareTargetSchools(studentId: string): Promise<CompareResult> {
    const targetSchools = await this.prisma.targetSchool.findMany({
      where: { studentId },
      select: { schoolId: true },
    });

    if (targetSchools.length < 2) {
      throw new BadRequestException('비교하려면 목표 학교를 2개 이상 설정해주세요');
    }

    const schoolIds = targetSchools.map((t) => t.schoolId);
    return this.compareSchools(schoolIds);
  }

  private getSchoolTypeName(type: string): string {
    const typeNames: Record<string, string> = {
      SPECIAL: '특목고',
      AUTONOMOUS: '자사고',
      SPECIALIZED: '특성화고',
      GENERAL: '일반고',
    };
    return typeNames[type] || type;
  }

  private findLowestIndex(values: (number | undefined)[]): number | undefined {
    const validValues = values.map((v, i) => ({ value: v, index: i })).filter((v) => v.value !== undefined);
    if (validValues.length === 0) return undefined;
    return validValues.reduce((min, curr) => (curr.value! < min.value! ? curr : min)).index;
  }

  private findHighestIndex(values: (number | undefined)[]): number | undefined {
    const validValues = values.map((v, i) => ({ value: v, index: i })).filter((v) => v.value !== undefined);
    if (validValues.length === 0) return undefined;
    return validValues.reduce((max, curr) => (curr.value! > max.value! ? curr : max)).index;
  }

  private generateRecommendation(schools: SchoolCompareItem[]): string {
    const withRate = schools.filter((s) => s.competitionRate);
    
    if (withRate.length === 0) {
      return '경쟁률 정보가 없어 구체적인 추천이 어렵습니다. 학교 홈페이지에서 최신 정보를 확인하세요.';
    }

    const lowestRate = withRate.reduce((min, s) => 
      (s.competitionRate ?? Infinity) < (min.competitionRate ?? Infinity) ? s : min
    );

    const highestRate = withRate.reduce((max, s) => 
      (s.competitionRate ?? 0) > (max.competitionRate ?? 0) ? s : max
    );

    return `경쟁률 기준으로 ${lowestRate.name}(${lowestRate.competitionRate}:1)이 상대적으로 합격 가능성이 높고, ` +
           `${highestRate.name}(${highestRate.competitionRate}:1)이 가장 도전적입니다. ` +
           `본인의 성적과 준비 상황을 고려하여 선택하세요.`;
  }
}

