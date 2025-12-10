import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ConsultationService } from './consultation.service';
import {
  CreateConsultationDto,
  CreateNoteDto,
  UpdateNoteDto,
  UpdateReportDto,
  CancelConsultationDto,
  RejectConsultationDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';
import { Role, ConsultationStatus } from '../../generated/prisma';

@ApiTags('Consultation')
@ApiBearerAuth('access-token')
@Controller('consultations')
@UseGuards(JwtAuthGuard)
export class ConsultationController {
  constructor(private consultationService: ConsultationService) {}

  // ========== WP8.2: 상담 예약 ==========

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  createConsultation(@Request() req, @Body() dto: CreateConsultationDto) {
    return this.consultationService.createConsultation(req.user.id, dto);
  }

  @Get()
  getConsultations(
    @Request() req,
    @Query('status') status?: ConsultationStatus,
  ) {
    return this.consultationService.getConsultations(
      req.user.id,
      req.user.role,
      status,
    );
  }

  @Get(':id')
  getConsultationDetail(@Request() req, @Param('id') consultationId: string) {
    return this.consultationService.getConsultationDetail(
      consultationId,
      req.user.id,
    );
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(Role.CONSULTANT)
  confirmConsultation(@Request() req, @Param('id') consultationId: string) {
    return this.consultationService.confirmConsultation(
      consultationId,
      req.user.id,
    );
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.CONSULTANT)
  rejectConsultation(
    @Request() req,
    @Param('id') consultationId: string,
    @Body() dto: RejectConsultationDto,
  ) {
    return this.consultationService.rejectConsultation(
      consultationId,
      req.user.id,
      dto.reason,
    );
  }

  @Patch(':id/cancel')
  cancelConsultation(
    @Request() req,
    @Param('id') consultationId: string,
    @Body() dto: CancelConsultationDto,
  ) {
    return this.consultationService.cancelConsultation(
      consultationId,
      req.user.id,
      dto.reason,
    );
  }

  // ========== WP8.3: 상담 노트 ==========

  @Get(':id/student-summary')
  @UseGuards(RolesGuard)
  @Roles(Role.CONSULTANT)
  getStudentSummary(@Request() req, @Param('id') consultationId: string) {
    return this.consultationService.getStudentSummary(
      consultationId,
      req.user.id,
    );
  }

  @Get(':id/notes')
  @UseGuards(RolesGuard)
  @Roles(Role.CONSULTANT)
  getNotes(@Request() req, @Param('id') consultationId: string) {
    return this.consultationService.getNotes(consultationId, req.user.id);
  }

  @Post(':id/notes')
  @UseGuards(RolesGuard)
  @Roles(Role.CONSULTANT)
  createNote(
    @Request() req,
    @Param('id') consultationId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.consultationService.createNote(
      consultationId,
      req.user.id,
      dto,
    );
  }

  @Put(':id/notes/:noteId')
  @UseGuards(RolesGuard)
  @Roles(Role.CONSULTANT)
  updateNote(
    @Request() req,
    @Param('id') consultationId: string,
    @Param('noteId') noteId: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.consultationService.updateNote(
      consultationId,
      noteId,
      req.user.id,
      dto,
    );
  }

  @Delete(':id/notes/:noteId')
  @UseGuards(RolesGuard)
  @Roles(Role.CONSULTANT)
  deleteNote(
    @Request() req,
    @Param('id') consultationId: string,
    @Param('noteId') noteId: string,
  ) {
    return this.consultationService.deleteNote(
      consultationId,
      noteId,
      req.user.id,
    );
  }

  @Patch(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(Role.CONSULTANT)
  completeConsultation(@Request() req, @Param('id') consultationId: string) {
    return this.consultationService.completeConsultation(
      consultationId,
      req.user.id,
    );
  }

  // ========== WP8.4: AI 리포트 ==========

  @Post(':id/report/generate')
  @UseGuards(RolesGuard)
  @Roles(Role.CONSULTANT)
  generateReport(@Request() req, @Param('id') consultationId: string) {
    return this.consultationService.generateReport(consultationId, req.user.id);
  }

  @Get(':id/report')
  getReport(@Request() req, @Param('id') consultationId: string) {
    return this.consultationService.getReport(consultationId, req.user.id);
  }

  @Put(':id/report')
  @UseGuards(RolesGuard)
  @Roles(Role.CONSULTANT)
  updateReport(
    @Request() req,
    @Param('id') consultationId: string,
    @Body() dto: UpdateReportDto,
  ) {
    return this.consultationService.updateReport(
      consultationId,
      req.user.id,
      dto,
    );
  }

  @Post(':id/report/finalize')
  @UseGuards(RolesGuard)
  @Roles(Role.CONSULTANT)
  finalizeReport(@Request() req, @Param('id') consultationId: string) {
    return this.consultationService.finalizeReport(
      consultationId,
      req.user.id,
    );
  }

  // ========== WP8.5: 리포트 공유 ==========

  @Post(':id/report/share')
  @UseGuards(RolesGuard)
  @Roles(Role.CONSULTANT)
  shareReport(@Request() req, @Param('id') consultationId: string) {
    return this.consultationService.shareReport(consultationId, req.user.id);
  }
}

// 공유받은 리포트 조회용 별도 컨트롤러
@Controller('reports/received')
@UseGuards(JwtAuthGuard)
export class ReceivedReportsController {
  constructor(private consultationService: ConsultationService) {}

  @Get()
  getReceivedReports(@Request() req) {
    return this.consultationService.getReceivedReports(req.user.id);
  }

  @Get(':reportId')
  getReceivedReportDetail(
    @Request() req,
    @Param('reportId') reportId: string,
  ) {
    return this.consultationService.getReceivedReportDetail(
      reportId,
      req.user.id,
    );
  }

  @Get('children/:childId')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  getChildReports(@Request() req, @Param('childId') childId: string) {
    return this.consultationService.getChildReports(req.user.id, childId);
  }
}


