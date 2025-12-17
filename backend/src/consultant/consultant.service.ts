import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAvailabilityDto, UpdateConsultantProfileDto } from './dto';
import { ConsultantStatus, ConsultationStatus } from '../../generated/prisma';

@Injectable()
export class ConsultantService {
  constructor(private prisma: PrismaService) {}

  // ========== WP8.0: 컨설턴트 승인 (Admin) ==========

  async getConsultantList(status?: ConsultantStatus) {
    const where: any = { role: 'CONSULTANT' };
    if (status) {
      where.consultantStatus = status;
    }

    const consultants = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        consultantStatus: true,
        bio: true,
        specialty: true,
        experience: true,
        profileImage: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { consultants };
  }

  async approveConsultant(consultantId: string) {
    const consultant = await this.prisma.user.findUnique({
      where: { id: consultantId },
    });

    if (!consultant) {
      throw new NotFoundException('컨설턴트를 찾을 수 없습니다');
    }

    if (consultant.role !== 'CONSULTANT') {
      throw new ForbiddenException('컨설턴트 계정이 아닙니다');
    }

    if (consultant.consultantStatus === 'APPROVED') {
      throw new ConflictException('이미 승인된 컨설턴트입니다');
    }

    const updated = await this.prisma.user.update({
      where: { id: consultantId },
      data: { consultantStatus: 'APPROVED' },
      select: {
        id: true,
        email: true,
        name: true,
        consultantStatus: true,
      },
    });

    // 알림 생성
    await this.prisma.notification.create({
      data: {
        userId: consultantId,
        type: 'CONSULTANT_APPROVED',
        title: '컨설턴트 승인 완료',
        message: '축하합니다! 컨설턴트로 승인되었습니다. 이제 상담 서비스를 시작할 수 있습니다.',
      },
    });

    return {
      message: '컨설턴트가 승인되었습니다',
      consultant: updated,
    };
  }

  async rejectConsultant(consultantId: string, reason?: string) {
    const consultant = await this.prisma.user.findUnique({
      where: { id: consultantId },
    });

    if (!consultant) {
      throw new NotFoundException('컨설턴트를 찾을 수 없습니다');
    }

    if (consultant.role !== 'CONSULTANT') {
      throw new ForbiddenException('컨설턴트 계정이 아닙니다');
    }

    const updated = await this.prisma.user.update({
      where: { id: consultantId },
      data: { consultantStatus: 'REJECTED' },
      select: {
        id: true,
        email: true,
        name: true,
        consultantStatus: true,
      },
    });

    // 알림 생성
    await this.prisma.notification.create({
      data: {
        userId: consultantId,
        type: 'CONSULTANT_REJECTED',
        title: '컨설턴트 승인 거부',
        message: reason
          ? `컨설턴트 승인이 거부되었습니다. 사유: ${reason}`
          : '컨설턴트 승인이 거부되었습니다.',
      },
    });

    return {
      message: '컨설턴트가 거부되었습니다',
      consultant: updated,
    };
  }

  // ========== WP8.1: 컨설턴트 대시보드 ==========

