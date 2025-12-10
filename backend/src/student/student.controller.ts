import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StudentService } from './student.service';
import {
  CreateGradeDto,
  UpdateGradeDto,
  CreateActivityDto,
  UpdateActivityDto,
  CreateReadingDto,
  UpdateReadingDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  CreateVolunteerDto,
  UpdateProfileDto,
  RevisionRequestDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';
import { Role } from '../../generated/prisma';

@ApiTags('Student')
@ApiBearerAuth('access-token')
@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private studentService: StudentService) {}

  // ========== 성적 ==========
  @Post('grades')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  createGrade(@Request() req, @Body() dto: CreateGradeDto) {
    return this.studentService.createGrade(req.user.id, dto);
  }

  @Get('grades')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  getGrades(@Request() req) {
    return this.studentService.getGrades(req.user.id);
  }

  @Patch('grades/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  updateGrade(
    @Request() req,
    @Param('id') gradeId: string,
    @Body() dto: UpdateGradeDto,
  ) {
    return this.studentService.updateGrade(req.user.id, gradeId, dto);
  }

  @Delete('grades/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  deleteGrade(@Request() req, @Param('id') gradeId: string) {
    return this.studentService.deleteGrade(req.user.id, gradeId);
  }

  // ========== 활동 ==========
  @Post('activities')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  createActivity(@Request() req, @Body() dto: CreateActivityDto) {
    return this.studentService.createActivity(req.user.id, dto);
  }

  @Get('activities')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  getActivities(@Request() req) {
    return this.studentService.getActivities(req.user.id);
  }

  @Patch('activities/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  updateActivity(
    @Request() req,
    @Param('id') activityId: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.studentService.updateActivity(req.user.id, activityId, dto);
  }

  @Delete('activities/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  deleteActivity(@Request() req, @Param('id') activityId: string) {
    return this.studentService.deleteActivity(req.user.id, activityId);
  }

  // ========== 독서 기록 ==========
  @Post('readings')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  createReading(@Request() req, @Body() dto: CreateReadingDto) {
    return this.studentService.createReading(req.user.id, dto);
  }

  @Get('readings')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  getReadings(@Request() req) {
    return this.studentService.getReadings(req.user.id);
  }

  @Patch('readings/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  updateReading(
    @Request() req,
    @Param('id') readingId: string,
    @Body() dto: UpdateReadingDto,
  ) {
    return this.studentService.updateReading(req.user.id, readingId, dto);
  }

  @Delete('readings/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  deleteReading(@Request() req, @Param('id') readingId: string) {
    return this.studentService.deleteReading(req.user.id, readingId);
  }

  // ========== 출결 ==========
  @Post('attendances')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  createAttendance(@Request() req, @Body() dto: CreateAttendanceDto) {
    return this.studentService.createAttendance(req.user.id, dto);
  }

  @Get('attendances')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  getAttendances(@Request() req) {
    return this.studentService.getAttendances(req.user.id);
  }

  @Patch('attendances/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  updateAttendance(
    @Request() req,
    @Param('id') attendanceId: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.studentService.updateAttendance(req.user.id, attendanceId, dto);
  }

  // ========== 봉사활동 ==========
  @Post('volunteers')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  createVolunteer(@Request() req, @Body() dto: CreateVolunteerDto) {
    return this.studentService.createVolunteer(req.user.id, dto);
  }

  @Get('volunteers')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  getVolunteers(@Request() req) {
    return this.studentService.getVolunteers(req.user.id);
  }

  @Delete('volunteers/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  deleteVolunteer(@Request() req, @Param('id') volunteerId: string) {
    return this.studentService.deleteVolunteer(req.user.id, volunteerId);
  }

  // ========== 프로필 ==========
  @Get('profile')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  getProfile(@Request() req) {
    return this.studentService.getProfile(req.user.id);
  }

  @Patch('profile')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.studentService.updateProfile(req.user.id, dto);
  }

  @Get('summary')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  getStudentSummary(@Request() req) {
    return this.studentService.getStudentSummary(req.user.id);
  }

  // ========== 학부모용 ==========
  @Get('children/:childId/grades')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  getChildGrades(@Request() req, @Param('childId') childId: string) {
    return this.studentService.getChildGrades(req.user.id, childId);
  }

  @Get('children/:childId/activities')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  getChildActivities(@Request() req, @Param('childId') childId: string) {
    return this.studentService.getChildActivities(req.user.id, childId);
  }

  @Get('children/:childId/readings')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  getChildReadings(@Request() req, @Param('childId') childId: string) {
    return this.studentService.getChildReadings(req.user.id, childId);
  }

  @Get('children/:childId/attendances')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  getChildAttendances(@Request() req, @Param('childId') childId: string) {
    return this.studentService.getChildAttendances(req.user.id, childId);
  }

  @Get('children/:childId/volunteers')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  getChildVolunteers(@Request() req, @Param('childId') childId: string) {
    return this.studentService.getChildVolunteers(req.user.id, childId);
  }

  @Get('children/:childId/summary')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  getChildSummary(@Request() req, @Param('childId') childId: string) {
    return this.studentService.getChildSummary(req.user.id, childId);
  }

  // ========== 학부모 승인/수정요청 ==========
  @Post('grades/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  approveGrade(@Request() req, @Param('id') gradeId: string) {
    return this.studentService.approveGrade(req.user.id, gradeId);
  }

  @Post('grades/:id/revision')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  requestGradeRevision(
    @Request() req,
    @Param('id') gradeId: string,
    @Body() dto: RevisionRequestDto,
  ) {
    return this.studentService.requestGradeRevision(
      req.user.id,
      gradeId,
      dto.comment,
    );
  }

  @Post('activities/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  approveActivity(@Request() req, @Param('id') activityId: string) {
    return this.studentService.approveActivity(req.user.id, activityId);
  }

  @Post('activities/:id/revision')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  requestActivityRevision(
    @Request() req,
    @Param('id') activityId: string,
    @Body() dto: RevisionRequestDto,
  ) {
    return this.studentService.requestActivityRevision(
      req.user.id,
      activityId,
      dto.comment,
    );
  }

  @Post('readings/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  approveReading(@Request() req, @Param('id') readingId: string) {
    return this.studentService.approveReading(req.user.id, readingId);
  }

  @Post('readings/:id/revision')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  requestReadingRevision(
    @Request() req,
    @Param('id') readingId: string,
    @Body() dto: RevisionRequestDto,
  ) {
    return this.studentService.requestReadingRevision(
      req.user.id,
      readingId,
      dto.comment,
    );
  }
}



