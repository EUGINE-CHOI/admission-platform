import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlanService } from '../plan/plan.service';
import {
  CreateSubscriptionDto,
  UpgradeSubscriptionDto,
  DowngradeSubscriptionDto,
  CancelSubscriptionDto,
  PaymentWebhookDto,
  WebhookEventType,
} from './dto';
import {
  PlanType,
  SubscriptionStatus,
  PaymentStatus,
} from '../../generated/prisma';

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private planService: PlanService,
  ) {}

  // ========== WP9.1: 구독 시작 ==========

  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    // 기존 활성 구독 확인
    const existingSubscription = await this.getActiveSubscription(userId);
    if (existingSubscription) {
      throw new ConflictException('이미 활성 구독이 있습니다. 업그레이드를 사용해 주세요.');
    }

    // 플랜 조회
    const plan = await this.planService.getPlanByType(dto.planType);

    // FREE 플랜은 결제 없이 바로 생성
    if (dto.planType === 'FREE') {
      return this.createFreeSubscription(userId, plan.id);
    }

    // 가족 할인 계산
    const discountRate = await this.calculateFamilyDiscount(userId);
    const discountAmount = Math.floor(plan.monthlyPrice * discountRate);
    const finalAmount = plan.monthlyPrice - discountAmount;

    // 구독 및 결제 레코드 생성 (PENDING 상태)
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        status: 'ACTIVE', // PG 연동 시 PENDING으로 변경
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        discountRate,
      },
      include: { plan: true },
    });

    // 결제 기록 생성
    await this.prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: finalAmount,
        originalAmount: plan.monthlyPrice,
        discountAmount,
        status: 'COMPLETED', // PG 연동 시 PENDING으로 변경
        paidAt: now,
      },
    });

    // User.hasPremium 업데이트
    await this.updateUserPremiumStatus(userId);

    return {
      message: '구독이 시작되었습니다',
      subscription: {
        ...subscription,
        plan: {
          ...subscription.plan,
          features: JSON.parse(subscription.plan.features || '[]'),
        },
      },
      payment: {
        originalAmount: plan.monthlyPrice,
        discountRate,
        discountAmount,
        finalAmount,
      },
    };
  }

  private async createFreeSubscription(userId: string, planId: string) {
    const now = new Date();
    const periodEnd = new Date('2099-12-31'); // 무기한

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        discountRate: 0,
      },
      include: { plan: true },
    });

    return {
      message: '무료 플랜이 활성화되었습니다',
      subscription,
    };
  }

  // ========== WP9.1: 플랜 업그레이드 ==========

  async upgradeSubscription(userId: string, dto: UpgradeSubscriptionDto) {
    const currentSub = await this.getActiveSubscription(userId);
    if (!currentSub) {
      throw new NotFoundException('활성 구독이 없습니다');
    }

    const newPlan = await this.planService.getPlanByType(dto.newPlanType);

    if (newPlan.monthlyPrice <= currentSub.plan.monthlyPrice) {
      throw new BadRequestException('업그레이드는 더 높은 플랜으로만 가능합니다');
    }

    // 남은 기간 계산 및 차액 계산 (프로레이션)
    const now = new Date();
    const remainingDays = Math.ceil(
      (currentSub.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    const dailyDiff =
      (newPlan.monthlyPrice - currentSub.plan.monthlyPrice) / 30;
    const proratedAmount = Math.floor(dailyDiff * remainingDays);

    // 가족 할인 적용
    const discountRate = await this.calculateFamilyDiscount(userId);
    const discountAmount = Math.floor(proratedAmount * discountRate);
    const finalAmount = proratedAmount - discountAmount;

    // 구독 업데이트
    const updatedSub = await this.prisma.subscription.update({
      where: { id: currentSub.id },
      data: { planId: newPlan.id },
      include: { plan: true },
    });

    // 결제 기록 생성
    if (finalAmount > 0) {
      await this.prisma.payment.create({
        data: {
          subscriptionId: updatedSub.id,
          amount: finalAmount,
          originalAmount: proratedAmount,
          discountAmount,
          status: 'COMPLETED',
          paidAt: now,
        },
      });
    }

    // Premium 상태 업데이트
    await this.updateUserPremiumStatus(userId);

    return {
      message: `${newPlan.name} 플랜으로 업그레이드되었습니다`,
      subscription: updatedSub,
      payment: {
        proratedAmount,
        discountAmount,
        finalAmount,
        remainingDays,
      },
    };
  }

  // ========== WP9.1: 플랜 다운그레이드 ==========

  async downgradeSubscription(userId: string, dto: DowngradeSubscriptionDto) {
    const currentSub = await this.getActiveSubscription(userId);
    if (!currentSub) {
      throw new NotFoundException('활성 구독이 없습니다');
    }

    const newPlan = await this.planService.getPlanByType(dto.newPlanType);

    if (newPlan.monthlyPrice >= currentSub.plan.monthlyPrice) {
      throw new BadRequestException('다운그레이드는 더 낮은 플랜으로만 가능합니다');
    }

    // 현재 기간 종료 후 변경 예약
    await this.prisma.subscription.update({
      where: { id: currentSub.id },
      data: {
        // 메타데이터로 다음 플랜 저장 (실제로는 별도 필드 필요)
        cancelAtPeriodEnd: true,
      },
    });

    // 알림 생성
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'SUBSCRIPTION_DOWNGRADE_SCHEDULED',
        title: '플랜 변경 예약',
        message: `${currentSub.currentPeriodEnd.toLocaleDateString()}부터 ${newPlan.name} 플랜이 적용됩니다.`,
      },
    });

    return {
      message: `다음 결제일부터 ${newPlan.name} 플랜이 적용됩니다`,
      effectiveDate: currentSub.currentPeriodEnd,
      currentPlan: currentSub.plan.name,
      newPlan: newPlan.name,
    };
  }

  // ========== WP9.2: 구독 상태 조회 ==========

  async getMySubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!subscription) {
      return {
        subscription: null,
        message: '구독 정보가 없습니다',
      };
    }

    // 이번 달 사용량 계산
    const usage = await this.getMonthlyUsage(userId, subscription);

    return {
      subscription: {
        ...subscription,
        plan: {
          ...subscription.plan,
          features: JSON.parse(subscription.plan.features || '[]'),
        },
      },
      usage,
    };
  }

  async getSubscriptionHistory(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        subscription: { userId },
      },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        originalAmount: p.originalAmount,
        discountAmount: p.discountAmount,
        status: p.status,
        planName: p.subscription.plan.name,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
    };
  }

  // ========== WP9.2: 구독 취소 ==========

  async cancelSubscription(userId: string, dto: CancelSubscriptionDto) {
    const subscription = await this.getActiveSubscription(userId);
    if (!subscription) {
      throw new NotFoundException('활성 구독이 없습니다');
    }

    if (subscription.plan.type === 'FREE') {
      throw new BadRequestException('무료 플랜은 취소할 수 없습니다');
    }

    if (dto.immediate) {
      // 즉시 취소
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      await this.updateUserPremiumStatus(userId);

      return {
        message: '구독이 즉시 취소되었습니다',
        refundEligible: false, // 환불 정책에 따라
      };
    }

    // 기간 만료 후 취소
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelAtPeriodEnd: true,
      },
    });

    return {
      message: '구독이 취소되었습니다',
      effectiveDate: subscription.currentPeriodEnd,
      note: `${subscription.currentPeriodEnd.toLocaleDateString()}까지 프리미엄 기능을 이용할 수 있습니다`,
    };
  }

  // ========== WP9.2: 구독 재활성화 ==========

  async reactivateSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'CANCELLED',
        currentPeriodEnd: { gt: new Date() },
      },
    });

    if (!subscription) {
      throw new NotFoundException('재활성화 가능한 구독이 없습니다');
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        cancelledAt: null,
        cancelAtPeriodEnd: false,
      },
    });

    await this.updateUserPremiumStatus(userId);

    return {
      message: '구독이 재활성화되었습니다',
    };
  }

  // ========== WP9.3: 가족 할인 ==========

  async calculateFamilyDiscount(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { familyId: true },
    });

    if (!user?.familyId) {
      return 0;
    }

    const childrenCount = await this.prisma.user.count({
      where: {
        familyId: user.familyId,
        role: 'STUDENT',
      },
    });

    if (childrenCount >= 3) {
      return 0.2; // 20%
    } else if (childrenCount >= 2) {
      return 0.1; // 10%
    }

    return 0;
  }

  async getDiscountPreview(userId: string) {
    const discountRate = await this.calculateFamilyDiscount(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { familyId: true },
    });

    let childrenCount = 0;
    if (user?.familyId) {
      childrenCount = await this.prisma.user.count({
        where: {
          familyId: user.familyId,
          role: 'STUDENT',
        },
      });
    }

    return {
      discountRate,
      discountPercent: discountRate * 100,
      childrenCount,
      message:
        discountRate > 0
          ? `자녀 ${childrenCount}명으로 ${discountRate * 100}% 가족 할인이 적용됩니다`
          : '가족 할인 대상이 아닙니다 (자녀 2명 이상 필요)',
    };
  }

  // ========== WP9.4: 프리미엄 기능 체크 ==========

  async checkPremiumAccess(userId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId);
    if (!subscription) return false;

    return ['PREMIUM', 'VIP'].includes(subscription.plan.type);
  }

  async checkConsultationLimit(
    userId: string,
  ): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    const subscription = await this.getActiveSubscription(userId);

    if (!subscription) {
      return { allowed: false, remaining: 0, limit: 0 };
    }

    const limit = subscription.plan.consultLimit;

    // 무제한 (VIP)
    if (limit === null) {
      return { allowed: true, remaining: -1, limit: -1 };
    }

    // 상담 불가 (FREE, BASIC)
    if (limit === 0) {
      return { allowed: false, remaining: 0, limit: 0 };
    }

    // 이번 달 사용량 계산
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usedCount = await this.prisma.consultation.count({
      where: {
        parentId: userId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        createdAt: { gte: startOfMonth },
      },
    });

    const remaining = limit - usedCount;

    return {
      allowed: remaining > 0,
      remaining,
      limit,
    };
  }

  async getFeatures(userId: string) {
    const subscription = await this.getActiveSubscription(userId);

    if (!subscription) {
      return {
        plan: null,
        features: [],
        canConsult: false,
        consultLimit: 0,
        aiLimit: 0,
      };
    }

    return {
      plan: subscription.plan.type,
      features: JSON.parse(subscription.plan.features || '[]'),
      canConsult: ['PREMIUM', 'VIP'].includes(subscription.plan.type),
      consultLimit: subscription.plan.consultLimit,
      aiLimit: subscription.plan.aiLimit,
    };
  }

  async getUsage(userId: string) {
    const subscription = await this.getActiveSubscription(userId);
    if (!subscription) {
      return { message: '구독 정보가 없습니다' };
    }

    return this.getMonthlyUsage(userId, subscription);
  }

  // ========== Webhook 처리 ==========

  async handlePaymentWebhook(dto: PaymentWebhookDto) {
    // 실제 PG 연동 시 서명 검증 필요

    switch (dto.eventType) {
      case WebhookEventType.PAYMENT_APPROVED:
        return this.handlePaymentApproved(dto);
      case WebhookEventType.PAYMENT_FAILED:
        return this.handlePaymentFailed(dto);
      case WebhookEventType.PAYMENT_CANCELLED:
        return this.handlePaymentCancelled(dto);
      default:
        return { message: 'Unknown event type' };
    }
  }

  private async handlePaymentApproved(dto: PaymentWebhookDto) {
    const payment = await this.prisma.payment.findFirst({
      where: { pgPaymentKey: dto.paymentKey },
      include: { subscription: true },
    });

    if (!payment) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다');
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        pgTransactionId: dto.transactionId,
        paidAt: new Date(),
      },
    });

    await this.prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: { status: 'ACTIVE' },
    });

    await this.updateUserPremiumStatus(payment.subscription.userId);

    return { message: '결제가 완료되었습니다' };
  }

  private async handlePaymentFailed(dto: PaymentWebhookDto) {
    const payment = await this.prisma.payment.findFirst({
      where: { pgPaymentKey: dto.paymentKey },
    });

    if (!payment) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다');
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        failReason: dto.failReason,
      },
    });

    return { message: '결제 실패가 처리되었습니다' };
  }

  private async handlePaymentCancelled(dto: PaymentWebhookDto) {
    const payment = await this.prisma.payment.findFirst({
      where: { pgPaymentKey: dto.paymentKey },
    });

    if (!payment) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다');
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CANCELLED',
      },
    });

    return { message: '결제 취소가 처리되었습니다' };
  }

  // ========== 유틸리티 ==========

  async getActiveSubscription(userId: string) {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'TRIAL', 'PAST_DUE'] },
        currentPeriodEnd: { gte: new Date() },
      },
      include: { plan: true },
    });
  }

  private async updateUserPremiumStatus(userId: string) {
    const subscription = await this.getActiveSubscription(userId);
    const hasPremium =
      subscription !== null &&
      ['PREMIUM', 'VIP'].includes(subscription.plan.type);

    await this.prisma.user.update({
      where: { id: userId },
      data: { hasPremium },
    });
  }

  private async getMonthlyUsage(userId: string, subscription: any) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const consultationsUsed = await this.prisma.consultation.count({
      where: {
        parentId: userId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        createdAt: { gte: startOfMonth },
      },
    });

    const aiUsed = await this.prisma.aIOutput.count({
      where: {
        studentId: userId,
        createdAt: { gte: startOfMonth },
      },
    });

    return {
      consultations: {
        used: consultationsUsed,
        limit: subscription.plan.consultLimit,
        unlimited: subscription.plan.consultLimit === null,
      },
      ai: {
        used: aiUsed,
        limit: subscription.plan.aiLimit,
        unlimited: subscription.plan.aiLimit === null,
      },
    };
  }
}