  async getDashboard(consultantId: string) {
    await this.validateApprovedConsultant(consultantId);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // 오늘의 상담 일정
    const todayConsultations = await this.prisma.consultation.findMany({
      where: {
        consultantId,
        status: 'CONFIRMED',
        scheduledAt: { gte: todayStart, lt: todayEnd },
      },
      include: {
        student: { select: { id: true, name: true, grade: true, schoolName: true } },
        parent: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    // 대기 중인 예약 요청
    const pendingConsultations = await this.prisma.consultation.findMany({
      where: {
        consultantId,
        status: 'PENDING',
      },
      include: {
        student: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 이번 주 상담 통계
    const weekStats = await this.prisma.consultation.groupBy({
      by: ['status'],
      where: {
        consultantId,
        scheduledAt: { gte: todayStart, lt: weekEnd },
      },
      _count: true,
    });

    // 최근 작성한 리포트
    const recentReports = await this.prisma.consultationReport.findMany({
      where: {
        consultation: { consultantId },
      },
      include: {
        consultation: {
          include: {
            student: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      today: {
        date: todayStart,
        consultations: todayConsultations.map((c) => ({
          id: c.id,
          time: c.scheduledAt,
          duration: c.duration,
          method: c.method,
          topic: c.topic,
          student: c.student,
          parent: c.parent,
        })),
      },
      pending: pendingConsultations.map((c) => ({
        id: c.id,
        requestedAt: c.createdAt,
        scheduledAt: c.scheduledAt,
        topic: c.topic,
        student: c.student,
        parent: c.parent,
      })),
      weekStats: {
        confirmed: weekStats.find((s) => s.status === 'CONFIRMED')?._count || 0,
        completed: weekStats.find((s) => s.status === 'COMPLETED')?._count || 0,
        pending: weekStats.find((s) => s.status === 'PENDING')?._count || 0,
      },
      recentReports: recentReports.map((r) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        studentName: r.consultation.student.name,
        createdAt: r.createdAt,
        sharedAt: r.sharedAt,
      })),
    };
  }

  async getProfile(consultantId: string) {
    const consultant = await this.prisma.user.findUnique({
      where: { id: consultantId },
      select: {
        id: true,
        email: true,
        name: true,
        consultantStatus: true,
        bio: true,
        specialty: true,
        experience: true,
        profileImage: true,
        createdAt: true,
      },
    });

    if (!consultant) {
      throw new NotFoundException('컨설턴트를 찾을 수 없습니다');
    }

    return { profile: consultant };
  }

  async updateProfile(consultantId: string, dto: UpdateConsultantProfileDto) {
    await this.validateApprovedConsultant(consultantId);

    const updated = await this.prisma.user.update({
      where: { id: consultantId },
      data: {
        name: dto.name,
        bio: dto.bio,
        specialty: dto.specialty,
        experience: dto.experience,
        profileImage: dto.profileImage,
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        specialty: true,
        experience: true,
        profileImage: true,
      },
    });

    return {
      message: '프로필이 수정되었습니다',
      profile: updated,
    };
  }

  // ========== WP8.1: 가용 시간 관리 ==========

  async getAvailability(consultantId: string) {
    const availability = await this.prisma.consultantAvailability.findMany({
      where: { consultantId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return { availability };
  }

  async updateAvailability(consultantId: string, dto: UpdateAvailabilityDto) {
    await this.validateApprovedConsultant(consultantId);

    // 기존 가용 시간 삭제 후 새로 생성
    await this.prisma.consultantAvailability.deleteMany({
      where: { consultantId },
    });

    const created = await this.prisma.consultantAvailability.createMany({
      data: dto.slots.map((slot) => ({
        consultantId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: slot.isActive ?? true,
      })),
    });

    const availability = await this.prisma.consultantAvailability.findMany({
      where: { consultantId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return {
      message: '가용 시간이 설정되었습니다',
      availability,
    };
  }

  // ========== WP8.2: 컨설턴트 목록 (학부모용) ==========

  async getConsultantsForBooking() {
    const consultants = await this.prisma.user.findMany({
      where: {
        role: 'CONSULTANT',
        consultantStatus: 'APPROVED',
      },
      select: {
        id: true,
        name: true,
        bio: true,
        specialty: true,
        experience: true,
        profileImage: true,
        consultantAvailabilities: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    return { consultants };
  }

  async getConsultantDetail(consultantId: string) {
    const consultant = await this.prisma.user.findUnique({
      where: { id: consultantId },
      select: {
        id: true,
        name: true,
        bio: true,
        specialty: true,
        experience: true,
        profileImage: true,
        consultantAvailabilities: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!consultant) {
      throw new NotFoundException('컨설턴트를 찾을 수 없습니다');
    }

    return { consultant };
  }

  async getAvailableSlots(consultantId: string, date: string) {
    const consultant = await this.prisma.user.findUnique({
      where: { id: consultantId },
    });

    if (!consultant || consultant.consultantStatus !== 'APPROVED') {
      throw new NotFoundException('승인된 컨설턴트를 찾을 수 없습니다');
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // 해당 요일의 가용 시간 조회
    const availability = await this.prisma.consultantAvailability.findUnique({
      where: {
        consultantId_dayOfWeek: { consultantId, dayOfWeek },
      },
    });

    if (!availability || !availability.isActive) {
      return { date, slots: [], message: '해당 날짜는 상담 가능 일정이 없습니다' };
    }

    // 해당 날짜의 기존 예약 조회
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await this.prisma.consultation.findMany({
      where: {
        consultantId,
        scheduledAt: { gte: startOfDay, lte: endOfDay },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { scheduledAt: true, duration: true },
    });

    // 가용 시간대를 1시간 단위 슬롯으로 변환
    const slots = this.generateTimeSlots(
      availability.startTime,
      availability.endTime,
      existingBookings,
      targetDate,
    );

    return { date, slots };
  }

  // ========== 유틸리티 ==========

  private async validateApprovedConsultant(consultantId: string) {
    const consultant = await this.prisma.user.findUnique({
      where: { id: consultantId },
    });

    if (!consultant) {
      throw new NotFoundException('컨설턴트를 찾을 수 없습니다');
    }

    if (consultant.role !== 'CONSULTANT') {
      throw new ForbiddenException('컨설턴트 계정이 아닙니다');
    }

    if (consultant.consultantStatus !== 'APPROVED') {
      throw new ForbiddenException('컨설턴트 승인이 필요합니다');
    }

    return consultant;
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    existingBookings: { scheduledAt: Date; duration: number }[],
    targetDate: Date,
  ): { time: string; available: boolean }[] {
    const slots: { time: string; available: boolean }[] = [];
    
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);

    for (let hour = startHour; hour < endHour; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      const slotDateTime = new Date(targetDate);
      slotDateTime.setHours(hour, 0, 0, 0);

      // 현재 시간보다 과거인지 확인
      const now = new Date();
      if (slotDateTime < now) {
        continue;
      }

      // 기존 예약과 겹치는지 확인
      const isBooked = existingBookings.some((booking) => {
        const bookingStart = new Date(booking.scheduledAt);
        const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);
        const slotEnd = new Date(slotDateTime.getTime() + 60 * 60000);
        
        return slotDateTime < bookingEnd && slotEnd > bookingStart;
      });

      slots.push({ time: timeStr, available: !isBooked });
    }

    return slots;
  }
}








