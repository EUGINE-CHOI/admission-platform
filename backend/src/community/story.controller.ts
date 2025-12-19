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
import { StoryService, CreateStoryDto, CreateCommentDto } from './story.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { StoryCategory, Role } from '../../generated/prisma';

@ApiTags('합격생 후기')
@Controller('v1/stories')
export class StoryController {
  constructor(private storyService: StoryService) {}

  // 후기 목록 조회 (공개)
  @Get()
  @ApiOperation({ summary: '후기 목록 조회' })
  @ApiQuery({ name: 'category', required: false, enum: StoryCategory })
  @ApiQuery({ name: 'schoolId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getStories(
    @Query('category') category?: StoryCategory,
    @Query('schoolId') schoolId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.storyService.getStories({
      category,
      schoolId,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  // 인기 후기
  @Get('popular')
  @ApiOperation({ summary: '인기 후기 조회' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPopularStories(@Query('limit') limit?: string) {
    return this.storyService.getPopularStories(limit ? parseInt(limit) : 5);
  }

  // 후기 상세 조회 (공개)
  @Get(':storyId')
  @ApiOperation({ summary: '후기 상세 조회' })
  async getStory(@Param('storyId') storyId: string) {
    return this.storyService.getStory(storyId);
  }

  // 후기 상세 조회 (로그인된 사용자용)
  @Get('detail/:storyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '후기 상세 조회 (좋아요 여부 포함)' })
  async getStoryWithUser(@Request() req, @Param('storyId') storyId: string) {
    return this.storyService.getStory(storyId, req.user.id);
  }

  // 후기 작성
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '후기 작성' })
  async createStory(@Request() req, @Body() dto: CreateStoryDto) {
    return this.storyService.createStory(req.user.id, dto);
  }

  // 후기 수정
  @Put(':storyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '후기 수정' })
  async updateStory(
    @Request() req,
    @Param('storyId') storyId: string,
    @Body() dto: Partial<CreateStoryDto>,
  ) {
    return this.storyService.updateStory(req.user.id, storyId, dto);
  }

  // 후기 삭제
  @Delete(':storyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '후기 삭제' })
  async deleteStory(@Request() req, @Param('storyId') storyId: string) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.storyService.deleteStory(req.user.id, storyId, isAdmin);
  }

  // 후기 인증 (관리자)
  @Post(':storyId/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '후기 인증 (관리자)' })
  async verifyStory(
    @Param('storyId') storyId: string,
    @Body() body: { isVerified: boolean },
  ) {
    return this.storyService.verifyStory(storyId, body.isVerified);
  }

  // 댓글 작성
  @Post(':storyId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 작성' })
  async createComment(
    @Request() req,
    @Param('storyId') storyId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.storyService.createComment(req.user.id, storyId, dto);
  }

  // 댓글 삭제
  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 삭제' })
  async deleteComment(@Request() req, @Param('commentId') commentId: string) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.storyService.deleteComment(req.user.id, commentId, isAdmin);
  }

  // 후기 좋아요
  @Post(':storyId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '후기 좋아요/취소' })
  async likeStory(@Request() req, @Param('storyId') storyId: string) {
    return this.storyService.likeStory(req.user.id, storyId);
  }

  // 학교별 후기 통계
  @Get('school/:schoolId/stats')
  @ApiOperation({ summary: '학교별 후기 통계' })
  async getSchoolStoryStats(@Param('schoolId') schoolId: string) {
    return this.storyService.getSchoolStoryStats(schoolId);
  }

  // 카테고리 목록
  @Get('meta/categories')
  @ApiOperation({ summary: '카테고리 목록' })
  getCategories() {
    return this.storyService.getCategories();
  }
}

