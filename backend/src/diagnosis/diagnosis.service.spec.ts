import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosisService } from './diagnosis.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PublishStatus, DiagnosisLevel } from '../../generated/prisma';

describe('DiagnosisService', () => {
  let service: DiagnosisService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    school: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    targetSchool: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    diagnosisResult: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    grade: {
      findMany: jest.fn(),
    },
    activity: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    attendance: {
      aggregate: jest.fn(),
    },
    volunteerHour: {
      aggregate: jest.fn(),
    },
    admission: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiagnosisService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DiagnosisService>(DiagnosisService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addTargetSchool', () => {
    const studentId = 'student-1';
    const dto = { schoolId: 'school-1', priority: 1 };

    it('목표 학교 등록 성공', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue({
        id: 'school-1',
        name: '한국과학고등학교',
        publishStatus: PublishStatus.PUBLISHED,
      });
      mockPrismaService.targetSchool.findUnique.mockResolvedValue(null);
      mockPrismaService.targetSchool.count.mockResolvedValue(0);
      mockPrismaService.targetSchool.create.mockResolvedValue({
        id: 'target-1',
        studentId,
        schoolId: 'school-1',
        priority: 1,
        school: { id: 'school-1', name: '한국과학고등학교', type: 'SCIENCE', region: '서울' },
      });

      const result = await service.addTargetSchool(studentId, dto);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('targetSchool');
      expect(result.message).toBe('목표 학교로 등록되었습니다');
    });

    it('존재하지 않는 학교일 때 NotFoundException', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(null);

      await expect(service.addTargetSchool(studentId, dto)).rejects.toThrow(NotFoundException);
    });

    it('이미 등록된 목표 학교일 때 ConflictException', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue({
        id: 'school-1',
        publishStatus: PublishStatus.PUBLISHED,
      });
      mockPrismaService.targetSchool.findUnique.mockResolvedValue({
        id: 'existing-target',
      });

      await expect(service.addTargetSchool(studentId, dto)).rejects.toThrow(ConflictException);
    });

    it('목표 학교 5개 초과 시 BadRequestException', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue({
        id: 'school-1',
        publishStatus: PublishStatus.PUBLISHED,
      });
      mockPrismaService.targetSchool.findUnique.mockResolvedValue(null);
      mockPrismaService.targetSchool.count.mockResolvedValue(5);

      await expect(service.addTargetSchool(studentId, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeTargetSchool', () => {
    const studentId = 'student-1';
    const schoolId = 'school-1';

    it('목표 학교 삭제 성공', async () => {
      mockPrismaService.targetSchool.findUnique.mockResolvedValue({
        id: 'target-1',
        studentId,
        schoolId,
      });
      mockPrismaService.targetSchool.delete.mockResolvedValue({});

      const result = await service.removeTargetSchool(studentId, schoolId);

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('목표 학교에서 삭제되었습니다');
    });

    it('등록되지 않은 목표 학교 삭제 시 NotFoundException', async () => {
      mockPrismaService.targetSchool.findUnique.mockResolvedValue(null);

      await expect(service.removeTargetSchool(studentId, schoolId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTargetSchools', () => {
    const studentId = 'student-1';

    it('목표 학교 목록 조회 성공', async () => {
      mockPrismaService.targetSchool.findMany.mockResolvedValue([
        {
          id: 'target-1',
          priority: 1,
          school: { id: 'school-1', name: '한국과학고', type: 'SCIENCE', region: '서울', admissions: [] },
        },
        {
          id: 'target-2',
          priority: 2,
          school: { id: 'school-2', name: '서울과학고', type: 'SCIENCE', region: '서울', admissions: [] },
        },
      ]);

      const result = await service.getTargetSchools(studentId);

      expect(result).toHaveProperty('targetSchools');
      expect(result.targetSchools).toHaveLength(2);
    });

    it('목표 학교가 없을 때 메시지 반환', async () => {
      mockPrismaService.targetSchool.findMany.mockResolvedValue([]);

      const result = await service.getTargetSchools(studentId);

      expect(result.targetSchools).toHaveLength(0);
      expect(result.message).toBe('목표 학교를 설정해주세요');
    });
  });

  describe('getDiagnosisHistory', () => {
    const studentId = 'student-1';

    it('진단 히스토리 조회 성공', async () => {
      const mockResults = [
        {
          id: 'diag-1',
          studentId,
          schoolId: 'school-1',
          level: DiagnosisLevel.FIT,
          score: 85,
          strengths: JSON.stringify(['성적 우수']),
          weaknesses: JSON.stringify([]),
          recommendations: JSON.stringify([]),
          createdAt: new Date(),
          school: { id: 'school-1', name: '한국과학고', type: 'SCIENCE', region: '서울' },
        },
      ];
      mockPrismaService.diagnosisResult.findMany.mockResolvedValue(mockResults);

      const result = await service.getDiagnosisHistory(studentId);

      expect(result).toHaveProperty('results');
      expect(result.results).toHaveLength(1);
      expect(result.results[0].level).toBe(DiagnosisLevel.FIT);
    });

    it('진단 히스토리가 없을 때 빈 배열 반환', async () => {
      mockPrismaService.diagnosisResult.findMany.mockResolvedValue([]);

      const result = await service.getDiagnosisHistory(studentId);

      expect(result.results).toHaveLength(0);
    });
  });
});
