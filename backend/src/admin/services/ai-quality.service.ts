import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryPeriodDto, QueryAgentDto } from '../dto';

export interface Alert {
  type: string;
  message: string;
  details: string;
  affectedAgent?: string;
}

@Injectable()
export class AiQualityService {
  constructor(private prisma: PrismaService) {}

  private getPeriodDates(period?: string): { start: Date; end: Date; previousStart: Date; previousEnd: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = now;
    let previousStart: Date;
    let previousEnd: Date;

    if (!period || period === 'month') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousStart = new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousEnd = new Date(start.getTime() - 1);
    } else if (period === 'week') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      previousStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
      previousEnd = new Date(start.getTime() - 1);
    } else if (/^\d{4}-\d{2}$/.test(period)) {
      const [year, month] = period.split('-').map(Number);
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0, 23, 59, 59);
      previousStart = new Date(year, month - 2, 1);
      previousEnd = new Date(year, month - 1, 0, 23, 59, 59);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    }

    return { start, end, previousStart, previousEnd };
  }

  async getQualityOverview(query: QueryPeriodDto) {
    const { start, end, previousStart, previousEnd } = this.getPeriodDates(query.period);

    const [currentFeedbacks, previousFeedbacks] = await Promise.all([
      this.prisma.aIFeedback.groupBy({
        by: ['type'],
        _count: true,
        where: { createdAt: { gte: start, lte: end } },
      }),
      this.prisma.aIFeedback.groupBy({
        by: ['type'],
        _count: true,
        where: { createdAt: { gte: previousStart, lte: previousEnd } },
      }),
    ]);

    let currentTotal = 0;
    const currentByType: Record<string, number> = {};
    currentFeedbacks.forEach((f) => {
      currentByType[f.type] = f._count;
      currentTotal += f._count;
    });

    let previousTotal = 0;
    const previousByType: Record<string, number> = {};
    previousFeedbacks.forEach((f) => {
      previousByType[f.type] = f._count;
      previousTotal += f._count;
    });

    if (currentTotal === 0) {
      return {
        period: query.period || 'month',
        overallScore: null,
        status: 'NO_DATA',
        message: '아직 충분한 데이터가 없어 분석이 불가능합니다',
        minDataRequired: {
          feedbacks: 50,
          currentCount: 0,
        },
      };
    }

    // 만족도 점수 계산: LIKE=100점, EDITED=50점, DISLIKE=0점
    const likeCount = currentByType['LIKE'] || 0;
    const editedCount = currentByType['EDITED'] || 0;
    const dislikeCount = currentByType['DISLIKE'] || 0;

    const overallScore = ((likeCount * 100 + editedCount * 50) / currentTotal);

    // 이전 기간 점수
    const prevLike = previousByType['LIKE'] || 0;
    const prevEdited = previousByType['EDITED'] || 0;
    const prevDislike = previousByType['DISLIKE'] || 0;
    const prevScore = previousTotal > 0 ? ((prevLike * 100 + prevEdited * 50) / previousTotal) : 0;

    // 경고 감지
    const alerts: Alert[] = [];
    const recommendations: string[] = [];

    const currentDislikeRate = dislikeCount / currentTotal;
    const prevDislikeRate = previousTotal > 0 ? prevDislike / previousTotal : 0;

    if (currentDislikeRate > 0.3 && prevDislikeRate < 0.15) {
      // 품질 급락 감지
      const increase = prevDislikeRate > 0 ? ((currentDislikeRate - prevDislikeRate) / prevDislikeRate) * 100 : 100;
      alerts.push({
        type: 'QUALITY_DEGRADATION',
        message: 'AI 품질 저하가 감지되었습니다',
        details: `DISLIKE 비율이 ${(prevDislikeRate * 100).toFixed(1)}% → ${(currentDislikeRate * 100).toFixed(1)}%로 급증 (${increase.toFixed(0)}% 증가)`,
      });
      recommendations.push('최근 부정적 피드백 샘플 확인 권장');
    }

    if (currentDislikeRate > 0.2) {
      recommendations.push('프롬프트 개선 검토 필요');
    }

    let status = 'GOOD';
    if (overallScore < 50) status = 'WARNING';
    else if (overallScore < 70) status = 'MODERATE';

    return {
      period: query.period || 'month',
      overallScore: Math.round(overallScore * 10) / 10,
      status,
      breakdown: {
        LIKE: { count: likeCount, percent: Math.round((likeCount / currentTotal) * 1000) / 10 },
        DISLIKE: { count: dislikeCount, percent: Math.round((dislikeCount / currentTotal) * 1000) / 10 },
        EDITED: { count: editedCount, percent: Math.round((editedCount / currentTotal) * 1000) / 10 },
      },
      trend: {
        previousScore: Math.round(prevScore * 10) / 10,
        changePercent: prevScore > 0 ? Math.round(((overallScore - prevScore) / prevScore) * 1000) / 10 : 0,
      },
      alerts,
      recommendations,
    };
  }

  async getFeedbackStats(query: QueryPeriodDto) {
    const { start, end, previousStart, previousEnd } = this.getPeriodDates(query.period);

    const [currentFeedbacks, previousFeedbacks] = await Promise.all([
      this.prisma.aIFeedback.groupBy({
        by: ['type'],
        _count: true,
        where: { createdAt: { gte: start, lte: end } },
      }),
      this.prisma.aIFeedback.groupBy({
        by: ['type'],
        _count: true,
        where: { createdAt: { gte: previousStart, lte: previousEnd } },
      }),
    ]);

    let totalFeedbacks = 0;
    const breakdown: Record<string, { count: number; percent: number }> = {};
    
    currentFeedbacks.forEach((f) => {
      breakdown[f.type] = { count: f._count, percent: 0 };
      totalFeedbacks += f._count;
    });

    Object.keys(breakdown).forEach((type) => {
      breakdown[type].percent = Math.round((breakdown[type].count / totalFeedbacks) * 1000) / 10;
    });

    // 만족도 점수
    const likeCount = breakdown['LIKE']?.count || 0;
    const editedCount = breakdown['EDITED']?.count || 0;
    const satisfactionScore = totalFeedbacks > 0
      ? ((likeCount * 100 + editedCount * 50) / totalFeedbacks)
      : 0;

    // 이전 기간 점수
    let prevTotal = 0;
    let prevLike = 0;
    let prevEdited = 0;
    previousFeedbacks.forEach((f) => {
      prevTotal += f._count;
      if (f.type === 'LIKE') prevLike = f._count;
      if (f.type === 'EDITED') prevEdited = f._count;
    });
    const prevScore = prevTotal > 0 ? ((prevLike * 100 + prevEdited * 50) / prevTotal) : 0;

    return {
      period: query.period || 'month',
      totalFeedbacks,
      breakdown,
      satisfactionScore: Math.round(satisfactionScore * 10) / 10,
      trend: {
        previousPeriod: Math.round(prevScore * 10) / 10,
        changePercent: prevScore > 0 ? Math.round(((satisfactionScore - prevScore) / prevScore) * 1000) / 10 : 0,
      },
    };
  }

  async getAgentPerformance(query: QueryPeriodDto) {
    const { start, end } = this.getPeriodDates(query.period);

    // 에이전트별 출력 및 피드백 조회
    const outputs = await this.prisma.aIOutput.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: {
        feedbacks: {
          select: { type: true, editedContent: true },
        },
      },
    });

    // 에이전트 타입별 집계
    const agentStats = new Map<string, {
      name: string;
      outputs: number;
      feedbacks: number;
      likes: number;
      dislikes: number;
      edits: number;
      editLengthSum: number;
    }>();

    const agentNames: Record<string, string> = {
      RECORD_SENTENCE: '생기부 문장 생성',
      CLUB_RECOMMENDATION: '동아리 추천',
      SUBJECT_ADVICE: '교과 조언',
      READING_GUIDE: '독서 추천/가이드',
      ACTION_PLAN: '액션 플랜 생성',
      CONSULTATION_REPORT: '상담 리포트',
    };

    outputs.forEach((output) => {
      const type = output.type;
      if (!agentStats.has(type)) {
        agentStats.set(type, {
          name: agentNames[type] || type,
          outputs: 0,
          feedbacks: 0,
          likes: 0,
          dislikes: 0,
          edits: 0,
          editLengthSum: 0,
        });
      }

      const stats = agentStats.get(type)!;
      stats.outputs++;

      output.feedbacks.forEach((fb) => {
        stats.feedbacks++;
        if (fb.type === 'LIKE') stats.likes++;
        else if (fb.type === 'DISLIKE') stats.dislikes++;
        else if (fb.type === 'EDITED') {
          stats.edits++;
          if (fb.editedContent) {
            stats.editLengthSum += fb.editedContent.length;
          }
        }
      });
    });

    const agents = Array.from(agentStats.entries()).map(([type, stats]) => ({
      type,
      name: stats.name,
      outputs: stats.outputs,
      feedbacks: stats.feedbacks,
      likeRate: stats.feedbacks > 0 ? Math.round((stats.likes / stats.feedbacks) * 1000) / 10 : 0,
      dislikeRate: stats.feedbacks > 0 ? Math.round((stats.dislikes / stats.feedbacks) * 1000) / 10 : 0,
      editRate: stats.feedbacks > 0 ? Math.round((stats.edits / stats.feedbacks) * 1000) / 10 : 0,
      avgEditLength: stats.edits > 0 ? Math.round(stats.editLengthSum / stats.edits) : 0,
    }));

    // 정렬: 피드백 수 기준 내림차순
    agents.sort((a, b) => b.feedbacks - a.feedbacks);

    // 베스트/개선 필요 에이전트 식별
    let bestPerforming: string | null = null;
    let needsImprovement: string | null = null;
    let bestScore = -1;
    let worstScore = 101;

    agents.forEach((agent) => {
      if (agent.feedbacks >= 10) {
        const score = agent.likeRate - agent.dislikeRate;
        if (score > bestScore) {
          bestScore = score;
          bestPerforming = agent.type;
        }
        if (score < worstScore) {
          worstScore = score;
          needsImprovement = agent.type;
        }
      }
    });

    return {
      period: query.period || 'month',
      agents,
      bestPerforming,
      needsImprovement,
    };
  }

  async getEditPatterns(query: QueryAgentDto) {
    const { start, end } = this.getPeriodDates(query.period);

    const where: any = {
      type: 'EDITED',
      editedContent: { not: null },
      createdAt: { gte: start, lte: end },
    };

    if (query.agentType) {
      where.output = { type: query.agentType as any };
    }

    const feedbacks = await this.prisma.aIFeedback.findMany({
      where,
      include: {
        output: {
          select: { response: true, type: true },
        },
      },
    });

    if (feedbacks.length === 0) {
      return {
        period: query.period || 'month',
        agentType: query.agentType || 'ALL',
        totalEdits: 0,
        message: '수정 데이터가 없습니다',
      };
    }

    // 패턴 분석 (간단한 휴리스틱)
    const patterns: Record<string, number> = {
      LENGTH_REDUCTION: 0,
      LENGTH_INCREASE: 0,
      MINOR_EDIT: 0,
      MAJOR_REWRITE: 0,
    };

    let totalOriginalLength = 0;
    let totalEditedLength = 0;

    feedbacks.forEach((fb) => {
      const originalLength = fb.output.response.length;
      const editedLength = fb.editedContent?.length || 0;
      
      totalOriginalLength += originalLength;
      totalEditedLength += editedLength;

      const lengthDiff = editedLength - originalLength;
      const changeRatio = Math.abs(lengthDiff) / originalLength;

      if (lengthDiff < -20) {
        patterns.LENGTH_REDUCTION++;
      } else if (lengthDiff > 20) {
        patterns.LENGTH_INCREASE++;
      } else if (changeRatio < 0.3) {
        patterns.MINOR_EDIT++;
      } else {
        patterns.MAJOR_REWRITE++;
      }
    });

    const totalEdits = feedbacks.length;
    const patternList = Object.entries(patterns)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => ({
        type,
        count,
        percent: Math.round((count / totalEdits) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      period: query.period || 'month',
      agentType: query.agentType || 'ALL',
      totalEdits,
      patterns: patternList,
      avgOriginalLength: Math.round(totalOriginalLength / totalEdits),
      avgEditedLength: Math.round(totalEditedLength / totalEdits),
      insight: this.generateInsight(patternList),
    };
  }

  private generateInsight(patterns: { type: string; percent: number }[]): string {
    if (patterns.length === 0) return '분석할 데이터가 부족합니다';

    const topPattern = patterns[0];
    switch (topPattern.type) {
      case 'LENGTH_REDUCTION':
        return '사용자들이 주로 문장 길이를 줄이는 경향이 있습니다. 더 간결한 출력을 고려해보세요.';
      case 'LENGTH_INCREASE':
        return '사용자들이 내용을 추가하는 경향이 있습니다. 더 상세한 출력이 필요할 수 있습니다.';
      case 'MINOR_EDIT':
        return '대부분의 수정이 경미합니다. AI 출력 품질이 양호합니다.';
      case 'MAJOR_REWRITE':
        return '사용자들이 대폭 수정하는 경향이 있습니다. 프롬프트 개선이 필요합니다.';
      default:
        return '수정 패턴을 분석 중입니다.';
    }
  }
}

