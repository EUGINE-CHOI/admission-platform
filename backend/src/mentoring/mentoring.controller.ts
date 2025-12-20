import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MentoringService } from './mentoring.service';
import {
  CreateMentorDto,
  UpdateMentorDto,
  RequestSessionDto,
  UpdateSessionDto,
  CancelSessionDto,
  CreateReviewDto,
  MentorQueryDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';

@ApiTags('Mentoring')
@Controller('mentoring')
export class MentoringController {
  constructor(private mentoringService: MentoringService) {}

  // ============================================
  // 멘토 관련 API
  // ============================================

  @Get('mentors')
  @ApiOperation({ summary: '멘토 목록 조회', description: '승인된 멘토 목록을 조회합니다' })
  @ApiResponse({ status: 200, description: '멘토 목록' })
  getMentors(@Query() query: MentorQueryDto) {
    return this.mentoringService.getMentors(query);
  }

  @Get('mentors/:mentorId')
  @ApiOperation({ summary: '멘토 상세 조회', description: '멘토의 상세 정보를 조회합니다' })
  @ApiResponse({ status: 200, description: '멘토 상세 정보' })
  getMentorDetail(@Param('mentorId') mentorId: string) {
    return this.mentoringService.getMentorDetail(mentorId);
  }

  @Get('mentors/:mentorId/reviews')
  @ApiOperation({ summary: '멘토 리뷰 조회', description: '멘토의 리뷰 목록을 조회합니다' })
  getMentorReviews(
    @Param('mentorId') mentorId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.mentoringService.getMentorReviews(mentorId, page, limit);
  }

  // ============================================
  // 멘토 프로필 관리 (본인)
  // ============================================

  @Post('mentor/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '멘토 등록 신청', description: '멘토로 등록을 신청합니다' })
  @ApiResponse({ status: 201, description: '멘토 등록 신청 완료' })
  registerMentor(@Request() req, @Body() dto: CreateMentorDto) {
    return this.mentoringService.registerMentor(req.user.id, dto);
  }

  @Get('mentor/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '내 멘토 프로필 조회', description: '나의 멘토 프로필을 조회합니다' })
  getMyMentorProfile(@Request() req) {
    return this.mentoringService.getMyMentorProfile(req.user.id);
  }

  @Patch('mentor/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '멘토 프로필 수정', description: '나의 멘토 프로필을 수정합니다' })
  updateMentor(@Request() req, @Body() dto: UpdateMentorDto) {
    return this.mentoringService.updateMentor(req.user.id, dto);
  }

  @Get('mentor/sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '멘토 세션 목록', description: '멘토로서 받은 세션 목록을 조회합니다' })
  getMentorSessions(@Request() req) {
    return this.mentoringService.getMentorSessions(req.user.id);
  }

  // ============================================
  // 세션 관리
  // ============================================

  @Post('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '멘토링 신청', description: '멘토에게 멘토링을 신청합니다' })
  @ApiResponse({ status: 201, description: '멘토링 신청 완료' })
  requestSession(@Request() req, @Body() dto: RequestSessionDto) {
    return this.mentoringService.requestSession(req.user.id, dto);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '내 세션 목록', description: '멘티로서 신청한 세션 목록을 조회합니다' })
  getMySessions(@Request() req) {
    return this.mentoringService.getMySessions(req.user.id);
  }

  @Patch('sessions/:sessionId/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '세션 확정 (멘토)', description: '멘토가 세션을 확정합니다' })
  confirmSession(@Request() req, @Param('sessionId') sessionId: string) {
    return this.mentoringService.confirmSession(req.user.id, sessionId);
  }

  @Patch('sessions/:sessionId/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '세션 완료 (멘토)', description: '멘토가 세션을 완료 처리합니다' })
  completeSession(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.mentoringService.completeSession(req.user.id, sessionId, dto);
  }

  @Patch('sessions/:sessionId/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '세션 취소', description: '세션을 취소합니다' })
  cancelSession(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() dto: CancelSessionDto,
  ) {
    return this.mentoringService.cancelSession(req.user.id, sessionId, dto);
  }

  // ============================================
  // 리뷰 관리
  // ============================================

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '리뷰 작성', description: '완료된 세션에 리뷰를 작성합니다' })
  @ApiResponse({ status: 201, description: '리뷰 작성 완료' })
  createReview(@Request() req, @Body() dto: CreateReviewDto) {
    return this.mentoringService.createReview(req.user.id, dto);
  }

  // ============================================
  // 관리자 기능
  // ============================================

  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '승인 대기 멘토 목록 (관리자)', description: '승인 대기 중인 멘토 목록' })
  getPendingMentors() {
    return this.mentoringService.getPendingMentors();
  }

  @Patch('admin/mentors/:mentorId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '멘토 승인 (관리자)', description: '멘토를 승인합니다' })
  approveMentor(@Param('mentorId') mentorId: string) {
    return this.mentoringService.approveMentor(mentorId);
  }

  @Patch('admin/mentors/:mentorId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '멘토 거절 (관리자)', description: '멘토 신청을 거절합니다' })
  rejectMentor(@Param('mentorId') mentorId: string) {
    return this.mentoringService.rejectMentor(mentorId);
  }
}

