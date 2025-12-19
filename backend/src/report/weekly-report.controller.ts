import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WeeklyReportService } from './weekly-report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Role } from '../../generated/prisma';

@ApiTags('Weekly Report')
@ApiBearerAuth('access-token')
@Controller('v1/weekly-report')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WeeklyReportController {
  constructor(private weeklyReportService: WeeklyReportService) {}

  // ??주간 리포??미리보기 (?�생)
  @Get('preview')
  @Roles(Role.STUDENT)
  async previewMyReport(@Request() req) {
    return this.weeklyReportService.previewWeeklyReport(req.user.id);
  }

  // ?��? 주간 리포??조회 (?��?�?
  @Get('child/:studentId')
  @Roles(Role.PARENT)
  async getChildReport(@Request() req, @Param('studentId') studentId: string) {
    // TODO: ?�제로는 부�??��? 관�??�인 ?�요
    return this.weeklyReportService.previewWeeklyReport(studentId);
  }

  // 리포??기록 조회
  @Get('history')
  @Roles(Role.STUDENT, Role.PARENT)
  async getReportHistory(@Request() req) {
    const studentId = req.user.role === Role.STUDENT ? req.user.id : req.user.studentId;
    return this.weeklyReportService.getReportHistory(studentId);
  }

  // ?�동?�로 리포??발송 (?�스?�용)
  @Post('send/:studentId')
  @Roles(Role.ADMIN)
  async sendReport(@Param('studentId') studentId: string) {
    return this.weeklyReportService.sendWeeklyReport(studentId);
  }

  // 모든 ?�생?�게 리포??발송 (Admin)
  @Post('send-all')
  @Roles(Role.ADMIN)
  async sendAllReports() {
    return this.weeklyReportService.sendAllWeeklyReports();
  }
}

