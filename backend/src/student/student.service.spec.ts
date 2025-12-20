import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { ActivityType, ApprovalStatus } from '../../generated/prisma';

describe('StudentService', () => {
  let service: StudentService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    grade: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    activity: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    readingLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGrade', () => {
    const studentId = 'student-1';
    const gradeDto = {
      subject: '국어',
      year: 2024,
      semester: 1,
      written1: 95,
      written2: 92,
      performance: 90,
      rank: 2,
    };

    it('성적 입력 성공', async () => {
      mockPrismaService.grade.findUnique.mockResolvedValue(null);
      mockPrismaService.grade.create.mockResolvedValue({
        id: 'grade-1',
        ...gradeDto,
        studentId,
      });

      const result = await service.createGrade(studentId, gradeDto);

      expect(result).toHaveProperty('grade');
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('성적이 저장되었습니다');
      expect(result.grade.subject).toBe(gradeDto.subject);
      expect(mockPrismaService.grade.create).toHaveBeenCalled();
    });

    it('이미 등록된 성적일 때 ConflictException', async () => {
      mockPrismaService.grade.findUnique.mockResolvedValue({
        id: 'existing-grade',
        studentId,
        ...gradeDto,
      });

      await expect(service.createGrade(studentId, gradeDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getGrades', () => {
    const studentId = 'student-1';

    it('성적 목록 조회 성공', async () => {
      mockPrismaService.grade.findMany.mockResolvedValue([
        { id: 'grade-1', subject: '국어', year: 2024, semester: 1, written: 95, performance: 90 },
        { id: 'grade-2', subject: '수학', year: 2024, semester: 1, written: 88, performance: 85 },
      ]);

      const result = await service.getGrades(studentId);

      expect(result).toHaveProperty('grades');
      expect(result.grades).toHaveLength(2);
    });
  });

  describe('updateGrade', () => {
    const studentId = 'student-1';
    const gradeId = 'grade-1';
    const updateDto = { written: 98, performance: 95 };

    it('성적 수정 성공', async () => {
      mockPrismaService.grade.findUnique.mockResolvedValue({
        id: gradeId,
        studentId,
        subject: '국어',
      });
      mockPrismaService.grade.update.mockResolvedValue({
        id: gradeId,
        studentId,
        ...updateDto,
        status: ApprovalStatus.PENDING,
      });

      const result = await service.updateGrade(studentId, gradeId, updateDto);

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('성적이 수정되었습니다');
    });

    it('성적을 찾을 수 없을 때 NotFoundException', async () => {
      mockPrismaService.grade.findUnique.mockResolvedValue(null);

      await expect(service.updateGrade(studentId, gradeId, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('다른 학생의 성적 수정 시 ForbiddenException', async () => {
      mockPrismaService.grade.findUnique.mockResolvedValue({
        id: gradeId,
        studentId: 'other-student',
      });

      await expect(service.updateGrade(studentId, gradeId, updateDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteGrade', () => {
    const studentId = 'student-1';
    const gradeId = 'grade-1';

    it('성적 삭제 성공', async () => {
      mockPrismaService.grade.findUnique.mockResolvedValue({
        id: gradeId,
        studentId,
      });
      mockPrismaService.grade.delete.mockResolvedValue({});

      const result = await service.deleteGrade(studentId, gradeId);

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('성적이 삭제되었습니다');
    });

    it('성적을 찾을 수 없을 때 NotFoundException', async () => {
      mockPrismaService.grade.findUnique.mockResolvedValue(null);

      await expect(service.deleteGrade(studentId, gradeId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createActivity', () => {
    const studentId = 'student-1';
    const activityDto = {
      title: '과학 동아리',
      type: ActivityType.CLUB,
      content: '과학 실험 및 탐구 활동',
      startDate: '2024-03-01',
    };

    it('활동 입력 성공', async () => {
      mockPrismaService.activity.create.mockResolvedValue({
        id: 'activity-1',
        ...activityDto,
        startDate: new Date(activityDto.startDate),
        studentId,
      });

      const result = await service.createActivity(studentId, activityDto);

      expect(result).toHaveProperty('activity');
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('활동이 저장되었습니다');
      expect(result.activity.title).toBe(activityDto.title);
      expect(mockPrismaService.activity.create).toHaveBeenCalled();
    });
  });

  describe('getActivities', () => {
    const studentId = 'student-1';

    it('활동 목록 조회 성공', async () => {
      mockPrismaService.activity.findMany.mockResolvedValue([
        { id: 'act-1', title: '과학동아리', type: ActivityType.CLUB },
        { id: 'act-2', title: '봉사활동', type: ActivityType.VOLUNTEER },
      ]);

      const result = await service.getActivities(studentId);

      expect(result).toHaveProperty('activities');
      expect(result.activities).toHaveLength(2);
    });
  });
});
