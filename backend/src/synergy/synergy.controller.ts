import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { GradeAnalysisService } from '../student/grade-analysis.service';
import { SchoolCompareService } from '../school/school-compare.service';
import { PlanToTaskService } from '../task/plan-to-task.service';
import { InterviewPrepService } from '../ai/interview-prep.service';
import { DDayService } from '../dashboard/dday.service';

// ========== 1. 성적 추이 분석 ==========
@Controller('v1/analysis/grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradeAnalysisController {
  constructor(private gradeAnalysisService: GradeAnalysisService) {}

  @Get('trends')
  @Roles('STUDENT')
  async getGradeTrends(@Request() req) {
    return this.gradeAnalysisService.getGradeTrends(req.user.id);
  }

  @Get('advice')
  @Roles('STUDENT')
  async getGradeAdvice(@Request() req) {
    return this.gradeAnalysisService.getGradeAdvice(req.user.id);
  }
}

// ========== 2. 학교 비교 ==========
@Controller('v1/schools/compare')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolCompareController {
  constructor(private schoolCompareService: SchoolCompareService) {}

  @Post()
  @Roles('STUDENT', 'PARENT')
  async compareSchools(@Body() body: { schoolIds: string[] }) {
    return this.schoolCompareService.compareSchools(body.schoolIds);
  }

  @Get('targets')
  @Roles('STUDENT')
  async compareTargetSchools(@Request() req) {
    return this.schoolCompareService.compareTargetSchools(req.user.id);
  }
}

// ========== 3. AI 플랜 → Task 변환 ==========
@Controller('v1/plan-to-task')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlanToTaskController {
  constructor(private planToTaskService: PlanToTaskService) {}

  @Post('convert')
  @Roles('STUDENT')
  async convertPlanToTasks(
    @Request() req,
    @Body() body: { 
      planItems?: any[]; 
      aiResponse?: string;
      startDate?: string;
    },
  ) {
    if (body.planItems) {
      return this.planToTaskService.convertPlanToTasks(
        req.user.id,
        body.planItems,
        body.startDate ? new Date(body.startDate) : undefined,
      );
    } else if (body.aiResponse) {
      return this.planToTaskService.parseAndConvertAIPlan(
        req.user.id,
        body.aiResponse,
        body.startDate ? new Date(body.startDate) : undefined,
      );
    }
  }

  @Post('from-history/:historyId')
  @Roles('STUDENT')
  async convertFromHistory(
    @Request() req,
    @Param('historyId') historyId: string,
  ) {
    return this.planToTaskService.convertFromAIHistory(req.user.id, historyId);
  }

  @Get('template')
  @Roles('STUDENT')
  getDefaultTemplate() {
    return { template: this.planToTaskService.getDefaultPlanTemplate() };
  }
}

// ========== 4. 면접 준비 ==========
@Controller('v1/interview')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InterviewPrepController {
  constructor(private interviewPrepService: InterviewPrepService) {}

  @Get('prep/:schoolId')
  @Roles('STUDENT')
  async getInterviewPrep(
    @Request() req,
    @Param('schoolId') schoolId: string,
  ) {
    return this.interviewPrepService.getInterviewPrep(req.user.id, schoolId);
  }

  @Post('mock/:schoolId')
  @Roles('STUDENT')
  async conductMockInterview(
    @Request() req,
    @Param('schoolId') schoolId: string,
    @Body() body: { questionId: string; answer: string },
  ) {
    return this.interviewPrepService.conductMockInterview(
      req.user.id,
      schoolId,
      body.questionId,
      body.answer,
    );
  }
}

// ========== 5. D-Day 대시보드 ==========
@Controller('v1/dday')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DDayController {
  constructor(private ddayService: DDayService) {}

  @Get('dashboard')
  @Roles('STUDENT', 'PARENT')
  async getDDayDashboard(@Request() req) {
    // 학생 ID 결정 (학생인 경우 본인, 학부모인 경우 연결된 자녀)
    const studentId = await this.resolveStudentId(req);
    return this.ddayService.getDDayDashboard(studentId);
  }

  // 학부모인 경우 연결된 자녀의 ID를 반환
  private async resolveStudentId(req: any): Promise<string> {
    if (req.user.role === 'STUDENT') {
      return req.user.id;
    }
    // 학부모인 경우 가족 관계를 통해 자녀 ID 조회
    if (req.user.familyId) {
      const familyMembers = await this.ddayService['prisma'].user.findMany({
        where: {
          familyId: req.user.familyId,
          role: 'STUDENT',
        },
        select: { id: true },
      });
      if (familyMembers.length > 0) {
        return familyMembers[0].id;
      }
    }
    // 자녀가 없는 경우 본인 ID 반환 (에러 방지)
    return req.user.id;
  }

  @Post('custom')
  @Roles('STUDENT')
  async addCustomDDay(
    @Request() req,
    @Body() body: { 
      title: string; 
      date: string; 
      description?: string;
      type?: 'exam' | 'custom';
    },
  ) {
    return this.ddayService.addCustomDDay(req.user.id, {
      ...body,
      date: new Date(body.date),
    });
  }

  @Get('alerts')
  @Roles('STUDENT', 'PARENT')
  async checkAlerts(@Request() req) {
    const studentId = await this.resolveStudentId(req);
    return this.ddayService.checkDDayAlerts(studentId);
  }
}

