import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AIOutputType, FeedbackType, ApprovalStatus } from '../../generated/prisma';

describe('AiService', () => {
  let service: AiService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    grade: {
      findMany: jest.fn(),
    },
    activity: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    readingLog: {
      findMany: jest.fn(),
    },
    volunteer: {
      findMany: jest.fn(),
    },
    targetSchool: {
      findMany: jest.fn(),
    },
    diagnosisResult: {
      findFirst: jest.fn(),
    },
    aIOutput: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    aIFeedback: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        GEMINI_API_KEY: '', // 빈 키로 모킹 모드
        GEMINI_MODEL: 'gemini-2.0-flash',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('API 키가 없으면 mock 모드 반환', async () => {
      const result = await service.checkHealth();

      expect(result).toHaveProperty('status');
      expect(result.status).toBe('mock');
    });
  });

  describe('generateRecordSentence', () => {
    const studentId = 'student-1';
    const dto = {
      activityId: 'activity-1',
    };

    const mockActivity = {
      id: 'activity-1',
      title: '과학 동아리',
      type: 'CLUB',
      content: '물리 실험 활동 참여',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-12-31'),
    };

    it('활동이 없으면 NotFoundException', async () => {
      mockPrismaService.activity.findUnique.mockResolvedValue(null);

      await expect(service.generateRecordSentence(studentId, dto)).rejects.toThrow(NotFoundException);
    });

    it('활동이 있으면 생기부 문장 생성 (모킹 모드)', async () => {
      mockPrismaService.activity.findUnique.mockResolvedValue(mockActivity);
      mockPrismaService.aIOutput.create.mockResolvedValue({
        id: 'output-1',
        type: AIOutputType.RECORD_SENTENCE,
        response: '모의 생성된 문장입니다.',
      });

      const result = await service.generateRecordSentence(studentId, dto);

      expect(result).toHaveProperty('sentence');
      expect(result).toHaveProperty('aiOutput');
    });
  });

  describe('createFeedback', () => {
    const userId = 'user-1';
    const outputId = 'output-1';
    const dto = {
      type: FeedbackType.LIKE,
    };

    it('피드백 생성 성공', async () => {
      mockPrismaService.aIOutput.findUnique.mockResolvedValue({
        id: outputId,
        studentId: userId,
      });
      mockPrismaService.aIFeedback.findUnique.mockResolvedValue(null);
      mockPrismaService.aIFeedback.create.mockResolvedValue({
        id: 'feedback-1',
        outputId,
        ...dto,
        userId,
      });

      const result = await service.createFeedback(userId, outputId, dto);

      expect(result).toHaveProperty('feedback');
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('피드백이 등록되었습니다');
    });

    it('AI 출력이 없으면 NotFoundException', async () => {
      mockPrismaService.aIOutput.findUnique.mockResolvedValue(null);

      await expect(service.createFeedback(userId, outputId, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRecordSentenceHistory', () => {
    const studentId = 'student-1';

    it('AI 히스토리 조회 성공', async () => {
      mockPrismaService.aIOutput.findMany.mockResolvedValue([
        { id: 'output-1', type: AIOutputType.RECORD_SENTENCE, createdAt: new Date() },
        { id: 'output-2', type: AIOutputType.RECORD_SENTENCE, createdAt: new Date() },
      ]);

      const result = await service.getRecordSentenceHistory(studentId);

      expect(result).toHaveProperty('history');
    });

    it('제한 개수 적용', async () => {
      mockPrismaService.aIOutput.findMany.mockResolvedValue([
        { id: 'output-1', type: AIOutputType.RECORD_SENTENCE, createdAt: new Date() },
      ]);

      await service.getRecordSentenceHistory(studentId, 5);

      expect(mockPrismaService.aIOutput.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        }),
      );
    });
  });

  describe('generateComprehensiveAnalysis', () => {
    const studentId = 'student-1';

    const mockStudent = {
      id: studentId,
      name: '테스트 학생',
      grade: 3,
      middleSchool: { name: '테스트중학교' },
    };

    it('학생이 없으면 BadRequestException', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.grade.findMany.mockResolvedValue([]);
      mockPrismaService.activity.findMany.mockResolvedValue([]);
      mockPrismaService.readingLog.findMany.mockResolvedValue([]);
      mockPrismaService.volunteer.findMany.mockResolvedValue([]);
      mockPrismaService.targetSchool.findMany.mockResolvedValue([]);
      mockPrismaService.diagnosisResult.findFirst.mockResolvedValue(null);

      await expect(service.generateComprehensiveAnalysis(studentId)).rejects.toThrow(BadRequestException);
    });

    it('학생 데이터가 있으면 종합 분석 생성 (모킹 모드)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockStudent);
      mockPrismaService.grade.findMany.mockResolvedValue([
        { subject: '국어', year: 2024, semester: 1, rank: 2, written: 95, performance: 90 },
      ]);
      mockPrismaService.activity.findMany.mockResolvedValue([
        { type: 'CLUB', title: '과학동아리' },
      ]);
      mockPrismaService.readingLog.findMany.mockResolvedValue([]);
      mockPrismaService.volunteer.findMany.mockResolvedValue([{ hours: 10 }]);
      mockPrismaService.targetSchool.findMany.mockResolvedValue([]);
      mockPrismaService.diagnosisResult.findFirst.mockResolvedValue(null);
      mockPrismaService.aIOutput.create.mockResolvedValue({
        id: 'output-1',
        type: AIOutputType.DIAGNOSIS,
      });

      const result = await service.generateComprehensiveAnalysis(studentId);

      expect(result).toHaveProperty('analysis');
    });
  });

  describe('generateQuickAdvice', () => {
    const studentId = 'student-1';
    const topic = '영어 성적 향상';

    it('빠른 조언 생성 성공 (모킹 모드)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: studentId,
        name: '테스트 학생',
        grade: 3,
        middleSchool: { name: '테스트중' },
      });
      mockPrismaService.grade.findMany.mockResolvedValue([]);
      mockPrismaService.aIOutput.create.mockResolvedValue({
        id: 'output-1',
        type: AIOutputType.SUBJECT_ADVICE,
      });

      const result = await service.generateQuickAdvice(studentId, topic);

      expect(result).toHaveProperty('advice');
      expect(result).toHaveProperty('followUpQuestions');
    });
  });
});

