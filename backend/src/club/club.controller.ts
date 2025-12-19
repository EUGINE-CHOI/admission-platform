import { Controller, Get, Post, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ClubService } from './club.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('동아리')
@Controller('clubs')
export class ClubController {
  constructor(private clubService: ClubService) {}

  @Get()
  @ApiOperation({ summary: '동아리 검색' })
  @ApiQuery({ name: 'keyword', required: false, description: '검색어' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'schoolId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchClubs(
    @Query('keyword') keyword?: string,
    @Query('category') category?: string,
    @Query('schoolId') schoolId?: string,
    @Query('limit') limit?: string,
  ) {
    const clubs = await this.clubService.searchClubs({
      keyword,
      category,
      schoolId,
      limit: limit ? parseInt(limit) : undefined,
    });

    return {
      clubs,
      count: clubs.length,
    };
  }

  @Get('active')
  @ApiOperation({ summary: '활성 동아리 목록' })
  async getActiveClubs() {
    const clubs = await this.clubService.getActiveClubs();
    return {
      clubs,
      count: clubs.length,
    };
  }

  @Get('categories')
  @ApiOperation({ summary: '카테고리 목록' })
  async getCategories() {
    const categories = await this.clubService.getCategories();
    return { categories };
  }

  @Get('category/:category')
  @ApiOperation({ summary: '카테고리별 동아리 조회' })
  async getClubsByCategory(@Param('category') category: string) {
    const clubs = await this.clubService.getClubsByCategory(category);
    return {
      clubs,
      count: clubs.length,
    };
  }

  @Get('school/:schoolId')
  @ApiOperation({ summary: '특정 학교의 동아리 조회' })
  async getSchoolClubs(@Param('schoolId') schoolId: string) {
    const clubs = await this.clubService.getSchoolClubs(schoolId);
    return {
      clubs,
      count: clubs.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '동아리 상세 조회' })
  async getClubById(@Param('id') id: string) {
    return this.clubService.getClubById(id);
  }

  @Post('recommend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '카테고리 기반 동아리 추천' })
  async recommendClubs(@Body() body: { category?: string; limit?: number }) {
    const clubs = await this.clubService.recommendClubs(body.category, body.limit);
    return {
      clubs,
      count: clubs.length,
    };
  }
}
