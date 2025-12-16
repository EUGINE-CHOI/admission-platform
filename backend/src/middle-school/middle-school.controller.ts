import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { MiddleSchoolService } from './middle-school.service';

@ApiTags('중학교 (Middle Schools)')
@Controller('middle-schools')
export class MiddleSchoolController {
  constructor(private readonly middleSchoolService: MiddleSchoolService) {}

  @Get('search')
  @ApiOperation({ summary: '중학교 검색' })
  @ApiQuery({ name: 'query', required: false, description: '학교명 검색어' })
  @ApiQuery({ name: 'region', required: false, description: '지역 (서울, 인천 등)' })
  async searchSchools(
    @Query('query') query?: string,
    @Query('region') region?: string,
  ) {
    return this.middleSchoolService.searchSchools(query || '', region);
  }

  @Get('regions')
  @ApiOperation({ summary: '사용 가능한 지역 목록 조회' })
  async getRegions() {
    return this.middleSchoolService.getRegions();
  }

  @Get('regions/:region')
  @ApiOperation({ summary: '지역별 중학교 목록 조회' })
  @ApiParam({ name: 'region', description: '지역 (서울, 인천 등)' })
  async getSchoolsByRegion(@Param('region') region: string) {
    return this.middleSchoolService.getSchoolsByRegion(region);
  }

  @Get('regions/:region/districts')
  @ApiOperation({ summary: '특정 지역의 구/군 목록 조회' })
  @ApiParam({ name: 'region', description: '지역 (서울, 인천 등)' })
  async getDistrictsByRegion(@Param('region') region: string) {
    return this.middleSchoolService.getDistrictsByRegion(region);
  }

  @Get('stats')
  @ApiOperation({ summary: '중학교 통계 조회' })
  async getStats() {
    return this.middleSchoolService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '중학교 상세 정보 조회' })
  @ApiParam({ name: 'id', description: '중학교 ID' })
  async getSchoolById(@Param('id') id: string) {
    return this.middleSchoolService.getSchoolById(id);
  }
}



