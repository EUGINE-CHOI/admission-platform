import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
  GenerateRecordSentenceDto,
  GenerateClubRecommendationDto,
  GenerateSubjectAdviceDto,
  GenerateReadingRecommendationDto,
  GenerateReadingGuideDto,
  GenerateActionPlanDto,
  CreateFeedbackDto,
  UpdateFeedbackDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';
import { Role, ActionPlanStatus } from '../../generated/prisma';

@ApiTags('AI')
@ApiBearerAuth('access-token')
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  // ========== WP5.1: AI Health Check ==========
  @Get('health')
  checkHealth() {
    return this.aiService.checkHealth();
  }

  // ========== WP5.2: 생기부 문장 생성 ==========
  @Post('record-sentence')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  generateRecordSentence(@Request() req, @Body() dto: GenerateRecordSentenceDto) {
    return this.aiService.generateRecordSentence(req.user.id, dto);
  }

  @Post('record-sentence/:activityId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  generateRecordSentenceForActivity(
    @Request() req,
    @Param('activityId') activityId: string,
  ) {
    return this.aiService.generateRecordSentence(req.user.id, { activityId });
  }

  @Get('record-sentence/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getRecordSentenceHistory(@Request() req, @Query('limit') limit?: number) {
    return this.aiService.getRecordSentenceHistory(
      req.user.id,
      limit ? Number(limit) : 10,
    );
  }

  // ========== WP5.3: 동아리/교과/독서 조언 ==========
  @Post('recommend/club')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  generateClubRecommendation(
    @Request() req,
    @Body() dto: GenerateClubRecommendationDto,
  ) {
    return this.aiService.generateClubRecommendation(req.user.id, dto);
  }

  @Post('advice/subject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  generateSubjectAdvice(@Request() req, @Body() dto: GenerateSubjectAdviceDto) {
    return this.aiService.generateSubjectAdvice(req.user.id, dto);
  }

  @Post('recommend/reading')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  generateReadingRecommendation(
    @Request() req,
    @Body() dto: GenerateReadingRecommendationDto,
  ) {
    return this.aiService.generateReadingRecommendation(req.user.id, dto);
  }

  @Post('guide/reading')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  generateReadingGuide(@Request() req, @Body() dto: GenerateReadingGuideDto) {
    return this.aiService.generateReadingGuide(req.user.id, dto);
  }

  // ========== WP5.4: 액션 플랜 ==========
  @Post('action-plan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  generateActionPlan(@Request() req, @Body() dto: GenerateActionPlanDto) {
    return this.aiService.generateActionPlan(req.user.id, dto);
  }

  @Get('action-plan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getActionPlans(@Request() req, @Query('status') status?: string) {
    return this.aiService.getActionPlans(
      req.user.id,
      status as ActionPlanStatus,
    );
  }

  @Get('action-plan/:planId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getActionPlanDetail(@Request() req, @Param('planId') planId: string) {
    return this.aiService.getActionPlanDetail(req.user.id, planId);
  }

  @Get('action-plan/:planId/week/:weekNum')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getWeeklyTasks(
    @Request() req,
    @Param('planId') planId: string,
    @Param('weekNum') weekNum: string,
  ) {
    return this.aiService.getWeeklyTasks(req.user.id, planId, Number(weekNum));
  }

  @Get('children/:childId/action-plan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARENT)
  getChildActionPlans(@Request() req, @Param('childId') childId: string) {
    return this.aiService.getChildActionPlans(req.user.id, childId);
  }

  // ========== WP5.5: 피드백 ==========
  @Post('output/:outputId/feedback')
  @UseGuards(JwtAuthGuard)
  createFeedback(
    @Request() req,
    @Param('outputId') outputId: string,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.aiService.createFeedback(req.user.id, outputId, dto);
  }

  @Patch('output/:outputId/feedback')
  @UseGuards(JwtAuthGuard)
  updateFeedback(
    @Request() req,
    @Param('outputId') outputId: string,
    @Body() dto: UpdateFeedbackDto,
  ) {
    return this.aiService.updateFeedback(req.user.id, outputId, dto);
  }

  @Get('feedback/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getFeedbackStats() {
    return this.aiService.getFeedbackStats();
  }
}



