import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { QnaService, CreateQuestionDto, CreateAnswerDto } from './qna.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { QuestionCategory, Role } from '../../generated/prisma';

@ApiTags('Q&A 커뮤니티')
@Controller('v1/qna')
export class QnaController {
  constructor(private qnaService: QnaService) {}

  // 질문 목록 조회 (공개)
  @Get('questions')
  @ApiOperation({ summary: '질문 목록 조회' })
  @ApiQuery({ name: 'category', required: false, enum: QuestionCategory })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getQuestions(
    @Query('category') category?: QuestionCategory,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.qnaService.getQuestions({
      category,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  // 질문 상세 조회 (공개)
  @Get('questions/:questionId')
  @ApiOperation({ summary: '질문 상세 조회' })
  async getQuestion(@Param('questionId') questionId: string) {
    return this.qnaService.getQuestion(questionId);
  }

  // 내 질문 목록 (로그인된 사용자용)
  @Get('questions/detail/:questionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '질문 상세 조회 (좋아요 여부 포함)' })
  async getQuestionWithUser(
    @Request() req,
    @Param('questionId') questionId: string,
  ) {
    return this.qnaService.getQuestion(questionId, req.user.id);
  }

  // 질문 작성
  @Post('questions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '질문 작성' })
  async createQuestion(@Request() req, @Body() dto: CreateQuestionDto) {
    return this.qnaService.createQuestion(req.user.id, dto);
  }

  // 질문 수정
  @Put('questions/:questionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '질문 수정' })
  async updateQuestion(
    @Request() req,
    @Param('questionId') questionId: string,
    @Body() dto: Partial<CreateQuestionDto>,
  ) {
    return this.qnaService.updateQuestion(req.user.id, questionId, dto);
  }

  // 질문 삭제
  @Delete('questions/:questionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '질문 삭제' })
  async deleteQuestion(@Request() req, @Param('questionId') questionId: string) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.qnaService.deleteQuestion(req.user.id, questionId, isAdmin);
  }

  // 답변 작성
  @Post('questions/:questionId/answers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '답변 작성' })
  async createAnswer(
    @Request() req,
    @Param('questionId') questionId: string,
    @Body() dto: CreateAnswerDto,
  ) {
    return this.qnaService.createAnswer(req.user.id, questionId, dto);
  }

  // 답변 채택
  @Post('questions/:questionId/answers/:answerId/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '답변 채택' })
  async acceptAnswer(
    @Request() req,
    @Param('questionId') questionId: string,
    @Param('answerId') answerId: string,
  ) {
    return this.qnaService.acceptAnswer(req.user.id, questionId, answerId);
  }

  // 답변 삭제
  @Delete('answers/:answerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '답변 삭제' })
  async deleteAnswer(@Request() req, @Param('answerId') answerId: string) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.qnaService.deleteAnswer(req.user.id, answerId, isAdmin);
  }

  // 질문 좋아요
  @Post('questions/:questionId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '질문 좋아요/취소' })
  async likeQuestion(@Request() req, @Param('questionId') questionId: string) {
    return this.qnaService.likeQuestion(req.user.id, questionId);
  }

  // 답변 좋아요
  @Post('answers/:answerId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '답변 좋아요/취소' })
  async likeAnswer(@Request() req, @Param('answerId') answerId: string) {
    return this.qnaService.likeAnswer(req.user.id, answerId);
  }

  // 카테고리 목록
  @Get('categories')
  @ApiOperation({ summary: '카테고리 목록' })
  getCategories() {
    return this.qnaService.getCategories();
  }
}

