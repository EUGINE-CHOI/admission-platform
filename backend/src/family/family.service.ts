import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { JoinFamilyDto } from './dto';
import { Role } from '../../generated/prisma';

@Injectable()
export class FamilyService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async createInviteCode(parentId: string) {
    // 기존 가족이 있는지 확인하거나 새로 생성
    let family = await this.prisma.family.findFirst({
      where: {
        members: {
          some: { id: parentId },
        },
      },
    });

    if (!family) {
      family = await this.prisma.family.create({
        data: {
          members: {
            connect: { id: parentId },
          },
        },
      });
    }

    const code = this.generateInviteCode();
    const expiresHours =
      this.configService.get<number>('INVITE_CODE_EXPIRES_HOURS') || 72;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresHours);

    const inviteCode = await this.prisma.inviteCode.create({
      data: {
        code,
        createdById: parentId,
        familyId: family.id,
        expiresAt,
      },
    });

    return {
      message: '초대 코드가 생성되었습니다',
      inviteCode: {
        code: inviteCode.code,
        expiresAt: inviteCode.expiresAt,
      },
    };
  }

  async joinFamily(studentId: string, dto: JoinFamilyDto) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (student?.familyId) {
      throw new ConflictException('이미 다른 가족과 연결되어 있습니다');
    }

    const inviteCode = await this.prisma.inviteCode.findUnique({
      where: { code: dto.code },
    });

    if (!inviteCode) {
      throw new BadRequestException('유효하지 않은 초대 코드입니다');
    }

    if (new Date() > inviteCode.expiresAt) {
      throw new BadRequestException('만료된 초대 코드입니다');
    }

    if (inviteCode.usedById) {
      throw new BadRequestException('이미 사용된 초대 코드입니다');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: studentId },
        data: { familyId: inviteCode.familyId },
      }),
      this.prisma.inviteCode.update({
        where: { id: inviteCode.id },
        data: {
          usedById: studentId,
          usedAt: new Date(),
        },
      }),
    ]);

    return {
      message: '가족 연결이 완료되었습니다',
    };
  }

  async getChildren(parentId: string) {
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
      include: {
        family: {
          include: {
            members: {
              where: { role: Role.STUDENT },
              select: {
                id: true,
                email: true,
                name: true,
                schoolName: true,
                grade: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!parent?.family) {
      return {
        message: '연결된 자녀가 없습니다. 초대 코드를 생성해주세요',
        children: [],
      };
    }

    return {
      children: parent.family.members,
    };
  }

  async getChildProfile(parentId: string, childId: string) {
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
      select: { familyId: true },
    });

    const child = await this.prisma.user.findUnique({
      where: { id: childId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        schoolName: true,
        grade: true,
        familyId: true,
        createdAt: true,
      },
    });

    if (!child || !parent?.familyId || child.familyId !== parent.familyId) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    return { child };
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}





