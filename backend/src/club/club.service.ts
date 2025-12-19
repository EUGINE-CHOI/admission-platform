import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubService {
  constructor(private prisma: PrismaService) {}

  /**
   * 동아리 검색
   */
  async searchClubs(query: {
    keyword?: string;
    category?: string;
    schoolId?: string;
    limit?: number;
  }) {
    const { keyword, category, schoolId, limit = 50 } = query;

    const where: any = {};

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (schoolId) {
      where.schoolId = schoolId;
    }

    const clubs = await this.prisma.club.findMany({
      where,
      include: {
        school: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
      },
      orderBy: [{ name: 'asc' }],
      take: limit,
    });

    return clubs;
  }

  /**
   * 활성 동아리 목록
   */
  async getActiveClubs() {
    return this.prisma.club.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * 카테고리별 동아리 조회
   */
  async getClubsByCategory(category: string) {
    return this.prisma.club.findMany({
      where: { category },
      include: {
        school: {
          select: { name: true, region: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * 특정 학교의 동아리 조회
   */
  async getSchoolClubs(schoolId: string) {
    return this.prisma.club.findMany({
      where: { schoolId },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * 동아리 상세 조회
   */
  async getClubById(id: string) {
    return this.prisma.club.findUnique({
      where: { id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
      },
    });
  }

  /**
   * 동아리 생성 (Admin)
   */
  async createClub(data: {
    name: string;
    category: string;
    description?: string;
    schoolId?: string;
    targetGrade?: string;
    memberCount?: number;
  }) {
    return this.prisma.club.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        schoolId: data.schoolId,
        targetGrade: data.targetGrade,
        memberCount: data.memberCount,
        isActive: true,
      },
    });
  }

  /**
   * 동아리 업데이트
   */
  async updateClub(
    id: string,
    data: {
      name?: string;
      category?: string;
      description?: string;
      targetGrade?: string;
      memberCount?: number;
      isActive?: boolean;
    },
  ) {
    return this.prisma.club.update({
      where: { id },
      data,
    });
  }

  /**
   * 동아리 삭제
   */
  async deleteClub(id: string) {
    return this.prisma.club.delete({
      where: { id },
    });
  }

  /**
   * 카테고리 목록 조회
   */
  async getCategories(): Promise<string[]> {
    const clubs = await this.prisma.club.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return clubs.map(c => c.category);
  }

  /**
   * 동아리 추천 (카테고리 기반)
   */
  async recommendClubs(category?: string, limit = 5) {
    const where: any = { isActive: true };
    if (category) {
      where.category = category;
    }

    return this.prisma.club.findMany({
      where,
      take: limit,
      orderBy: { memberCount: 'desc' },
    });
  }
}
