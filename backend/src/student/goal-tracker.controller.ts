import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GoalTrackerService, GradeGoalInput } from './goal-tracker.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Role } from '../../generated/prisma';

@ApiTags('Goal Tracker')
@ApiBearerAuth('access-token')
@Controller('v1/goals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GoalTrackerController {
  constructor(private goalTrackerService: GoalTrackerService) {}

  // 목표 ?�정
  @Post()
  @Roles(Role.STUDENT)
  async setGoal(@Request() req, @Body() input: GradeGoalInput) {
    return this.goalTrackerService.setGoal(req.user.id, input);
  }

  // ?�체 목표 ?�약 조회
  @Get('summary')
  @Roles(Role.STUDENT, Role.PARENT)
  async getGoalSummary(@Request() req) {
    const studentId = req.user.role === Role.STUDENT ? req.user.id : req.user.studentId;
    return this.goalTrackerService.getGoalSummary(studentId);
  }

  // 추천 목표 조회
  @Get('recommendations')
  @Roles(Role.STUDENT)
  async getRecommendedGoals(@Request() req) {
    return this.goalTrackerService.getRecommendedGoals(req.user.id);
  }

  // ?�정 과목 목표 ?�성 ?�측
  @Get('predict/:subject')
  @Roles(Role.STUDENT, Role.PARENT)
  async predictGoalAchievement(@Request() req, @Param('subject') subject: string) {
    const studentId = req.user.role === Role.STUDENT ? req.user.id : req.user.studentId;
    return this.goalTrackerService.predictGoalAchievement(studentId, subject);
  }

  // 목표 ??��
  @Delete(':goalId')
  @Roles(Role.STUDENT)
  async deleteGoal(@Request() req, @Param('goalId') goalId: string) {
    await this.goalTrackerService.deleteGoal(req.user.id, goalId);
    return { message: '목표가 ??��?�었?�니??' };
  }
}

