import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MiddleSchoolService {
  constructor(private prisma: PrismaService) {}

  // 중학교 검색 (이름 또는 지역으로)
  async searchSchools(query: string, region?: string) {
    const where: any = {};

    if (query) {
      where.name = {
        contains: query,
        mode: 'insensitive',
      };
    }

    if (region) {
      where.region = region;
    }

    const schools = await this.prisma.middleSchool.findMany({
      where,
      orderBy: [{ region: 'asc' }, { district: 'asc' }, { name: 'asc' }],
      take: 50, // 최대 50개 결과
    });

    return {
      schools,
      total: schools.length,
    };
  }

  // 지역별 중학교 목록
  async getSchoolsByRegion(region: string) {
    const schools = await this.prisma.middleSchool.findMany({
      where: { region },
      orderBy: [{ district: 'asc' }, { name: 'asc' }],
    });

    return { schools };
  }

  // 중학교 상세 정보
  async getSchoolById(id: string) {
    const school = await this.prisma.middleSchool.findUnique({
      where: { id },
    });

    return school;
  }

  // 사용 가능한 지역 목록
  async getRegions() {
    const schools = await this.prisma.middleSchool.findMany({
      select: { region: true },
      distinct: ['region'],
      orderBy: { region: 'asc' },
    });

    return {
      regions: schools.map((s) => s.region),
    };
  }

  // 특정 지역의 구/군 목록
  async getDistrictsByRegion(region: string) {
    const schools = await this.prisma.middleSchool.findMany({
      where: { region },
      select: { district: true },
      distinct: ['district'],
      orderBy: { district: 'asc' },
    });

    return {
      districts: schools.map((s) => s.district).filter((d) => d !== null),
    };
  }

  // 통계
  async getStats() {
    const totalCount = await this.prisma.middleSchool.count();
    const regionStats = await this.prisma.middleSchool.groupBy({
      by: ['region'],
      _count: { id: true },
    });

    return {
      total: totalCount,
      byRegion: regionStats.map((r) => ({
        region: r.region,
        count: r._count.id,
      })),
    };
  }
}


