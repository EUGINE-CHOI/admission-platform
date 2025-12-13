import { Controller, Get, Query, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NewsService } from './news.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Role } from '../../generated/prisma';

@ApiTags('News')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @Roles(Role.STUDENT, Role.PARENT, Role.CONSULTANT, Role.ADMIN)
  @ApiOperation({ summary: '특목고 관련 최신 뉴스 조회' })
  @ApiQuery({ name: 'keyword', required: false, description: '키워드 필터 (외고, 자사고, 과학고, 영재고)' })
  async getNews(@Query('keyword') keyword?: string) {
    const news = await this.newsService.getNews(keyword);
    return {
      success: true,
      count: news.length,
      keywords: this.newsService.getKeywords(),
      news,
    };
  }

  @Get('keywords')
  @Roles(Role.STUDENT, Role.PARENT, Role.CONSULTANT, Role.ADMIN)
  @ApiOperation({ summary: '뉴스 키워드 목록 조회' })
  async getKeywords() {
    return {
      keywords: this.newsService.getKeywords(),
    };
  }

  @Post('refresh')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '뉴스 캐시 새로고침 (관리자)' })
  async refreshNews() {
    return this.newsService.refreshNews();
  }
}

