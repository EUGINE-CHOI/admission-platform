import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import {
  CreateSubscriptionDto,
  UpgradeSubscriptionDto,
  DowngradeSubscriptionDto,
  CancelSubscriptionDto,
  PaymentWebhookDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';
import { Role } from '../../generated/prisma';

@ApiTags('Subscription')
@ApiBearerAuth('access-token')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  // ========== WP9.1: 구독 시작 ==========

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARENT)
  createSubscription(@Request() req, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.createSubscription(req.user.id, dto);
  }

  @Post('upgrade')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARENT)
  upgradeSubscription(@Request() req, @Body() dto: UpgradeSubscriptionDto) {
    return this.subscriptionService.upgradeSubscription(req.user.id, dto);
  }

  @Post('downgrade')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARENT)
  downgradeSubscription(@Request() req, @Body() dto: DowngradeSubscriptionDto) {
    return this.subscriptionService.downgradeSubscription(req.user.id, dto);
  }

  // ========== WP9.2: 구독 관리 ==========

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMySubscription(@Request() req) {
    return this.subscriptionService.getMySubscription(req.user.id);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  getSubscriptionHistory(@Request() req) {
    return this.subscriptionService.getSubscriptionHistory(req.user.id);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARENT)
  cancelSubscription(@Request() req, @Body() dto: CancelSubscriptionDto) {
    return this.subscriptionService.cancelSubscription(req.user.id, dto);
  }

  @Post('reactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARENT)
  reactivateSubscription(@Request() req) {
    return this.subscriptionService.reactivateSubscription(req.user.id);
  }

  // ========== WP9.3: 가족 할인 ==========

  @Get('discount-preview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARENT)
  getDiscountPreview(@Request() req) {
    return this.subscriptionService.getDiscountPreview(req.user.id);
  }

  // ========== WP9.4: 프리미엄 기능 ==========

  @Get('features')
  @UseGuards(JwtAuthGuard)
  getFeatures(@Request() req) {
    return this.subscriptionService.getFeatures(req.user.id);
  }

  @Get('usage')
  @UseGuards(JwtAuthGuard)
  getUsage(@Request() req) {
    return this.subscriptionService.getUsage(req.user.id);
  }
}

// Webhook 컨트롤러 (별도)
@Controller('payments')
export class PaymentWebhookController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Post('webhook')
  handleWebhook(@Body() dto: PaymentWebhookDto) {
    return this.subscriptionService.handlePaymentWebhook(dto);
  }
}


