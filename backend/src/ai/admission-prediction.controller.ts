import { Controller, Get, Post, Query, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdmissionPredictionService } from './admission-prediction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Role } from '../../generated/prisma';

@ApiTags('합격 예측 AI')
@Controller('v1/ai/prediction')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdmissionPredictionController {
  constructor(private predictionService: AdmissionPredictionService) {}

  // 단일 학교 합격 예측
  @Get('school/:schoolId')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '특정 학교 합격 예측' })
  async predictForSchool(@Request() req, @Param('schoolId') schoolId: string) {
    return this.predictionService.predictForSchool(req.user.id, schoolId);
  }

  // 목표 학교들 일괄 예측
  @Get('targets')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '목표 학교들 합격 예측' })
  async predictForTargetSchools(@Request() req) {
    return this.predictionService.predictForTargetSchools(req.user.id);
  }

  // AI 기반 학교 추천
  @Get('recommend')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'AI 기반 학교 추천' })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async recommendSchools(
    @Request() req,
    @Query('region') region?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    return this.predictionService.recommendSchools(req.user.id, {
      region,
      type,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  // 종합 분석
  @Get('analysis')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '종합 입시 분석' })
  async getComprehensiveAnalysis(@Request() req) {
    return this.predictionService.getComprehensiveAnalysis(req.user.id);
  }
}




