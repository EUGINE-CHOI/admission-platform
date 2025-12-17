import { Test, TestingModule } from '@nestjs/testing';
import { FamilyService } from './family.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('FamilyService', () => {
  let service: FamilyService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    family: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    inviteCode: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    grade: {
      findMany: jest.fn(),
    },
    activity: {
      findMany: jest.fn(),
    },
    targetSchool: {
      findMany: jest.fn(),
    },
    diagnosisResult: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockNotificationService = {
    notifyFamilyMemberJoined: jest.fn(),
    createMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FamilyService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<FamilyService>(FamilyService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFamily', () => {
    const userId = 'user-1';

    it('가족 생성 성공', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        name: '테스트 부모',
        role: 'PARENT',
        familyId: null,
      });
      mockPrismaService.family.create.mockResolvedValue({
        id: 'family-1',
        name: '테스트 부모의 가족',
        members: [{ id: userId, name: '테스트 부모', role: 'PARENT', email: 'parent@test.com' }],
      });

      const result = await service.createFamily(userId);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('family');
      expect(result.message).toBe('가족이 생성되었습니다');
    });

    it('사용자를 찾을 수 없을 때 NotFoundException', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.createFamily(userId)).rejects.toThrow(NotFoundException);
    });

    it('이미 가족에 속해 있을 때 ConflictException', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        name: '테스트 부모',
        familyId: 'existing-family',
      });

      await expect(service.createFamily(userId)).rejects.toThrow(ConflictException);
    });
  });

  describe('getMyFamily', () => {
    const userId = 'user-1';

    it('가족 정보 조회 성공', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        familyId: 'family-1',
      });
      mockPrismaService.family.findUnique.mockResolvedValue({
        id: 'family-1',
        name: '테스트 가족',
        members: [
          { id: userId, name: '부모', role: 'PARENT', email: 'parent@test.com' },
          { id: 'child-1', name: '학생', role: 'STUDENT', email: 'student@test.com' },
        ],
        inviteCodes: [],
      });

      const result = await service.getMyFamily(userId);

      expect(result).toHaveProperty('family');
      expect(result).toHaveProperty('stats');
      if (result.stats) {
        expect(result.stats.memberCount).toBe(2);
        expect(result.stats.studentCount).toBe(1);
      }
    });

    it('가족에 속해 있지 않을 때', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        familyId: null,
      });

      const result = await service.getMyFamily(userId);

      expect(result.family).toBeNull();
      expect(result.message).toBe('가족에 속해 있지 않습니다');
    });
  });

  describe('createInviteCode', () => {
    const userId = 'user-1';

    it('초대 코드 생성 성공', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        familyId: 'family-1',
        role: 'PARENT',
      });
      mockPrismaService.inviteCode.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.inviteCode.create.mockResolvedValue({
        code: 'ABC123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const result = await service.createInviteCode(userId);

      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('expiresAt');
      expect(result.code).toHaveLength(6);
    });

    it('가족이 없을 때 BadRequestException', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        familyId: null,
      });

      await expect(service.createInviteCode(userId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('joinFamilyByCode', () => {
    const userId = 'student-1';
    const inviteCode = 'ABC123';

    it('초대 코드로 가족 참여 성공', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        name: '학생',
        familyId: null,
      });
      mockPrismaService.inviteCode.findFirst.mockResolvedValue({
        id: 'invite-1',
        code: inviteCode,
        familyId: 'family-1',
        family: { id: 'family-1', name: '테스트 가족' },
        createdBy: { name: '부모' },
      });
      mockPrismaService.$transaction.mockResolvedValue([{}, {}]);

      const result = await service.joinFamilyByCode(userId, inviteCode);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('familyId');
      expect(result.familyId).toBe('family-1');
    });

    it('유효하지 않은 초대 코드일 때 BadRequestException', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        name: '학생',
        familyId: null,
      });
      mockPrismaService.inviteCode.findFirst.mockResolvedValue(null);

      await expect(service.joinFamilyByCode(userId, 'INVALID')).rejects.toThrow(BadRequestException);
    });

    it('이미 가족에 속해 있을 때 ConflictException', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        name: '학생',
        familyId: 'other-family',
      });

      await expect(service.joinFamilyByCode(userId, inviteCode)).rejects.toThrow(ConflictException);
    });
  });

  describe('getChildren', () => {
    const parentId = 'parent-1';

    it('자녀 목록 조회 성공', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: parentId,
        familyId: 'family-1',
        role: 'PARENT',
      });
      mockPrismaService.user.findMany.mockResolvedValue([
        { id: 'child-1', name: '학생1', email: 'student1@test.com', role: 'STUDENT' },
        { id: 'child-2', name: '학생2', email: 'student2@test.com', role: 'STUDENT' },
      ]);

      const result = await service.getChildren(parentId);

      expect(result).toHaveProperty('children');
      expect(result.children).toHaveLength(2);
    });

    it('학부모가 아닐 때 BadRequestException', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: parentId,
        role: 'STUDENT',
      });

      await expect(service.getChildren(parentId)).rejects.toThrow(BadRequestException);
    });
  });
});
