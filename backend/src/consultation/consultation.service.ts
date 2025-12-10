import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { SubscriptionService } from '../subscription/subscription.service';
import {
  CreateConsultationDto,
  CreateNoteDto,
  UpdateNoteDto,
  UpdateReportDto,
} from './dto';
import { ConsultationStatus, Role } from '../../generated/prisma';

@Injectable()
export class ConsultationService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    @Inject(forwardRef(() => SubscriptionService))
    private subscriptionService: SubscriptionService,
  ) {}

  // ========== WP8.2: 상담 예약 ==========

  async createConsultation(parentId: string, dto: CreateConsultationDto) {
    // 학부모 확인
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
    });

    if (!parent || parent.role !== 'PARENT') {
      throw new ForbiddenException('학부모만 상담 예약이 가능합니다');
    }

    // WP9.4: 구독 상태 및 상담 횟수 확인
    const { allowed, remaining, limit } =
      await this.subscriptionService.checkConsultationLimit(parentId);

    if (!allowed) {
      if (limit === 0) {
        throw new ForbiddenException(
          '상담 예약은 PREMIUM 이상 플랜에서 가능합니다. 플랜을 업그레이드해 주세요.',
        );
      }
      if (remaining === 0) {
        throw new ForbiddenException(
          '이번 달 상담 횟수를 모두 사용했습니다. VIP로 업그레이드하시면 무제한 상담이 가능합니다.',
        );
      }
      throw new ForbiddenException('상담 예약은 프리미엄 구독이 필요합니다');
    }

    // 자녀 관계 확인
    const student = await this.prisma.user.findUnique({
      where: { id: dto.studentId },
    });

    if (!student || student.familyId !== parent.familyId) {
      throw new ForbiddenException('자녀 정보가 올바르지 않습니다');
    }

    // 컨설턴트 확인
    const consultant = await this.prisma.user.findUnique({
      where: { id: dto.consultantId },
    });

    if (!consultant || consultant.consultantStatus !== 'APPROVED') {
      throw new NotFoundException('승인된 컨설턴트를 찾을 수 없습니다');
    }

    // 시간 중복 확인
    const scheduledAt = new Date(dto.scheduledAt);
    const duration = dto.duration || 60;
    const endTime = new Date(scheduledAt.getTime() + duration * 60000);

    const conflicting = await this.prisma.consultation.findFirst({
      where: {
        consultantId: dto.consultantId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        scheduledAt: {
          lt: endTime,
        },
        AND: {
          scheduledAt: {
            gte: new Date(scheduledAt.getTime() - duration * 60000),
          },
        },
      },
    });

    if (conflicting) {
      throw new ConflictException('해당 시간대는 이미 예약되었습니다');
    }

    // 상담 예약 생성
    const consultation = await this.prisma.consultation.create({
      data: {
        studentId: dto.studentId,
        parentId,
        consultantId: dto.consultantId,
        scheduledAt,
        duration,
        method: dto.method || 'ONLINE',
        topic: dto.topic,
        status: 'PENDING',
      },
      include: {
        student: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true } },
        consultant: { select: { id: true, name: true } },
      },
    });

    // 이벤트 로그 기록
    await this.prisma.eventLog.create({
      data: {
        studentId: dto.studentId,
        type: 'CONSULTATION_REQUESTED',
        title: '상담 예약 요청',
        description: `${consultant.name} 컨설턴트와의 상담이 요청되었습니다.`,
        referenceId: consultation.id,
      },
    });

    // 컨설턴트에게 알림
    await this.prisma.notification.create({
      data: {
        userId: dto.consultantId,
        type: 'CONSULTATION_REQUESTED',
        title: '새로운 상담 요청',
        message: `${parent.name}님이 ${student.name} 학생의 상담을 요청했습니다.`,
        metadata: JSON.stringify({ consultationId: consultation.id }),
      },
    });

    return {
      message: '예약 요청이 접수되었습니다',
      consultation,
    };
  }

  async getConsultations(userId: string, role: Role, status?: ConsultationStatus) {
    const where: any = {};
    
    if (role === 'CONSULTANT') {
      where.consultantId = userId;
    } else if (role === 'PARENT') {
      where.parentId = userId;
    } else if (role === 'STUDENT') {
      where.studentId = userId;
    }

    if (status) {
      where.status = status;
    }

    const consultations = await this.prisma.consultation.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, grade: true, schoolName: true } },
        parent: { select: { id: true, name: true } },
        consultant: { select: { id: true, name: true, specialty: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return { consultations };
  }

  async getConsultationDetail(consultationId: string, userId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        student: { select: { id: true, name: true, grade: true, schoolName: true } },
        parent: { select: { id: true, name: true, email: true } },
        consultant: { select: { id: true, name: true, specialty: true } },
        notes: { orderBy: { createdAt: 'desc' } },
        report: true,
      },
    });

    if (!consultation) {
      throw new NotFoundException('상담을 찾을 수 없습니다');
    }

    // 접근 권한 확인
    if (
      consultation.studentId !== userId &&
      consultation.parentId !== userId &&
      consultation.consultantId !== userId
    ) {
      throw new ForbiddenException('해당 상담에 접근 권한이 없습니다');
    }

    return { consultation };
  }

  async confirmConsultation(consultationId: string, consultantId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        student: { select: { name: true } },
        parent: { select: { name: true } },
      },
    });

    if (!consultation) {
      throw new NotFoundException('상담을 찾을 수 없습니다');
    }

    if (consultation.consultantId !== consultantId) {
      throw new ForbiddenException('해당 상담에 접근 권한이 없습니다');
    }

    if (consultation.status !== 'PENDING') {
      throw new ConflictException('대기 중인 예약만 확정할 수 있습니다');
    }

    const updated = await this.prisma.consultation.update({
      where: { id: consultationId },
      data: { status: 'CONFIRMED' },
    });

    // 이벤트 로그
    await this.prisma.eventLog.create({
      data: {
        studentId: consultation.studentId,
        type: 'CONSULTATION_CONFIRMED',
        title: '상담 예약 확정',
        description: '컨설턴트가 상담을 확정했습니다.',
        referenceId: consultationId,
      },
    });

    // 학부모/학생에게 알림
    await this.prisma.notification.createMany({
      data: [
        {
          userId: consultation.parentId,
          type: 'CONSULTATION_CONFIRMED',
          title: '상담이 확정되었습니다',
          message: `${consultation.student.name} 학생의 상담이 확정되었습니다.`,
        },
        {
          userId: consultation.studentId,
          type: 'CONSULTATION_CONFIRMED',
          title: '상담이 확정되었습니다',
          message: '상담 일정이 확정되었습니다.',
        },
      ],
    });

    return { message: '상담이 확정되었습니다', consultation: updated };
  }

  async rejectConsultation(consultationId: string, consultantId: string, reason?: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException('상담을 찾을 수 없습니다');
    }

    if (consultation.consultantId !== consultantId) {
      throw new ForbiddenException('해당 상담에 접근 권한이 없습니다');
    }

    if (consultation.status !== 'PENDING') {
      throw new ConflictException('대기 중인 예약만 거절할 수 있습니다');
    }

    const updated = await this.prisma.consultation.update({
      where: { id: consultationId },
      data: { status: 'CANCELLED', cancelReason: reason },
    });

    // 학부모에게 알림
    await this.prisma.notification.create({
      data: {
        userId: consultation.parentId,
        type: 'CONSULTATION_REJECTED',
        title: '상담 요청이 거절되었습니다',
        message: reason
          ? `상담 요청이 거절되었습니다. 사유: ${reason}`
          : '상담 요청이 거절되었습니다.',
      },
    });

    return { message: '상담 요청이 거절되었습니다', consultation: updated };
  }

  async cancelConsultation(consultationId: string, userId: string, reason?: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException('상담을 찾을 수 없습니다');
    }

    // 학부모 또는 컨설턴트만 취소 가능
    if (consultation.parentId !== userId && consultation.consultantId !== userId) {
      throw new ForbiddenException('취소 권한이 없습니다');
    }

    if (!['PENDING', 'CONFIRMED'].includes(consultation.status)) {
      throw new ConflictException('취소할 수 없는 상태입니다');
    }

    const updated = await this.prisma.consultation.update({
      where: { id: consultationId },
      data: { status: 'CANCELLED', cancelReason: reason },
    });

    // 상대방에게 알림
    const notifyUserId =
      consultation.parentId === userId
        ? consultation.consultantId
        : consultation.parentId;

    await this.prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: 'CONSULTATION_CANCELLED',
        title: '상담이 취소되었습니다',
        message: reason
          ? `상담이 취소되었습니다. 사유: ${reason}`
          : '상담이 취소되었습니다.',
      },
    });

    return { message: '상담이 취소되었습니다', consultation: updated };
  }

  // ========== WP8.3: 상담 노트 ==========

  async getStudentSummary(consultationId: string, consultantId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException('상담을 찾을 수 없습니다');
    }

    if (consultation.consultantId !== consultantId) {
      throw new ForbiddenException('해당 상담에 접근 권한이 없습니다');
    }

    const studentId = consultation.studentId;

    // 학생 기본 정보
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, grade: true, schoolName: true },
    });

    // 성적 요약
    const grades = await this.prisma.grade.findMany({
      where: { studentId, status: 'APPROVED' },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
    });

    // 활동 요약
    const activities = await this.prisma.activity.findMany({
      where: { studentId, status: 'APPROVED' },
      orderBy: { startDate: 'desc' },
      take: 5,
    });

    // 진단 결과
    const latestDiagnosis = await this.prisma.diagnosisResult.findFirst({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: { school: { select: { name: true } } },
    });

    // 추천 학교
    const recommendations = await this.prisma.recommendedSchool.findMany({
      where: { studentId },
      orderBy: [{ diagnosedAt: 'desc' }, { rank: 'asc' }],
      take: 3,
      include: { school: { select: { name: true, type: true } } },
    });

    // 액션 플랜
    const activePlan = await this.prisma.actionPlan.findFirst({
      where: { studentId, status: 'ACTIVE' },
      include: {
        tasks: { orderBy: { weekNumber: 'asc' } },
      },
    });

    let planProgress: any = null;
    if (activePlan) {
      const completed = activePlan.tasks.filter((t: any) => t.status === 'DONE').length;
      planProgress = {
        title: activePlan.title,
        totalTasks: activePlan.tasks.length,
        completedTasks: completed,
        progressRate: activePlan.tasks.length > 0
          ? Math.round((completed / activePlan.tasks.length) * 100)
          : 0,
      };
    }

    // 최근 이벤트
    const recentEvents = await this.prisma.eventLog.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      student,
      grades: {
        count: grades.length,
        latest: grades.slice(0, 5),
      },
      activities: {
        count: await this.prisma.activity.count({ where: { studentId } }),
        recent: activities,
      },
      diagnosis: latestDiagnosis
        ? {
            date: latestDiagnosis.createdAt,
            school: latestDiagnosis.school?.name || '종합 진단',
            score: latestDiagnosis.score,
            level: latestDiagnosis.level,
          }
        : null,
      recommendations: recommendations.map((r) => ({
        rank: r.rank,
        school: r.school.name,
        type: r.school.type,
        score: r.score,
        level: r.level,
      })),
      actionPlan: planProgress,
      timeline: recentEvents,
    };
  }

  async getNotes(consultationId: string, consultantId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException('상담을 찾을 수 없습니다');
    }

    if (consultation.consultantId !== consultantId) {
      throw new ForbiddenException('해당 상담에 접근 권한이 없습니다');
    }

    const notes = await this.prisma.consultationNote.findMany({
      where: { consultationId },
      orderBy: { createdAt: 'desc' },
    });

    return { notes };
  }

  async createNote(consultationId: string, consultantId: string, dto: CreateNoteDto) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException('상담을 찾을 수 없습니다');
    }

    if (consultation.consultantId !== consultantId) {
      throw new ForbiddenException('해당 상담에 접근 권한이 없습니다');
    }

    const note = await this.prisma.consultationNote.create({
      data: {
        consultationId,
        content: dto.content,
      },
    });

    return { message: '저장되었습니다', note };
  }

  async updateNote(
    consultationId: string,
    noteId: string,
    consultantId: string,
    dto: UpdateNoteDto,
  ) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException('상담을 찾을 수 없습니다');
    }

    if (consultation.consultantId !== consultantId) {
      throw new ForbiddenException('해당 상담에 접근 권한이 없습니다');
    }

    const note = await this.prisma.consultationNote.update({
      where: { id: noteId },
      data: { content: dto.content },
    });

    return { message: '수정되었습니다', note };
  }

  async deleteNote(consultationId: string, noteId: string, consultantId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException('상담을 찾을 수 없습니다');
    }

    if (consultation.consultantId !== consultantId) {
      throw new ForbiddenException('해당 상담에 접근 권한이 없습니다');
    }

    await this.prisma.consultationNote.delete({
      where: { id: noteId },
    });

    return { message: '삭제되었습니다' };
  }

  async completeConsultation(consultationId: string, consultantId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException('상담을 찾을 수 없습니다');
    }

    if (consultation.consultantId !== consultantId) {
      throw new ForbiddenException('해당 상담에 접근 권한이 없습니다');
    }

    if (consultation.status !== 'CONFIRMED') {
      throw new ConflictException('확정된 상담만 완료 처리할 수 있습니다');
    }

    const updated = await this.prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // 이벤트 로그
    await this.prisma.eventLog.create({
      data: {
        studentId: consultation.studentId,
        type: 'CONSULTATION_COMPLETED',
        title: '상담 완료',
        description: '상담이 완료되었습니다.',
        referenceId: consultationId,
      },
    });

    return { message: '상담이 완료 처리되었습니다', consultation: updated };
  }

  // ========== WP8.4: AI 리포트 ==========

  async generateReport(consultationId: string, consultantId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        student: true,
        notes: true,
        report: true,
      },
    });

    if (!consultation) {
      throw new NotFoundException('상담을 찾을 수 없습니다');
    }

    if (consultation.consultantId !== consultantId) {
      throw new ForbiddenException('해당 상담에 접근 권한이 없습니다');
    }

    if (consultation.status !== 'COMPLETED') {
      throw new BadRequestException('완료된 상담에서만 리포트를 생성할 수 있습니다');
    }

    if (consultation.report) {
      throw new ConflictException('이미 리포트가 존재합니다');
    }

    if (consultation.notes.length === 0) {
      throw new BadRequestException('상담 노트가 없습니다. 노트를 먼저 작성해주세요.');
    }

    // 학생 데이터 수집
    const studentSummary = await this.getStudentSummary(consultationId, consultantId);

    if (!studentSummary.diagnosis) {
      throw new BadRequestException('진단 결과가 없어 AI 리포트 생성을 할 수 없습니다');
    }

    // AI 리포트 생성
    try {
      const aiResponse = await this.aiService.generateConsultationReport(
        consultation.student,
        studentSummary,
        consultation.notes.map((n) => n.content),
        consultation.topic ?? undefined,
      );

      // 리포트 저장
      const report = await this.prisma.consultationReport.create({
        data: {
          consultationId,
          title: `${consultation.student.name} 학생 상담 리포트`,
          summary: aiResponse.summary,
          content: aiResponse.content,
          aiDraftContent: aiResponse.content,
          status: 'DRAFT',
        },
      });

      // AI Output 기록
      await this.prisma.aIOutput.create({
        data: {
          studentId: consultation.studentId,
          type: 'CONSULTATION_REPORT',
          prompt: JSON.stringify({
            topic: consultation.topic,
            notes: consultation.notes.map((n) => n.content),
          }),
          response: aiResponse.content,
          metadata: JSON.stringify({ consultationId, reportId: report.id }),
        },
      });

      return { message: 'AI 리포트 초안이 생성되었습니다', report };
    } catch (error) {
      throw new BadRequestException(
        '현재 AI 리포트 생성을 할 수 없습니다. 나중에 다시 시도해 주세요.',
      );
    }
  }

  async getReport(consultationId: string, userId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { report: true },
    });

    if (!consultation) {
      throw new NotFoundException('상담을 찾을 수 없습니다');
    }

    // 컨설턴트만 DRAFT 상태 조회 가능
    if (consultation.consultantId !== userId) {
      if (!consultation.report || consultation.report.status !== 'FINALIZED') {
        throw new ForbiddenException('리포트에 접근 권한이 없습니다');
      }
    }

    if (!consultation.report) {
      throw new NotFoundException('리포트가 아직 생성되지 않았습니다');
    }

    return { report: consultation.report };
  }

  async updateReport(consultationId: string, consultantId: string, dto: UpdateReportDto) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { report: true },
    });

    if (!consultation) {
      throw new NotFoundException('상담을 찾을 수 없습니다');
    }

    if (consultation.consultantId !== consultantId) {
      throw new ForbiddenException('해당 상담에 접근 권한이 없습니다');
    }

    if (!consultation.report) {
      throw new NotFoundException('리포트가 존재하지 않습니다');
    }

    if (consultation.report.status === 'FINALIZED') {
      throw new ConflictException('확정된 리포트는 수정할 수 없습니다');
    }

    const report = await this.prisma.consultationReport.update({
      where: { id: consultation.report.id },
      data: {
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
      },
    });

    return { message: '저장되었습니다', report };
  }

  async finalizeReport(consultationId: string, consultantId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { report: true },
    });

    if (!consultation) {
      throw new NotFoundException('상담을 찾을 수 없습니다');
    }

    if (consultation.consultantId !== consultantId) {
      throw new ForbiddenException('해당 상담에 접근 권한이 없습니다');
    }

    if (!consultation.report) {
      throw new NotFoundException('리포트가 존재하지 않습니다');
    }

    if (consultation.report.status === 'FINALIZED') {
      throw new ConflictException('이미 확정된 리포트입니다');
    }

    const report = await this.prisma.consultationReport.update({
      where: { id: consultation.report.id },
      data: { status: 'FINALIZED' },
    });

    return {
      message: '리포트가 확정되었습니다. 이제 공유할 수 있습니다.',
      report,
    };
  }

  // ========== WP8.5: 리포트 공유 ==========

  async shareReport(consultationId: string, consultantId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        report: true,
        student: { select: { name: true } },
      },
    });

    if (!consultation) {
      throw new NotFoundException('상담을 찾을 수 없습니다');
    }

    if (consultation.consultantId !== consultantId) {
      throw new ForbiddenException('해당 상담에 접근 권한이 없습니다');
    }

    if (!consultation.report) {
      throw new NotFoundException('리포트가 존재하지 않습니다');
    }

    if (consultation.report.status !== 'FINALIZED') {
      throw new BadRequestException('리포트를 먼저 확정해 주세요');
    }

    if (consultation.report.sharedAt) {
      throw new ConflictException('이미 공유된 리포트입니다');
    }

    const report = await this.prisma.consultationReport.update({
      where: { id: consultation.report.id },
      data: { sharedAt: new Date() },
    });

    // 이벤트 로그
    await this.prisma.eventLog.create({
      data: {
        studentId: consultation.studentId,
        type: 'REPORT_SHARED',
        title: '상담 리포트 공유',
        description: '상담 리포트가 공유되었습니다.',
        referenceId: report.id,
      },
    });

    // 학생/학부모에게 알림
    await this.prisma.notification.createMany({
      data: [
        {
          userId: consultation.studentId,
          type: 'REPORT_SHARED',
          title: '새로운 상담 리포트',
          message: '새로운 상담 리포트가 공유되었습니다.',
          metadata: JSON.stringify({ reportId: report.id }),
        },
        {
          userId: consultation.parentId,
          type: 'REPORT_SHARED',
          title: '새로운 상담 리포트',
          message: `${consultation.student.name} 학생의 상담 리포트가 공유되었습니다.`,
          metadata: JSON.stringify({ reportId: report.id }),
        },
      ],
    });

    return { message: '리포트가 공유되었습니다', report };
  }

  async getReceivedReports(userId: string) {
    // 학생 또는 학부모로서 공유받은 리포트 조회
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    let studentIds: string[] = [];

    if (user.role === 'STUDENT') {
      studentIds = [userId];
    } else if (user.role === 'PARENT' && user.familyId) {
      const children = await this.prisma.user.findMany({
        where: { familyId: user.familyId, role: 'STUDENT' },
        select: { id: true },
      });
      studentIds = children.map((c) => c.id);
    }

    const reports = await this.prisma.consultationReport.findMany({
      where: {
        status: 'FINALIZED',
        sharedAt: { not: null },
        consultation: {
          studentId: { in: studentIds },
        },
      },
      include: {
        consultation: {
          include: {
            student: { select: { id: true, name: true } },
            consultant: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { sharedAt: 'desc' },
    });

    return {
      reports: reports.map((r) => ({
        id: r.id,
        title: r.title,
        summary: r.summary,
        studentName: r.consultation.student.name,
        consultantName: r.consultation.consultant.name,
        consultationDate: r.consultation.scheduledAt,
        sharedAt: r.sharedAt,
      })),
    };
  }

  async getReceivedReportDetail(reportId: string, userId: string) {
    const report = await this.prisma.consultationReport.findUnique({
      where: { id: reportId },
      include: {
        consultation: {
          include: {
            student: { select: { id: true, name: true } },
            parent: { select: { id: true } },
            consultant: { select: { id: true, name: true, specialty: true } },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('리포트를 찾을 수 없습니다');
    }

    if (report.status !== 'FINALIZED' || !report.sharedAt) {
      throw new ForbiddenException('리포트에 접근할 권한이 없습니다');
    }

    // 해당 학생 또는 학부모인지 확인
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const isStudent = report.consultation.studentId === userId;
    const isParent =
      user?.role === 'PARENT' &&
      user.familyId &&
      (await this.prisma.user.findFirst({
        where: { id: report.consultation.studentId, familyId: user.familyId },
      }));

    if (!isStudent && !isParent) {
      throw new ForbiddenException('리포트에 접근할 권한이 없습니다');
    }

    return {
      report: {
        id: report.id,
        title: report.title,
        summary: report.summary,
        content: report.content,
        sharedAt: report.sharedAt,
        consultation: {
          date: report.consultation.scheduledAt,
          topic: report.consultation.topic,
          consultant: report.consultation.consultant,
          student: report.consultation.student,
        },
      },
    };
  }

  async getChildReports(parentId: string, childId: string) {
    // 가족 관계 확인
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
    });

    const child = await this.prisma.user.findUnique({
      where: { id: childId },
    });

    if (!parent?.familyId || !child?.familyId || parent.familyId !== child.familyId) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    const reports = await this.prisma.consultationReport.findMany({
      where: {
        status: 'FINALIZED',
        sharedAt: { not: null },
        consultation: { studentId: childId },
      },
      include: {
        consultation: {
          include: {
            consultant: { select: { name: true } },
          },
        },
      },
      orderBy: { sharedAt: 'desc' },
    });

    return {
      reports: reports.map((r) => ({
        id: r.id,
        title: r.title,
        summary: r.summary,
        consultantName: r.consultation.consultant.name,
        consultationDate: r.consultation.scheduledAt,
        sharedAt: r.sharedAt,
      })),
    };
  }
}

