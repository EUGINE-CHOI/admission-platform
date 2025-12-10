import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PlanService } from './plan.service';
import { QueryPlanDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';
import { Role } from '../../generated/prisma';

@ApiTags('Plan')
@Controller('plans')
export class PlanController {
  constructor(private planService: PlanService) {}

  // WP9.0-1: 플랜 목록 조회 (Public)
  @Get()
  getAllPlans(@Query() query: QueryPlanDto) {
    return this.planService.getAllPlans(query.activeOnly ?? true);
  }

  // WP9.0-3: 플랜 상세 조회 (Public)
  @Get(':planId')
  getPlanById(@Param('planId') planId: string) {
    return this.planService.getPlanById(planId);
  }

  // WP9.0-2: 현재 플랜과 비교하여 조회 (로그인 필요)
  @Get('compare/me')
  @UseGuards(JwtAuthGuard)
  getPlansWithCurrentPlan(@Request() req) {
    return this.planService.getPlansWithCurrentPlan(req.user.id);
  }

  // 개발용: 플랜 시드 데이터 생성
  @Post('seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  seedPlans() {
    return this.planService.seedPlans();
  }
}


