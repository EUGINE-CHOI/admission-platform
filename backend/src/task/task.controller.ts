import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { UpdateTaskStatusDto, QueryEventsDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';
import { Role } from '../../generated/prisma';

@ApiTags('Task')
@ApiBearerAuth('access-token')
@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  // ========== WP6.1: Task 조회 ==========
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getCurrentWeekTasks(@Request() req) {
    return this.taskService.getCurrentWeekTasks(req.user.id);
  }

  @Get('plan/:planId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getPlanTasks(@Request() req, @Param('planId') planId: string) {
    return this.taskService.getPlanTasks(req.user.id, planId);
  }

  @Get('plan/:planId/week/:weekNum')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getWeekTasks(
    @Request() req,
    @Param('planId') planId: string,
    @Param('weekNum') weekNum: string,
  ) {
    return this.taskService.getWeekTasks(req.user.id, planId, Number(weekNum));
  }

  @Get('plan/:planId/progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getPlanProgress(@Request() req, @Param('planId') planId: string) {
    return this.taskService.getPlanProgress(req.user.id, planId);
  }

  // ========== WP6.2: Task 상태 변경 ==========
  @Patch(':taskId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  updateTaskStatus(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.taskService.updateTaskStatus(req.user.id, taskId, dto);
  }
}

@Controller('events')
export class EventController {
  constructor(private taskService: TaskService) {}

  // ========== WP6.3: Event Log ==========
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getEvents(@Request() req, @Query() query: QueryEventsDto) {
    return this.taskService.getEvents(req.user.id, query);
  }

  @Get('children/:childId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARENT)
  getChildEvents(
    @Request() req,
    @Param('childId') childId: string,
    @Query() query: QueryEventsDto,
  ) {
    return this.taskService.getChildEvents(req.user.id, childId, query);
  }
}

@Controller('timeline')
export class TimelineController {
  constructor(private taskService: TaskService) {}

  // ========== WP6.4: Timeline ==========
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getTimeline(@Request() req, @Query() query: QueryEventsDto) {
    return this.taskService.getTimeline(req.user.id, query);
  }

  @Get('children/:childId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARENT)
  getChildTimeline(
    @Request() req,
    @Param('childId') childId: string,
    @Query() query: QueryEventsDto,
  ) {
    return this.taskService.getChildTimeline(req.user.id, childId, query);
  }
}



