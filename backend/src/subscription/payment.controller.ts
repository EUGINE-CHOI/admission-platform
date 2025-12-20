import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TossPaymentService } from './toss-payment.service';
import { SubscriptionService } from './subscription.service';
import { PlanService } from '../plan/plan.service';
import { JwtAuthGuard } from '../auth/guards';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Payment')
@ApiBearerAuth('access-token')
@Controller('payment')
export class PaymentController {
  constructor(
    private tossPaymentService: TossPaymentService,
    private subscriptionService: SubscriptionService,
    private planService: PlanService,
    private prisma: PrismaService,
  ) {}

  @Get('client-key')
  @ApiOperation({ summary: '토스페이먼츠 클라이언트 키 조회' })
  getClientKey() {
    return {
      clientKey: this.tossPaymentService.getClientKey(),
      environment: 'test', // 테스트 환경임을 명시
    };
  }

  @Post('prepare')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '결제 준비' })
  async preparePayment(
    @Request() req,
    @Body() dto: { planType: string },
  ) {
    const userId = req.user.id;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const plan = await this.planService.getPlanByType(dto.planType as any);

    // 가족 할인 계산
    const discountRate = await this.subscriptionService.calculateFamilyDiscount(userId);
    const discountAmount = Math.floor(plan.monthlyPrice * discountRate);
    const finalAmount = plan.monthlyPrice - discountAmount;

    const orderId = `order_${userId.slice(0, 8)}_${Date.now()}`;

    // 결제 준비 정보 저장
    await this.prisma.payment.create({
      data: {
        subscription: {
          create: {
            userId,
            planId: plan.id,
            status: 'PENDING',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            discountRate,
          },
        },
        amount: finalAmount,
        originalAmount: plan.monthlyPrice,
        discountAmount,
        status: 'PENDING',
        pgOrderId: orderId,
      },
    });

    const paymentInfo = await this.tossPaymentService.preparePayment({
      orderId,
      amount: finalAmount,
      orderName: `${plan.name} 구독`,
      customerName: user?.name || '고객',
      customerEmail: user?.email,
      successUrl: `${process.env.FRONTEND_URL || 'http://localhost:4000'}/payment/success`,
      failUrl: `${process.env.FRONTEND_URL || 'http://localhost:4000'}/payment/fail`,
    });

    return {
      ...paymentInfo,
      plan: {
        name: plan.name,
        type: plan.type,
        originalPrice: plan.monthlyPrice,
        discountRate,
        discountAmount,
        finalAmount,
      },
    };
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '결제 승인' })
  async confirmPayment(
    @Request() req,
    @Body() dto: { paymentKey: string; orderId: string; amount: number },
  ) {
    const userId = req.user.id;

    // 결제 승인 요청
    const result = await this.tossPaymentService.confirmPayment(dto);

    // 결제 정보 업데이트
    const payment = await this.prisma.payment.findFirst({
      where: { pgOrderId: dto.orderId },
      include: { subscription: true },
    });

    if (!payment) {
      throw new Error('결제 정보를 찾을 수 없습니다');
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        pgPaymentKey: dto.paymentKey,
        pgTransactionId: result.payment.transactionKey,
        paidAt: new Date(),
      },
    });

    // 구독 활성화
    await this.prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: { status: 'ACTIVE' },
    });

    // 사용자 프리미엄 상태 업데이트
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: payment.subscriptionId },
      include: { plan: true },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hasPremium: ['PREMIUM', 'VIP'].includes(subscription?.plan.type || ''),
      },
    });

    return {
      success: true,
      message: '결제가 완료되었습니다',
      subscription: {
        planName: subscription?.plan.name,
        planType: subscription?.plan.type,
        periodEnd: subscription?.currentPeriodEnd,
      },
    };
  }

  @Get('success')
  @ApiOperation({ summary: '결제 성공 콜백 (리다이렉트용)' })
  async paymentSuccess(
    @Query('paymentKey') paymentKey: string,
    @Query('orderId') orderId: string,
    @Query('amount') amount: string,
  ) {
    return {
      paymentKey,
      orderId,
      amount: parseInt(amount),
      message: '결제 정보가 전달되었습니다. 클라이언트에서 confirm API를 호출해주세요.',
    };
  }

  @Get('fail')
  @ApiOperation({ summary: '결제 실패 콜백' })
  async paymentFail(
    @Query('code') code: string,
    @Query('message') message: string,
    @Query('orderId') orderId: string,
  ) {
    // 결제 실패 처리
    if (orderId) {
      await this.prisma.payment.updateMany({
        where: { pgOrderId: orderId },
        data: {
          status: 'FAILED',
          failReason: `${code}: ${message}`,
        },
      });
    }

    return {
      success: false,
      code,
      message,
      orderId,
    };
  }
}







