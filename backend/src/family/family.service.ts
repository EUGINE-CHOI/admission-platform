import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService, NotificationType } from '../notification/notification.service';
import { ApiResponse } from '../common';
import { randomBytes } from 'crypto';

@Injectable()
export class FamilyService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  // 가족 생성 (학부모가 생성)
  async createFamily(userId: string, familyName?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true, familyId: true },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    if (user.familyId) {
      throw new ConflictException('이미 가족에 속해 있습니다');
    }

    const family = await this.prisma.family.create({
      data: {
        name: familyName || `${user.name}의 가족`,
        members: {
          connect: { id: userId },
        },
      },
      include: {
        members: {
          select: { id: true, name: true, role: true, email: true },
        },
      },
    });

    return {
      message: '가족이 생성되었습니다',
      family,
    };
  }

  // 내 가족 정보 조회
  async getMyFamily(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { familyId: true },
    });

    if (!user?.familyId) {
      return { family: null, message: '가족에 속해 있지 않습니다' };
    }

    const family = await this.prisma.family.findUnique({
      where: { id: user.familyId },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            schoolName: true,
            grade: true,
            createdAt: true,
          },
        },
        inviteCodes: {
          where: {
            expiresAt: { gt: new Date() },
            usedAt: null,
          },
          select: {
            id: true,
            code: true,
            expiresAt: true,
            createdAt: true,
          },
        },
      },
    });

    // 학생 수 계산 (가족 할인용)
    const studentCount = family?.members.filter((m) => m.role === 'STUDENT').length || 0;
    const discountRate = studentCount >= 3 ? 0.2 : studentCount >= 2 ? 0.1 : 0;

    return {
      family,
      stats: {
        memberCount: family?.members.length || 0,
        studentCount,
        discountRate,
        discountPercent: discountRate * 100,
      },
    };
  }

  // 초대 코드 생성
  async createInviteCode(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, familyId: true, role: true },
    });

    if (!user?.familyId) {
      throw new BadRequestException('먼저 가족을 생성해주세요');
    }

    // 기존 미사용 코드 삭제
    await this.prisma.inviteCode.deleteMany({
      where: {
        createdById: userId,
        usedAt: null,
      },
    });

    // 새 초대 코드 생성 (6자리)
    const code = randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료

    const inviteCode = await this.prisma.inviteCode.create({
      data: {
        code,
        createdById: userId,
        familyId: user.familyId,
        expiresAt,
      },
    });

    return {
      code: inviteCode.code,
      expiresAt: inviteCode.expiresAt,
      message: '초대 코드가 생성되었습니다. 7일간 유효합니다.',
    };
  }

  // 초대 코드로 가족 참여
  async joinFamilyByCode(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, familyId: true },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    if (user.familyId) {
      throw new ConflictException('이미 가족에 속해 있습니다');
    }

    const inviteCode = await this.prisma.inviteCode.findFirst({
      where: {
        code: code.toUpperCase(),
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      include: {
        family: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { name: true },
        },
      },
    });

    if (!inviteCode) {
      throw new BadRequestException('유효하지 않거나 만료된 초대 코드입니다');
    }

    // 가족에 참여
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { familyId: inviteCode.familyId },
      }),
      this.prisma.inviteCode.update({
        where: { id: inviteCode.id },
        data: {
          usedById: userId,
          usedAt: new Date(),
        },
      }),
    ]);

    // 가족 구성원들에게 알림
    await this.notificationService.notifyFamilyMemberJoined(
      inviteCode.familyId,
      user.name || '새 구성원',
      userId,
    );

    return {
      message: `${inviteCode.family.name} 가족에 참여했습니다`,
      familyId: inviteCode.familyId,
      familyName: inviteCode.family.name,
    };
  }

  // 가족 탈퇴
  async leaveFamily(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, familyId: true },
    });

    if (!user?.familyId) {
      throw new BadRequestException('가족에 속해 있지 않습니다');
    }

    const familyId = user.familyId;

    // 가족에서 탈퇴
    await this.prisma.user.update({
      where: { id: userId },
      data: { familyId: null },
    });

    // 남은 가족 구성원 확인
    const remainingMembers = await this.prisma.user.count({
      where: { familyId },
    });

    // 구성원이 없으면 가족 삭제
    if (remainingMembers === 0) {
      await this.prisma.family.delete({
        where: { id: familyId },
      });
    } else {
      // 다른 구성원들에게 알림
      const members = await this.prisma.user.findMany({
        where: { familyId },
        select: { id: true },
      });

      await this.notificationService.createMany(
        members.map((m) => m.id),
        {
          type: NotificationType.FAMILY_MEMBER_LEFT,
          title: '가족 구성원 탈퇴',
          message: `${user.name || '구성원'}님이 가족에서 탈퇴했습니다.`,
          metadata: { memberName: user.name },
        },
      );
    }

    return ApiResponse.message('가족에서 탈퇴했습니다');
  }

  // 학부모가 자녀(학생) 목록 조회
  async getChildren(parentId: string) {
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
      select: { familyId: true, role: true },
    });

    if (parent?.role !== 'PARENT') {
      throw new BadRequestException('학부모만 자녀 정보를 조회할 수 있습니다');
    }

    if (!parent.familyId) {
      return { children: [], message: '가족에 속해 있지 않습니다' };
    }

    const children = await this.prisma.user.findMany({
      where: {
        familyId: parent.familyId,
        role: 'STUDENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        schoolName: true,
        grade: true,
        createdAt: true,
      },
    });

    return { children };
  }

  // 학부모가 특정 자녀의 상세 정보 조회
  async getChildDetail(parentId: string, childId: string) {
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
      select: { familyId: true, role: true },
    });

    if (parent?.role !== 'PARENT') {
      throw new BadRequestException('학부모만 자녀 정보를 조회할 수 있습니다');
    }

    const child = await this.prisma.user.findFirst({
      where: {
        id: childId,
        familyId: parent.familyId,
        role: 'STUDENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        schoolName: true,
        grade: true,
        createdAt: true,
      },
    });

    if (!child) {
      throw new NotFoundException('자녀를 찾을 수 없습니다');
    }

    // 학생의 추가 정보 조회
    const [grades, activities, targetSchools, recentDiagnosis] = await Promise.all([
      // 성적
      this.prisma.grade.findMany({
        where: { studentId: childId },
        orderBy: [{ year: 'desc' }, { semester: 'desc' }],
        take: 10,
      }),
      // 활동
      this.prisma.activity.findMany({
        where: { studentId: childId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // 목표 학교
      this.prisma.targetSchool.findMany({
        where: { studentId: childId },
        include: {
          school: {
            select: { name: true, type: true, region: true },
          },
        },
      }),
      // 최근 진단
      this.prisma.diagnosisResult.findFirst({
        where: { studentId: childId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      child,
      grades,
      activities,
      targetSchools,
      recentDiagnosis,
    };
  }

  // 가족 이름 변경
  async updateFamilyName(userId: string, newName: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { familyId: true },
    });

    if (!user?.familyId) {
      throw new BadRequestException('가족에 속해 있지 않습니다');
    }

    await this.prisma.family.update({
      where: { id: user.familyId },
      data: { name: newName },
    });

    return ApiResponse.updated(null, '가족 이름이 변경되었습니다');
  }
}
