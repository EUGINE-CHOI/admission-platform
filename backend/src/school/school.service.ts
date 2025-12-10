import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSchoolDto,
  CreateAdmissionDto,
  CreateScheduleDto,
  QuerySchoolDto,
} from './dto';
import { PublishStatus } from '../../generated/prisma';

@Injectable()
export class SchoolService {
  constructor(private prisma: PrismaService) {}

  // ========== 학교 관리 ==========
  async createSchool(dto: CreateSchoolDto) {
    const existing = await this.prisma.school.findUnique({
      where: {
        name_region: {
          name: dto.name,
          region: dto.region,
        },
      },
    });

    if (existing) {
      throw new ConflictException('이미 등록된 학교입니다');
    }

    const school = await this.prisma.school.create({
      data: dto,
    });

    return {
      message: '학교가 등록되었습니다',
      school,
    };
  }

  async getPublishedSchools(query: QuerySchoolDto) {
    const where: any = {
      publishStatus: PublishStatus.PUBLISHED,
    };

    if (query.region) {
      where.region = query.region;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const schools = await this.prisma.school.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { admissions: true, schedules: true },
        },
      },
    });

    return { schools };
  }

  async getAllSchools(status?: PublishStatus) {
    const where: any = {};
    if (status) {
      where.publishStatus = status;
    }

    const schools = await this.prisma.school.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { admissions: true, schedules: true },
        },
      },
    });

    return { schools };
  }

  async getSchoolDetail(schoolId: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        admissions: {
          where: { publishStatus: PublishStatus.PUBLISHED },
          orderBy: [{ year: 'desc' }, { type: 'asc' }],
        },
        schedules: {
          where: { publishStatus: PublishStatus.PUBLISHED },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!school) {
      throw new NotFoundException('학교를 찾을 수 없습니다');
    }

    return { school };
  }

  async publishSchool(schoolId: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException('학교를 찾을 수 없습니다');
    }

    const updated = await this.prisma.school.update({
      where: { id: schoolId },
      data: {
        publishStatus: PublishStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    return {
      message: '학교가 게시되었습니다',
      school: updated,
    };
  }

  // ========== 전형 관리 ==========
  async createAdmission(dto: CreateAdmissionDto) {
    const school = await this.prisma.school.findUnique({
      where: { id: dto.schoolId },
    });

    if (!school) {
      throw new NotFoundException('학교를 찾을 수 없습니다');
    }

    const admission = await this.prisma.admission.create({
      data: dto,
    });

    return {
      message: '전형이 등록되었습니다',
      admission,
    };
  }

  async getAdmissionsBySchool(schoolId: string, year?: number) {
    const where: any = { schoolId };
    if (year) {
      where.year = year;
    }

    const admissions = await this.prisma.admission.findMany({
      where,
      orderBy: [{ year: 'desc' }, { type: 'asc' }],
    });

    return { admissions };
  }

  async publishAdmission(admissionId: string) {
    const admission = await this.prisma.admission.findUnique({
      where: { id: admissionId },
    });

    if (!admission) {
      throw new NotFoundException('전형을 찾을 수 없습니다');
    }

    const updated = await this.prisma.admission.update({
      where: { id: admissionId },
      data: { publishStatus: PublishStatus.PUBLISHED },
    });

    return {
      message: '전형이 게시되었습니다',
      admission: updated,
    };
  }

  // ========== 일정 관리 ==========
  async createSchedule(dto: CreateScheduleDto) {
    const school = await this.prisma.school.findUnique({
      where: { id: dto.schoolId },
    });

    if (!school) {
      throw new NotFoundException('학교를 찾을 수 없습니다');
    }

    const schedule = await this.prisma.admissionSchedule.create({
      data: {
        schoolId: dto.schoolId,
        year: dto.year,
        type: dto.type,
        title: dto.title,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        location: dto.location,
        note: dto.note,
      },
    });

    return {
      message: '일정이 등록되었습니다',
      schedule,
    };
  }

  async getSchedulesBySchool(schoolId: string, year?: number) {
    const where: any = { schoolId };
    if (year) {
      where.year = year;
    }

    const schedules = await this.prisma.admissionSchedule.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });

    return { schedules };
  }

  async publishSchedule(scheduleId: string) {
    const schedule = await this.prisma.admissionSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException('일정을 찾을 수 없습니다');
    }

    const updated = await this.prisma.admissionSchedule.update({
      where: { id: scheduleId },
      data: { publishStatus: PublishStatus.PUBLISHED },
    });

    return {
      message: '일정이 게시되었습니다',
      schedule: updated,
    };
  }

  async getUpcomingSchedules(limit: number = 10) {
    const schedules = await this.prisma.admissionSchedule.findMany({
      where: {
        publishStatus: PublishStatus.PUBLISHED,
        startDate: { gte: new Date() },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
      include: {
        school: {
          select: { id: true, name: true, type: true, region: true },
        },
      },
    });

    return { schedules };
  }

  // ========== 관심 학교 ==========
  async addFavorite(studentId: string, schoolId: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException('학교를 찾을 수 없습니다');
    }

    const existing = await this.prisma.favoriteSchool.findUnique({
      where: {
        studentId_schoolId: { studentId, schoolId },
      },
    });

    if (existing) {
      throw new ConflictException('이미 관심 학교로 등록되어 있습니다');
    }

    await this.prisma.favoriteSchool.create({
      data: { studentId, schoolId },
    });

    return { message: '관심 학교로 등록되었습니다' };
  }

  async removeFavorite(studentId: string, schoolId: string) {
    const favorite = await this.prisma.favoriteSchool.findUnique({
      where: {
        studentId_schoolId: { studentId, schoolId },
      },
    });

    if (!favorite) {
      throw new NotFoundException('관심 학교가 아닙니다');
    }

    await this.prisma.favoriteSchool.delete({
      where: { id: favorite.id },
    });

    return { message: '관심 학교에서 삭제되었습니다' };
  }

  async getMyFavorites(studentId: string) {
    const favorites = await this.prisma.favoriteSchool.findMany({
      where: { studentId },
    });

    const schoolIds = favorites.map((f) => f.schoolId);

    const schools = await this.prisma.school.findMany({
      where: { id: { in: schoolIds } },
      include: {
        schedules: {
          where: {
            publishStatus: PublishStatus.PUBLISHED,
            startDate: { gte: new Date() },
          },
          orderBy: { startDate: 'asc' },
          take: 3,
        },
      },
    });

    return { favorites: schools };
  }
}





