import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PersonalStatementService, GenerateDraftDto, ReviewRequestDto } from './personal-statement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Role } from '../../generated/prisma';

@ApiTags('AI 자기소개서')
@Controller('v1/ai/personal-statement')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PersonalStatementController {
  constructor(private personalStatementService: PersonalStatementService) {}

  // 자기소개서 초안 생성
  @Post('draft')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '자기소개서 초안 생성' })
  async generateDraft(@Request() req, @Body() dto: GenerateDraftDto) {
    return this.personalStatementService.generateDraft(req.user.id, dto);
  }

  // 자기소개서 첨삭/리뷰
  @Post('review')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '자기소개서 첨삭' })
  async reviewStatement(@Request() req, @Body() dto: ReviewRequestDto) {
    return this.personalStatementService.reviewStatement(req.user.id, dto);
  }

  // 학교별 템플릿 조회
  @Get('template/:schoolId')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '학교별 자기소개서 템플릿' })
  async getSchoolTemplate(@Param('schoolId') schoolId: string) {
    return this.personalStatementService.getSchoolTemplate(schoolId);
  }

  // 저장된 자기소개서 목록
  @Get('saved')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '저장된 자기소개서 목록' })
  async getSavedStatements(@Request() req) {
    return this.personalStatementService.getSavedStatements(req.user.id);
  }

  // 주제 추천
  @Get('suggest-topics')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '자기소개서 주제 추천' })
  async suggestTopics(@Request() req) {
    return this.personalStatementService.suggestTopics(req.user.id);
  }
}

