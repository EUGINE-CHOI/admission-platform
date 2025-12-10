import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';
import { Role } from '../../generated/prisma';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  // ========== WP7.1: 학생 대시보드 ==========
  @Get('student')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getStudentDashboard(@Request() req) {
    return this.dashboardService.getStudentDashboard(req.user.id);
  }

  // ========== WP7.2: 학부모 대시보드 ==========
  @Get('parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARENT)
  getParentDashboard(@Request() req) {
    return this.dashboardService.getParentDashboard(req.user.id);
  }

  @Get('parent/children/:childId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARENT)
  getChildDashboard(@Request() req, @Param('childId') childId: string) {
    return this.dashboardService.getChildDashboard(req.user.id, childId);
  }
}

@Controller('calendar')
export class CalendarController {
  constructor(private dashboardService: DashboardService) {}

  // ========== WP7.3: 캘린더 ==========
  @Get('admissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getAdmissionCalendar(
    @Request() req,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const now = new Date();
    return this.dashboardService.getAdmissionCalendar(
      req.user.id,
      year ? parseInt(year) : now.getFullYear(),
      month ? parseInt(month) : now.getMonth() + 1,
    );
  }

  @Get('admissions/upcoming')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getUpcomingSchedules(@Request() req, @Query('days') days?: string) {
    return this.dashboardService.getUpcomingSchedules(
      req.user.id,
      days ? parseInt(days) : 7,
    );
  }
}

@Controller('reports')
export class ReportController {
  constructor(private dashboardService: DashboardService) {}

  // ========== WP7.4: 보고서 ==========
  @Get('diagnosis')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getDiagnosisReport(@Request() req) {
    return this.dashboardService.getDiagnosisReport(req.user.id);
  }

  @Get('comprehensive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getComprehensiveReport(@Request() req) {
    return this.dashboardService.getComprehensiveReport(req.user.id);
  }

  @Get('children/:childId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARENT)
  getChildReport(
    @Request() req,
    @Param('childId') childId: string,
    @Query('type') type?: string,
  ) {
    return this.dashboardService.getChildReport(
      req.user.id,
      childId,
      (type as 'diagnosis' | 'comprehensive') || 'comprehensive',
    );
  }
}



