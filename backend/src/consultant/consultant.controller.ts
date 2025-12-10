import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ConsultantService } from './consultant.service';
import {
  UpdateAvailabilityDto,
  UpdateConsultantProfileDto,
  RejectConsultantDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';
import { Role, ConsultantStatus } from '../../generated/prisma';

@ApiTags('Consultant')
@ApiBearerAuth('access-token')
@Controller()
export class ConsultantController {
  constructor(private consultantService: ConsultantService) {}

  // ========== WP8.0: 관리자용 컨설턴트 승인 API ==========

  @Get('admin/consultants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getConsultantList(@Query('status') status?: ConsultantStatus) {
    return this.consultantService.getConsultantList(status);
  }

  @Post('admin/consultants/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  approveConsultant(@Param('id') consultantId: string) {
    return this.consultantService.approveConsultant(consultantId);
  }

  @Post('admin/consultants/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  rejectConsultant(
    @Param('id') consultantId: string,
    @Body() dto: RejectConsultantDto,
  ) {
    return this.consultantService.rejectConsultant(consultantId, dto.reason);
  }

  // ========== WP8.1: 컨설턴트 대시보드 ==========

  @Get('consultant/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CONSULTANT)
  getDashboard(@Request() req) {
    return this.consultantService.getDashboard(req.user.id);
  }

  @Get('consultant/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CONSULTANT)
  getProfile(@Request() req) {
    return this.consultantService.getProfile(req.user.id);
  }

  @Put('consultant/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CONSULTANT)
  updateProfile(@Request() req, @Body() dto: UpdateConsultantProfileDto) {
    return this.consultantService.updateProfile(req.user.id, dto);
  }

  @Get('consultant/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CONSULTANT)
  getAvailability(@Request() req) {
    return this.consultantService.getAvailability(req.user.id);
  }

  @Put('consultant/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CONSULTANT)
  updateAvailability(@Request() req, @Body() dto: UpdateAvailabilityDto) {
    return this.consultantService.updateAvailability(req.user.id, dto);
  }

  // ========== WP8.2: 컨설턴트 목록 (학부모용) ==========

  @Get('consultants')
  @UseGuards(JwtAuthGuard)
  getConsultantsForBooking() {
    return this.consultantService.getConsultantsForBooking();
  }

  @Get('consultants/:id')
  @UseGuards(JwtAuthGuard)
  getConsultantDetail(@Param('id') consultantId: string) {
    return this.consultantService.getConsultantDetail(consultantId);
  }

  @Get('consultants/:id/slots')
  @UseGuards(JwtAuthGuard)
  getAvailableSlots(
    @Param('id') consultantId: string,
    @Query('date') date: string,
  ) {
    return this.consultantService.getAvailableSlots(consultantId, date);
  }
}


