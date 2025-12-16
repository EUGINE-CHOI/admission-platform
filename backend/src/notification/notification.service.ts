import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum NotificationType {
  // 결제/구독 관련
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  SUBSCRIPTION_EXPIRING = 'SUBSCRIPTION_EXPIRING',
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
  SUBSCRIPTION_RENEWED = 'SUBSCRIPTION_RENEWED',

  // 가족 관련
  FAMILY_INVITE_RECEIVED = 'FAMILY_INVITE_RECEIVED',
  FAMILY_MEMBER_JOINED = 'FAMILY_MEMBER_JOINED',
  FAMILY_MEMBER_LEFT = 'FAMILY_MEMBER_LEFT',

  // 학생 활동 (학부모에게)
  STUDENT_ACTIVITY_ADDED = 'STUDENT_ACTIVITY_ADDED',
  STUDENT_GRADE_UPDATED = 'STUDENT_GRADE_UPDATED',
  STUDENT_DIAGNOSIS_COMPLETED = 'STUDENT_DIAGNOSIS_COMPLETED',
  STUDENT_TARGET_SCHOOL_ADDED = 'STUDENT_TARGET_SCHOOL_ADDED',

  // AI/상담 관련
  AI_REPORT_READY = 'AI_REPORT_READY',
  CONSULTATION_REQUESTED = 'CONSULTATION_REQUESTED',
  CONSULTATION_CONFIRMED = 'CONSULTATION_CONFIRMED',
  CONSULTATION_COMPLETED = 'CONSULTATION_COMPLETED',

  // 시스템
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}

interface CreateNotificationDto {
  userId: string;
  type: NotificationType | string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  // 알림 생성
  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
      },
    });
  }

  // 여러 사용자에게 알림 전송
  async createMany(userIds: string[], notification: Omit<CreateNotificationDto, 'userId'>) {
    return this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata ? JSON.stringify(notification.metadata) : null,
      })),
    });
  }

  // 내 알림 목록 조회
  async getMyNotifications(userId: string, options?: { unreadOnly?: boolean; limit?: number }) {
    const { unreadOnly = false, limit = 50 } = options || {};

    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      notifications: notifications.map((n) => ({
        ...n,
        metadata: n.metadata ? JSON.parse(n.metadata) : null,
      })),
      unreadCount,
    };
  }

  // 알림 읽음 처리
  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  // 모든 알림 읽음 처리
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  // 알림 삭제
  async delete(userId: string, notificationId: string) {
    return this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  // 읽은 알림 전체 삭제
  async deleteAllRead(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });
  }

  // ========== 편의 메서드 ==========

  // 결제 완료 알림
  async notifyPaymentCompleted(userId: string, planName: string, amount: number) {
    return this.create({
      userId,
      type: NotificationType.PAYMENT_COMPLETED,
      title: '결제 완료',
      message: `${planName} 플랜 결제가 완료되었습니다. (${amount.toLocaleString()}원)`,
      metadata: { planName, amount },
    });
  }

  // 구독 만료 예정 알림
  async notifySubscriptionExpiring(userId: string, daysLeft: number, planName: string) {
    return this.create({
      userId,
      type: NotificationType.SUBSCRIPTION_EXPIRING,
      title: '구독 만료 예정',
      message: `${planName} 구독이 ${daysLeft}일 후 만료됩니다. 자동 결제가 진행됩니다.`,
      metadata: { daysLeft, planName },
    });
  }

  // 가족 초대 알림
  async notifyFamilyInvite(userId: string, inviterName: string, familyName: string) {
    return this.create({
      userId,
      type: NotificationType.FAMILY_INVITE_RECEIVED,
      title: '가족 초대',
      message: `${inviterName}님이 "${familyName}" 가족에 초대했습니다.`,
      metadata: { inviterName, familyName },
    });
  }

  // 가족 구성원 추가 알림 (모든 가족 구성원에게)
  async notifyFamilyMemberJoined(familyId: string, newMemberName: string, excludeUserId?: string) {
    const members = await this.prisma.user.findMany({
      where: { familyId, id: { not: excludeUserId } },
      select: { id: true },
    });

    if (members.length === 0) return;

    return this.createMany(
      members.map((m) => m.id),
      {
        type: NotificationType.FAMILY_MEMBER_JOINED,
        title: '새 가족 구성원',
        message: `${newMemberName}님이 가족에 참여했습니다.`,
        metadata: { newMemberName },
      },
    );
  }

  // 학생 활동 추가 알림 (학부모에게)
  async notifyStudentActivityAdded(studentId: string, activityTitle: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { name: true, familyId: true },
    });

    if (!student?.familyId) return;

    const parents = await this.prisma.user.findMany({
      where: { familyId: student.familyId, role: 'PARENT' },
      select: { id: true },
    });

    if (parents.length === 0) return;

    return this.createMany(
      parents.map((p) => p.id),
      {
        type: NotificationType.STUDENT_ACTIVITY_ADDED,
        title: '학생 활동 추가',
        message: `${student.name}님이 새 활동을 추가했습니다: ${activityTitle}`,
        metadata: { studentId, studentName: student.name, activityTitle },
      },
    );
  }

  // 학생 성적 업데이트 알림 (학부모에게)
  async notifyStudentGradeUpdated(studentId: string, subject: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { name: true, familyId: true },
    });

    if (!student?.familyId) return;

    const parents = await this.prisma.user.findMany({
      where: { familyId: student.familyId, role: 'PARENT' },
      select: { id: true },
    });

    if (parents.length === 0) return;

    return this.createMany(
      parents.map((p) => p.id),
      {
        type: NotificationType.STUDENT_GRADE_UPDATED,
        title: '성적 업데이트',
        message: `${student.name}님의 ${subject} 성적이 업데이트되었습니다.`,
        metadata: { studentId, studentName: student.name, subject },
      },
    );
  }

  // 진단 완료 알림 (학부모에게)
  async notifyDiagnosisCompleted(studentId: string, diagnosisType: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { name: true, familyId: true },
    });

    if (!student?.familyId) return;

    const parents = await this.prisma.user.findMany({
      where: { familyId: student.familyId, role: 'PARENT' },
      select: { id: true },
    });

    if (parents.length === 0) return;

    return this.createMany(
      parents.map((p) => p.id),
      {
        type: NotificationType.STUDENT_DIAGNOSIS_COMPLETED,
        title: '진단 완료',
        message: `${student.name}님의 ${diagnosisType} 진단이 완료되었습니다.`,
        metadata: { studentId, studentName: student.name, diagnosisType },
      },
    );
  }
}


