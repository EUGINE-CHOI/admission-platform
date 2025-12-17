import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GradeTrend {
  subject: string;
  data: {
    period: string;
    score: number;
    rank?: number;
  }[];
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface SubjectAnalysis {
  subject: string;
  average: number;
  highest: number;
  lowest: number;
  trend: 'up' | 'down' | 'stable';
  suggestion: string;
}

@Injectable()
export class GradeAnalysisService {
  constructor(private prisma: PrismaService) {}

  // 성적 추이 분석
  async getGradeTrends(studentId: string): Promise<{
    trends: GradeTrend[];
    overallTrend: 'up' | 'down' | 'stable';
    overallChange: number;
    subjectAnalysis: SubjectAnalysis[];
  }> {
    const grades = await this.prisma.grade.findMany({
      where: { studentId },
      orderBy: [{ year: 'asc' }, { semester: 'asc' }],
    });

    if (grades.length === 0) {
      return {
        trends: [],
        overallTrend: 'stable',
        overallChange: 0,
        subjectAnalysis: [],
      };
    }

    // 과목별 성적 그룹화
    const subjectGrades: Record<string, typeof grades> = {};
    grades.forEach((grade) => {
      if (!subjectGrades[grade.subject]) {
        subjectGrades[grade.subject] = [];
      }
      subjectGrades[grade.subject].push(grade);
    });

    // 과목별 추이 계산
    const trends: GradeTrend[] = [];
    const subjectAnalysis: SubjectAnalysis[] = [];

    for (const [subject, subjectData] of Object.entries(subjectGrades)) {
      const sortedData = subjectData.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.semester - b.semester;
      });

      const data = sortedData.map((g) => ({
        period: `${g.year}-${g.semester}학기`,
        score: Math.round((g.written + g.performance) / 2),
        rank: g.rank ?? undefined,
      }));

      // 추이 계산 (최근 2개 비교)
      let trend: 'up' | 'down' | 'stable' = 'stable';
      let change = 0;

      if (data.length >= 2) {
        const recent = data[data.length - 1].score;
        const previous = data[data.length - 2].score;
        change = recent - previous;

        if (change > 3) trend = 'up';
        else if (change < -3) trend = 'down';
      }

      trends.push({ subject, data, trend, change });

      // 과목 분석
      const scores = data.map((d) => d.score);
      const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const highest = Math.max(...scores);
      const lowest = Math.min(...scores);

      let suggestion = '';
      if (trend === 'down') {
        suggestion = `${subject} 성적이 하락 추세입니다. 집중적인 학습이 필요합니다.`;
      } else if (trend === 'up') {
        suggestion = `${subject} 성적이 상승 중입니다. 현재 학습 방법을 유지하세요.`;
      } else if (average < 70) {
        suggestion = `${subject} 평균 점수가 낮습니다. 기초 개념 복습을 권장합니다.`;
      } else {
        suggestion = `${subject} 성적이 안정적입니다. 꾸준히 유지하세요.`;
      }

      subjectAnalysis.push({
        subject,
        average,
        highest,
        lowest,
        trend,
        suggestion,
      });
    }

    // 전체 추이 계산
    const allScores = grades.map((g) => (g.written + g.performance) / 2);
    const recentScores = allScores.slice(-5);
    const previousScores = allScores.slice(-10, -5);

    let overallTrend: 'up' | 'down' | 'stable' = 'stable';
    let overallChange = 0;

    if (recentScores.length > 0 && previousScores.length > 0) {
      const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const previousAvg = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;
      overallChange = Math.round(recentAvg - previousAvg);

      if (overallChange > 3) overallTrend = 'up';
      else if (overallChange < -3) overallTrend = 'down';
    }

    return {
      trends,
      overallTrend,
      overallChange,
      subjectAnalysis,
    };
  }

  // AI 기반 성적 분석 조언
  async getGradeAdvice(studentId: string): Promise<{
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }> {
    const analysis = await this.getGradeTrends(studentId);

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    analysis.subjectAnalysis.forEach((subject) => {
      if (subject.average >= 85) {
        strengths.push(`${subject.subject}: 평균 ${subject.average}점으로 우수합니다.`);
      } else if (subject.average < 70) {
        weaknesses.push(`${subject.subject}: 평균 ${subject.average}점으로 보완이 필요합니다.`);
      }

      if (subject.trend === 'down') {
        recommendations.push(subject.suggestion);
      }
    });

    if (analysis.overallTrend === 'up') {
      strengths.push('전체적인 성적이 상승 추세입니다.');
    } else if (analysis.overallTrend === 'down') {
      weaknesses.push('전체적인 성적이 하락 추세입니다.');
      recommendations.push('학습 계획을 재점검하고 부족한 과목에 집중하세요.');
    }

    return { strengths, weaknesses, recommendations };
  }
}

