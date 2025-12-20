import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlanType } from '../../generated/prisma';

@Injectable()
export class PlanService {
  constructor(private prisma: PrismaService) {}

  // ========== WP9.0: 플랜 조회 ==========

  async getAllPlans(activeOnly = true) {
    const where = activeOnly ? { isActive: true } : {};

    const plans = await this.prisma.plan.findMany({
      where,
      orderBy: { monthlyPrice: 'asc' },
    });

    return {
      plans: plans.map((plan) => ({
        ...plan,
        features: JSON.parse(plan.features || '[]'),
      })),
    };
  }

  async getPlanById(planId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('플랜을 찾을 수 없습니다');
    }

    return {
      plan: {
        ...plan,
        features: JSON.parse(plan.features || '[]'),
      },
    };
  }

  async getPlanByType(type: PlanType) {
    const plan = await this.prisma.plan.findUnique({
      where: { type },
    });

    if (!plan) {
      throw new NotFoundException('플랜을 찾을 수 없습니다');
    }

    return plan;
  }

  async getPlansWithCurrentPlan(userId: string) {
    const plans = await this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: 'asc' },
    });

    // 현재 구독 조회
    const currentSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'TRIAL', 'PAST_DUE'] },
      },
      include: { plan: true },
    });

    return {
      plans: plans.map((plan) => ({
        ...plan,
        features: JSON.parse(plan.features || '[]'),
        isCurrent: currentSubscription?.planId === plan.id,
        canUpgrade: currentSubscription
          ? plan.monthlyPrice > currentSubscription.plan.monthlyPrice
          : plan.type !== 'FREE',
        canDowngrade: currentSubscription
          ? plan.monthlyPrice < currentSubscription.plan.monthlyPrice
          : false,
      })),
      currentPlan: currentSubscription?.plan || null,
    };
  }

  // ========== 시드 데이터 생성 (개발용) ==========

  async seedPlans() {
    const plans = [
      {
        type: 'FREE' as PlanType,
        name: '무료',
        description: '기본 기능을 무료로 이용하세요',
        monthlyPrice: 0,
        features: JSON.stringify([
          '데이터 입력',
          '진단 1회/월',
          '학교 정보 조회',
        ]),
        consultLimit: 0,
        aiLimit: 3,
      },
      {
        type: 'BASIC' as PlanType,
        name: '베이직',
        description: '일반고 준비에 적합한 플랜',
        monthlyPrice: 29900,
        features: JSON.stringify([
          '무제한 진단',
          'AI 조언 무제한',
          '액션 플랜 생성',
          '진단 리포트',
        ]),
        consultLimit: 0,
        aiLimit: null,
      },
      {
        type: 'PREMIUM' as PlanType,
        name: '프리미엄',
        description: '특목/자사고 준비를 위한 전문 플랜',
        monthlyPrice: 49900,
        features: JSON.stringify([
          'BASIC 모든 기능',
          '전문 컨설턴트 상담 2회/월',
          '맞춤형 상담 리포트',
          '우선 고객 지원',
        ]),
        consultLimit: 2,
        aiLimit: null,
      },
      {
        type: 'VIP' as PlanType,
        name: 'VIP',
        description: '최상위 맞춤 컨설팅 서비스',
        monthlyPrice: 99900,
        features: JSON.stringify([
          'PREMIUM 모든 기능',
          '무제한 컨설턴트 상담',
          '전담 컨설턴트 배정',
          '입시 전략 수립',
          '24시간 지원',
        ]),
        consultLimit: null,
        aiLimit: null,
      },
    ];

    for (const plan of plans) {
      await this.prisma.plan.upsert({
        where: { type: plan.type },
        update: plan,
        create: plan,
      });
    }

    return { message: '플랜 시드 데이터가 생성되었습니다', count: plans.length };
  }
}











