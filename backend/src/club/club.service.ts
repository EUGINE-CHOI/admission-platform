import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClubCategory } from '../../generated/prisma';

@Injectable()
export class ClubService {
  constructor(private prisma: PrismaService) {}

  /**
   * 동아리 검색
   */
  async searchClubs(query: {
    keyword?: string;
    category?: ClubCategory;
    schoolId?: string;
    isGeneral?: boolean;
    limit?: number;
  }) {
    const { keyword, category, schoolId, isGeneral, limit = 50 } = query;

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
      where.middleSchoolId = schoolId;
    }

    if (isGeneral !== undefined) {
      where.isGeneral = isGeneral;
    }

    const clubs = await this.prisma.club.findMany({
      where,
      include: {
        middleSchool: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
      },
      orderBy: [{ isGeneral: 'desc' }, { name: 'asc' }],
      take: limit,
    });

    return clubs;
  }

  /**
   * 일반 동아리 템플릿 목록
   */
  async getGeneralClubs() {
    return this.prisma.club.findMany({
      where: { isGeneral: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * 카테고리별 동아리 조회
   */
  async getClubsByCategory(category: ClubCategory) {
    return this.prisma.club.findMany({
      where: { category },
      include: {
        middleSchool: {
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
      where: { middleSchoolId: schoolId },
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
        middleSchool: true,
      },
    });
  }

  /**
   * 카테고리 목록 및 통계
   */
  async getCategoryStats() {
    const stats = await this.prisma.club.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    const categoryNames: Record<ClubCategory, string> = {
      ACADEMIC: '학술',
      ARTS: '예술',
      SPORTS: '체육',
      SERVICE: '봉사',
      CAREER: '진로',
      CULTURE: '문화',
      OTHER: '기타',
    };

    return stats.map((s) => ({
      category: s.category,
      name: categoryNames[s.category],
      count: s._count.id,
    }));
  }

  /**
   * 동아리 추천 (카테고리 기반)
   */
  async recommendClubs(interests: string[]) {
    // 관심사에 맞는 카테고리 매핑
    const categoryMapping: Record<string, ClubCategory[]> = {
      '과학': [ClubCategory.ACADEMIC],
      '수학': [ClubCategory.ACADEMIC],
      '영어': [ClubCategory.ACADEMIC],
      '독서': [ClubCategory.ACADEMIC],
      '코딩': [ClubCategory.ACADEMIC],
      '음악': [ClubCategory.ARTS],
      '미술': [ClubCategory.ARTS],
      '연극': [ClubCategory.ARTS],
      '축구': [ClubCategory.SPORTS],
      '농구': [ClubCategory.SPORTS],
      '운동': [ClubCategory.SPORTS],
      '봉사': [ClubCategory.SERVICE],
      '진로': [ClubCategory.CAREER],
      '리더십': [ClubCategory.CAREER],
    };

    const categories = new Set<ClubCategory>();
    for (const interest of interests) {
      const mapped = categoryMapping[interest];
      if (mapped) {
        mapped.forEach((c) => categories.add(c));
      }
    }

    if (categories.size === 0) {
      // 기본 추천
      return this.prisma.club.findMany({
        where: { isGeneral: true },
        take: 10,
        orderBy: { name: 'asc' },
      });
    }

    return this.prisma.club.findMany({
      where: {
        category: { in: Array.from(categories) },
        isGeneral: true,
      },
      take: 10,
      orderBy: { name: 'asc' },
    });
  }
}

