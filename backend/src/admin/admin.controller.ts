import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { StatsService } from './services/stats.service';
import { KpiService } from './services/kpi.service';
import { AiQualityService } from './services/ai-quality.service';
import { QueryPeriodDto, QueryAgentDto } from './dto';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly statsService: StatsService,
    private readonly kpiService: KpiService,
    private readonly aiQualityService: AiQualityService,
  ) {}

  // ============================================
  // WP10.0: Health Check
  // ============================================

  @Get('health')
  async getHealth() {
    const uptime = process.uptime();
    
    return {
      status: 'ok',
      uptime: Math.round(uptime),
      timestamp: new Date().toISOString(),
      database: 'connected',
      sentry: process.env.SENTRY_DSN ? 'enabled' : 'disabled',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  // ============================================
  // WP10.1: 운영 통계 대시보드
  // ============================================

  @Get('stats/overview')
  async getStatsOverview(@Query() query: QueryPeriodDto) {
    return this.statsService.getOverview(query);
  }

  @Get('stats/users')
  async getUserStats(@Query() query: QueryPeriodDto) {
    return this.statsService.getUserStats(query);
  }

  @Get('stats/events')
  async getEventStats(@Query() query: QueryPeriodDto) {
    return this.statsService.getEventStats(query);
  }

  // ============================================
  // WP10.2: KPI 대시보드
  // ============================================

  @Get('kpi')
  async getKpiOverview(@Query() query: QueryPeriodDto) {
    return this.kpiService.getKpiOverview(query);
  }

  @Get('kpi/activity-rate')
  async getActivityRate(@Query() query: QueryPeriodDto) {
    return this.kpiService.getActivityRate(query);
  }

  @Get('kpi/diagnosis-rate')
  async getDiagnosisRate(@Query() query: QueryPeriodDto) {
    return this.kpiService.getDiagnosisRate(query);
  }

  @Get('kpi/conversion-rate')
  async getConversionRate(@Query() query: QueryPeriodDto) {
    return this.kpiService.getConversionRate(query);
  }

  @Get('kpi/task-rate')
  async getTaskRate(@Query() query: QueryPeriodDto) {
    return this.kpiService.getTaskRate(query);
  }

  // ============================================
  // WP10.3: AI 품질 분석
  // ============================================

  @Get('ai/quality')
  async getAiQuality(@Query() query: QueryPeriodDto) {
    return this.aiQualityService.getQualityOverview(query);
  }

  @Get('ai/feedback-stats')
  async getFeedbackStats(@Query() query: QueryPeriodDto) {
    return this.aiQualityService.getFeedbackStats(query);
  }

  @Get('ai/agents')
  async getAgentPerformance(@Query() query: QueryPeriodDto) {
    return this.aiQualityService.getAgentPerformance(query);
  }

  @Get('ai/quality/edit-patterns')
  async getEditPatterns(@Query() query: QueryAgentDto) {
    return this.aiQualityService.getEditPatterns(query);
  }
}

