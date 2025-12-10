import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DiagnosisService } from './diagnosis.service';
import { AddTargetSchoolDto, UpdatePriorityDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';
import { Role } from '../../generated/prisma';

@ApiTags('Diagnosis')
@ApiBearerAuth('access-token')
@Controller('diagnosis')
@UseGuards(JwtAuthGuard)
export class DiagnosisController {
  constructor(private diagnosisService: DiagnosisService) {}

  // ========== 목표 학교 관리 (WP4.0) ==========
  @Post('target-schools')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  addTargetSchool(@Request() req, @Body() dto: AddTargetSchoolDto) {
    return this.diagnosisService.addTargetSchool(req.user.id, dto);
  }

  @Delete('target-schools/:schoolId')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  removeTargetSchool(@Request() req, @Param('schoolId') schoolId: string) {
    return this.diagnosisService.removeTargetSchool(req.user.id, schoolId);
  }

  @Get('target-schools')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  getTargetSchools(@Request() req) {
    return this.diagnosisService.getTargetSchools(req.user.id);
  }

  @Patch('target-schools/:schoolId/priority')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  updatePriority(
    @Request() req,
    @Param('schoolId') schoolId: string,
    @Body() dto: UpdatePriorityDto,
  ) {
    return this.diagnosisService.updatePriority(req.user.id, schoolId, dto);
  }

  // ========== 진단 실행 (WP4.1) ==========
  @Post('run')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  runDiagnosis(@Request() req) {
    return this.diagnosisService.runDiagnosis(req.user.id);
  }

  // ========== 추천 학교 (WP4.3) ==========
  @Get('recommendations')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  getRecommendations(@Request() req, @Query('region') region?: string) {
    return this.diagnosisService.getRecommendations(req.user.id, region);
  }

  // ========== 진단 결과 조회 (WP4.4) ==========
  @Get('results')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  getDiagnosisHistory(@Request() req, @Query('limit') limit?: number) {
    return this.diagnosisService.getDiagnosisHistory(
      req.user.id,
      limit ? Number(limit) : 10,
    );
  }

  @Get('results/latest')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  getLatestResult(@Request() req) {
    return this.diagnosisService.getLatestResult(req.user.id);
  }

  @Get('results/:schoolId')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  getSchoolDiagnosisResult(
    @Request() req,
    @Param('schoolId') schoolId: string,
  ) {
    return this.diagnosisService.getSchoolDiagnosisResult(
      req.user.id,
      schoolId,
    );
  }

  // ========== 학부모용 ==========
  @Get('children/:childId/results')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  getChildDiagnosisResults(
    @Request() req,
    @Param('childId') childId: string,
  ) {
    return this.diagnosisService.getChildDiagnosisResults(req.user.id, childId);
  }

  @Get('children/:childId/recommendations')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  getChildRecommendations(@Request() req, @Param('childId') childId: string) {
    return this.diagnosisService.getChildRecommendations(req.user.id, childId);
  }
}



