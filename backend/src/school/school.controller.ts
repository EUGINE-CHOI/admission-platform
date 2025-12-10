import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SchoolService } from './school.service';
import {
  CreateSchoolDto,
  CreateAdmissionDto,
  CreateScheduleDto,
  QuerySchoolDto,
  AdminQuerySchoolDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';
import { Role, PublishStatus } from '../../generated/prisma';

@ApiTags('School')
@Controller('school')
export class SchoolController {
  constructor(private schoolService: SchoolService) {}

  // ========== 공개 API ==========
  @Get()
  getPublishedSchools(@Query() query: QuerySchoolDto) {
    return this.schoolService.getPublishedSchools(query);
  }

  @Get('upcoming-schedules')
  getUpcomingSchedules(@Query('limit') limit?: number) {
    return this.schoolService.getUpcomingSchedules(limit ? Number(limit) : 10);
  }

  @Get(':id')
  getSchoolDetail(@Param('id') schoolId: string) {
    return this.schoolService.getSchoolDetail(schoolId);
  }

  @Get(':id/admissions')
  getAdmissionsBySchool(
    @Param('id') schoolId: string,
    @Query('year') year?: number,
  ) {
    return this.schoolService.getAdmissionsBySchool(
      schoolId,
      year ? Number(year) : undefined,
    );
  }

  @Get(':id/schedules')
  getSchedulesBySchool(
    @Param('id') schoolId: string,
    @Query('year') year?: number,
  ) {
    return this.schoolService.getSchedulesBySchool(
      schoolId,
      year ? Number(year) : undefined,
    );
  }

  // ========== 관리자용 API ==========
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createSchool(@Body() dto: CreateSchoolDto) {
    return this.schoolService.createSchool(dto);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAllSchools(@Query() query: AdminQuerySchoolDto) {
    return this.schoolService.getAllSchools(query.status as PublishStatus);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  publishSchool(@Param('id') schoolId: string) {
    return this.schoolService.publishSchool(schoolId);
  }

  @Post('admissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createAdmission(@Body() dto: CreateAdmissionDto) {
    return this.schoolService.createAdmission(dto);
  }

  @Post('admissions/:id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  publishAdmission(@Param('id') admissionId: string) {
    return this.schoolService.publishAdmission(admissionId);
  }

  @Post('schedules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createSchedule(@Body() dto: CreateScheduleDto) {
    return this.schoolService.createSchedule(dto);
  }

  @Post('schedules/:id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  publishSchedule(@Param('id') scheduleId: string) {
    return this.schoolService.publishSchedule(scheduleId);
  }

  // ========== 학생용 관심 학교 ==========
  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  addFavorite(@Request() req, @Param('id') schoolId: string) {
    return this.schoolService.addFavorite(req.user.id, schoolId);
  }

  @Post(':id/unfavorite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  removeFavorite(@Request() req, @Param('id') schoolId: string) {
    return this.schoolService.removeFavorite(req.user.id, schoolId);
  }

  @Get('favorites/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getMyFavorites(@Request() req) {
    return this.schoolService.getMyFavorites(req.user.id);
  }
}



