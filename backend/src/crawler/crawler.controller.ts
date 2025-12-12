import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Role, PublishStatus, SchoolType } from '@prisma/client';
import { CrawlerService, CrawlResult, CrawlJob } from './crawler.service';
import { SchedulerService, ScheduledTask } from './services/scheduler.service';
import { RealSchoolCrawlerService, CrawledAdmissionInfo } from './services/real-school-crawler.service';
import { ClubCrawlerService, ClubCrawlResult } from './services/club-crawler.service';
import { SeoulOpenDataService, ClubInfo } from './services/seoul-opendata.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('크롤러 관리')
@Controller('admin/crawler')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CrawlerController {
  constructor(
    private crawlerService: CrawlerService,
    private schedulerService: SchedulerService,
    private realCrawlerService: RealSchoolCrawlerService,
    private clubCrawlerService: ClubCrawlerService,
    private seoulOpenDataService: SeoulOpenDataService,
    private prisma: PrismaService,
  ) {}

  // ==================== 수동 크롤링 ====================

  @Post('schools')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '학교 정보 크롤링 실행' })
  @ApiQuery({ name: 'source', required: false, description: '크롤링 소스 (sample, schoolinfo, hischool)' })
  async crawlSchools(
    @Query('source') source: string = 'sample',
  ): Promise<CrawlResult> {
    return this.crawlerService.crawlSchools(source);
  }

  @Post('admissions')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '입시 전형 크롤링 실행' })
  @ApiQuery({ name: 'source', required: false, description: '크롤링 소스' })
  async crawlAdmissions(
    @Query('source') source: string = 'sample',
  ): Promise<CrawlResult> {
    return this.crawlerService.crawlAdmissions(source);
  }

  @Post('schedules')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '입시 일정 크롤링 실행' })
  @ApiQuery({ name: 'source', required: false, description: '크롤링 소스' })
  async crawlSchedules(
    @Query('source') source: string = 'sample',
  ): Promise<CrawlResult> {
    return this.crawlerService.crawlSchedules(source);
  }

  @Post('all')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '전체 크롤링 실행 (학교 + 전형 + 일정)' })
  @ApiQuery({ name: 'source', required: false })
  async crawlAll(@Query('source') source: string = 'sample'): Promise<{
    schools: CrawlResult;
    admissions: CrawlResult;
    schedules: CrawlResult;
  }> {
    const schools = await this.crawlerService.crawlSchools(source);
    const admissions = await this.crawlerService.crawlAdmissions(source);
    const schedules = await this.crawlerService.crawlSchedules(source);
    return { schools, admissions, schedules };
  }

  // ==================== 작업 상태 조회 ====================

  @Get('jobs')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '크롤링 작업 목록 조회' })
  getJobs(): CrawlJob[] {
    return this.crawlerService.getAllJobs();
  }

  @Get('jobs/:jobId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '크롤링 작업 상태 조회' })
  getJobStatus(@Param('jobId') jobId: string): CrawlJob | null {
    return this.crawlerService.getJobStatus(jobId);
  }

  // ==================== 스케줄러 관리 ====================

  @Get('scheduler/tasks')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '스케줄 작업 목록 조회' })
  getScheduledTasks(): ScheduledTask[] {
    return this.schedulerService.getAllTasks();
  }

  @Post('scheduler/tasks/:taskName/start')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '스케줄 작업 시작' })
  startTask(@Param('taskName') taskName: string): { success: boolean; message: string } {
    const success = this.schedulerService.startTask(taskName);
    return {
      success,
      message: success ? `작업 '${taskName}' 시작됨` : `작업 '${taskName}' 시작 실패`,
    };
  }

  @Post('scheduler/tasks/:taskName/stop')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '스케줄 작업 중지' })
  stopTask(@Param('taskName') taskName: string): { success: boolean; message: string } {
    const success = this.schedulerService.stopTask(taskName);
    return {
      success,
      message: success ? `작업 '${taskName}' 중지됨` : `작업 '${taskName}' 중지 실패`,
    };
  }

  @Post('scheduler/tasks/:taskName/execute')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '스케줄 작업 즉시 실행' })
  async executeTask(@Param('taskName') taskName: string): Promise<{ success: boolean; message: string }> {
    const success = await this.schedulerService.executeTask(taskName);
    return {
      success,
      message: success ? `작업 '${taskName}' 실행 완료` : `작업 '${taskName}' 실행 실패`,
    };
  }

  // ==================== 미승인 데이터 관리 ====================

  @Get('pending')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '미승인 크롤링 데이터 조회' })
  async getPendingData(): Promise<{
    schools: any[];
    admissions: any[];
    schedules: any[];
    summary: { schools: number; admissions: number; schedules: number };
  }> {
    const data = await this.crawlerService.getPendingData();
    return {
      ...data,
      summary: {
        schools: data.schools.length,
        admissions: data.admissions.length,
        schedules: data.schedules.length,
      },
    };
  }

  @Patch('schools/:id/approve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '학교 정보 승인 (게시)' })
  async approveSchool(@Param('id') id: string): Promise<{ success: boolean; school: any }> {
    const school = await this.prisma.school.update({
      where: { id },
      data: { 
        publishStatus: PublishStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
    return { success: true, school };
  }

  @Patch('schools/:id/reject')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '학교 정보 거절 (삭제)' })
  async rejectSchool(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.prisma.school.delete({ where: { id } });
    return { success: true };
  }

  @Patch('admissions/:id/approve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '입시 전형 승인' })
  async approveAdmission(@Param('id') id: string): Promise<{ success: boolean; admission: any }> {
    const admission = await this.prisma.admission.update({
      where: { id },
      data: { publishStatus: PublishStatus.PUBLISHED },
    });
    return { success: true, admission };
  }

  @Patch('admissions/:id/reject')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '입시 전형 거절' })
  async rejectAdmission(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.prisma.admission.delete({ where: { id } });
    return { success: true };
  }

  @Patch('schedules/:id/approve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '입시 일정 승인' })
  async approveSchedule(@Param('id') id: string): Promise<{ success: boolean; schedule: any }> {
    const schedule = await this.prisma.admissionSchedule.update({
      where: { id },
      data: { publishStatus: PublishStatus.PUBLISHED },
    });
    return { success: true, schedule };
  }

  @Patch('schedules/:id/reject')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '입시 일정 거절' })
  async rejectSchedule(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.prisma.admissionSchedule.delete({ where: { id } });
    return { success: true };
  }

  // ==================== 일괄 승인 ====================

  @Post('approve-all')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '모든 미승인 데이터 일괄 승인' })
  async approveAll(): Promise<{
    success: boolean;
    approved: { schools: number; admissions: number; schedules: number };
  }> {
    const [schoolsResult, admissionsResult, schedulesResult] = await Promise.all([
      this.prisma.school.updateMany({
        where: { publishStatus: PublishStatus.DRAFT },
        data: { 
          publishStatus: PublishStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      }),
      this.prisma.admission.updateMany({
        where: { publishStatus: PublishStatus.DRAFT },
        data: { publishStatus: PublishStatus.PUBLISHED },
      }),
      this.prisma.admissionSchedule.updateMany({
        where: { publishStatus: PublishStatus.DRAFT },
        data: { publishStatus: PublishStatus.PUBLISHED },
      }),
    ]);

    return {
      success: true,
      approved: {
        schools: schoolsResult.count,
        admissions: admissionsResult.count,
        schedules: schedulesResult.count,
      },
    };
  }

  // ==================== 실제 크롤링 (학교 홈페이지) ====================

  @Post('real/school/:schoolId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '특정 학교 홈페이지에서 입시 정보 크롤링' })
  async crawlRealSchool(
    @Param('schoolId') schoolId: string,
  ): Promise<{ success: boolean; data: CrawledAdmissionInfo | null; message: string }> {
    const result = await this.realCrawlerService.crawlSchoolAdmission(schoolId);
    
    if (result) {
      // DB에 저장
      await this.realCrawlerService.saveToDatabase(result);
      return {
        success: true,
        data: result,
        message: `${result.schoolName}에서 ${result.schedules.length}개 일정 수집 완료`,
      };
    }
    
    return {
      success: false,
      data: null,
      message: '크롤링 실패 - 학교 정보나 웹사이트가 없습니다',
    };
  }

  @Post('real/schools')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '여러 학교 홈페이지에서 입시 정보 크롤링' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        schoolIds: { type: 'array', items: { type: 'string' } },
        delay: { type: 'number', description: '요청 간 딜레이 (ms)', default: 2000 }
      } 
    } 
  })
  async crawlRealSchools(
    @Body() body: { schoolIds: string[]; delay?: number },
  ): Promise<{ success: boolean; results: CrawledAdmissionInfo[]; summary: { total: number; success: number; schedules: number } }> {
    const results = await this.realCrawlerService.crawlMultipleSchools(
      body.schoolIds,
      { delay: body.delay || 2000 }
    );

    // DB에 저장
    for (const result of results) {
      await this.realCrawlerService.saveToDatabase(result);
    }

    const totalSchedules = results.reduce((sum, r) => sum + r.schedules.length, 0);

    return {
      success: true,
      results,
      summary: {
        total: body.schoolIds.length,
        success: results.length,
        schedules: totalSchedules,
      },
    };
  }

  @Post('real/type/:type')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '특정 유형의 모든 학교 크롤링' })
  async crawlByType(
    @Param('type') type: SchoolType,
  ): Promise<{ success: boolean; results: CrawledAdmissionInfo[]; summary: { total: number; success: number; schedules: number } }> {
    const results = await this.realCrawlerService.crawlBySchoolType(type);

    // DB에 저장
    for (const result of results) {
      await this.realCrawlerService.saveToDatabase(result);
    }

    const totalSchedules = results.reduce((sum, r) => sum + r.schedules.length, 0);

    return {
      success: true,
      results,
      summary: {
        total: results.length,
        success: results.filter(r => r.schedules.length > 0).length,
        schedules: totalSchedules,
      },
    };
  }

  @Get('real/available-schools')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '크롤링 가능한 학교 목록 (웹사이트 있는 학교)' })
  @ApiQuery({ name: 'type', required: false, enum: SchoolType })
  async getAvailableSchools(
    @Query('type') type?: SchoolType,
  ): Promise<{ schools: any[]; count: number }> {
    const where: any = {
      website: { not: null },
      publishStatus: PublishStatus.PUBLISHED,
    };

    if (type) {
      where.type = type;
    }

    const schools = await this.prisma.school.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        region: true,
        website: true,
      },
      orderBy: [{ region: 'asc' }, { name: 'asc' }],
    });

    return {
      schools,
      count: schools.length,
    };
  }

  @Get('real/crawl-history')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '크롤링 히스토리 조회 (최근 수집된 일정)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCrawlHistory(
    @Query('limit') limit: number = 50,
  ): Promise<{ schedules: any[]; count: number }> {
    const schedules = await this.prisma.admissionSchedule.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        school: {
          select: {
            name: true,
            type: true,
            region: true,
          },
        },
      },
    });

    return {
      schedules,
      count: schedules.length,
    };
  }

  // ==================== 동아리 크롤링 ====================

  @Post('clubs/test')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '샘플 중학교 동아리 크롤링 테스트' })
  async testClubCrawling(): Promise<{
    success: boolean;
    results: ClubCrawlResult[];
    summary: { total: number; success: number; clubsFound: number };
  }> {
    const results = await this.clubCrawlerService.testCrawlSampleSchools();
    
    return {
      success: true,
      results,
      summary: {
        total: results.length,
        success: results.filter(r => r.success).length,
        clubsFound: results.reduce((sum, r) => sum + r.clubsFound, 0),
      },
    };
  }

  @Post('clubs/school/:schoolId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '특정 중학교 동아리 크롤링' })
  async crawlSchoolClubs(
    @Param('schoolId') schoolId: string,
  ): Promise<ClubCrawlResult> {
    return this.clubCrawlerService.crawlSchoolClubs(schoolId);
  }

  @Get('clubs/available-schools')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '동아리 크롤링 가능한 중학교 목록' })
  @ApiQuery({ name: 'region', required: false })
  async getAvailableMiddleSchools(
    @Query('region') region?: string,
  ): Promise<{ schools: any[]; count: number }> {
    const where: any = {
      website: { not: null },
    };

    if (region) {
      where.region = region;
    }

    const schools = await this.prisma.middleSchool.findMany({
      where,
      select: {
        id: true,
        name: true,
        region: true,
        district: true,
        website: true,
      },
      orderBy: [{ region: 'asc' }, { name: 'asc' }],
      take: 100,
    });

    return {
      schools,
      count: schools.length,
    };
  }

  // ==================== 서울 열린데이터광장 API ====================

  @Get('seoul-opendata/test')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '서울 열린데이터 API 연결 테스트' })
  async testSeoulOpenData(): Promise<{
    connected: boolean;
    message: string;
    sampleData?: ClubInfo[];
  }> {
    return this.seoulOpenDataService.testConnection();
  }

  @Get('seoul-opendata/clubs')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '서울시 학교 동아리 데이터 조회' })
  @ApiQuery({ name: 'schoolName', required: false, description: '학교명 (부분 검색)' })
  @ApiQuery({ name: 'start', required: false, type: Number, description: '시작 인덱스' })
  @ApiQuery({ name: 'end', required: false, type: Number, description: '종료 인덱스' })
  async getSeoulClubData(
    @Query('schoolName') schoolName?: string,
    @Query('start') start: number = 1,
    @Query('end') end: number = 100,
  ): Promise<{
    success: boolean;
    totalCount: number;
    clubs: ClubInfo[];
    error?: string;
  }> {
    return this.seoulOpenDataService.fetchClubData(schoolName, start, end);
  }

  @Get('seoul-opendata/clubs/:schoolName')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '특정 중학교의 동아리 목록 조회' })
  async getSchoolClubs(
    @Param('schoolName') schoolName: string,
  ): Promise<ClubInfo[]> {
    return this.seoulOpenDataService.getMiddleSchoolClubs(schoolName);
  }
}
