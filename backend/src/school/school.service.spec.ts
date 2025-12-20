import { Test, TestingModule } from '@nestjs/testing';
import { SchoolService } from './school.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SchoolType, PublishStatus } from '../../generated/prisma';

describe('SchoolService', () => {
  let service: SchoolService;
  let prismaService: PrismaService;
  let cacheService: CacheService;

  const mockPrismaService = {
    school: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<SchoolService>(SchoolService);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheService = module.get<CacheService>(CacheService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSchool', () => {
    const createSchoolDto = {
      name: '서울외국어고등학교',
      type: SchoolType.FOREIGN_LANGUAGE,
      region: '서울',
    };

    it('학교 등록 성공', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(null);
      mockPrismaService.school.create.mockResolvedValue({
        id: 'school-1',
        ...createSchoolDto,
        publishStatus: PublishStatus.DRAFT,
      });

      const result = await service.createSchool(createSchoolDto);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('school');
      expect(result.message).toBe('학교가 등록되었습니다');
      expect(result.school.name).toBe(createSchoolDto.name);
    });

    it('이미 등록된 학교일 때 ConflictException', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue({
        id: 'existing-school',
        ...createSchoolDto,
      });

      await expect(service.createSchool(createSchoolDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getPublishedSchools', () => {
    const mockSchools = [
      { id: 'school-1', name: '서울외고', type: SchoolType.FOREIGN_LANGUAGE, region: '서울' },
      { id: 'school-2', name: '대원외고', type: SchoolType.FOREIGN_LANGUAGE, region: '서울' },
    ];

    it('전체 학교 목록 조회 성공', async () => {
      mockCacheService.get.mockReturnValue(null);
      mockPrismaService.school.findMany.mockResolvedValue(mockSchools);

      const result = await service.getPublishedSchools({});

      expect(result).toHaveProperty('schools');
      expect(result.schools).toHaveLength(2);
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('캐시된 결과 반환', async () => {
      mockCacheService.get.mockReturnValue({ schools: mockSchools });

      const result = await service.getPublishedSchools({});

      expect(result.schools).toHaveLength(2);
      expect(mockPrismaService.school.findMany).not.toHaveBeenCalled();
    });

    it('지역별 필터링', async () => {
      mockCacheService.get.mockReturnValue(null);
      mockPrismaService.school.findMany.mockResolvedValue([mockSchools[0]]);

      const result = await service.getPublishedSchools({ region: '서울' });

      expect(result.schools).toHaveLength(1);
      expect(mockPrismaService.school.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ region: '서울' }),
        }),
      );
    });

    it('학교 유형별 필터링', async () => {
      mockCacheService.get.mockReturnValue(null);
      mockPrismaService.school.findMany.mockResolvedValue(mockSchools);

      const result = await service.getPublishedSchools({ type: SchoolType.FOREIGN_LANGUAGE });

      expect(mockPrismaService.school.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: SchoolType.FOREIGN_LANGUAGE }),
        }),
      );
    });

    it('검색어로 필터링 (캐시 미사용)', async () => {
      mockPrismaService.school.findMany.mockResolvedValue([mockSchools[0]]);

      const result = await service.getPublishedSchools({ search: '서울' });

      expect(result.schools).toHaveLength(1);
      expect(mockCacheService.get).not.toHaveBeenCalled();
      expect(mockCacheService.set).not.toHaveBeenCalled();
    });
  });

  describe('getSchoolDetail', () => {
    const mockSchool = {
      id: 'school-1',
      name: '서울외국어고등학교',
      type: SchoolType.FOREIGN_LANGUAGE,
      region: '서울',
      admissions: [],
      schedules: [],
    };

    it('학교 상세 조회 성공', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(mockSchool);

      const result = await service.getSchoolDetail('school-1');

      expect(result).toHaveProperty('school');
      expect(result.school.name).toBe(mockSchool.name);
    });

    it('학교를 찾을 수 없을 때 NotFoundException', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(null);

      await expect(service.getSchoolDetail('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('publishSchool', () => {
    it('학교 게시 성공', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue({
        id: 'school-1',
        publishStatus: PublishStatus.DRAFT,
      });
      mockPrismaService.school.update.mockResolvedValue({
        id: 'school-1',
        publishStatus: PublishStatus.PUBLISHED,
      });

      const result = await service.publishSchool('school-1');

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('학교가 게시되었습니다');
    });

    it('학교를 찾을 수 없을 때 NotFoundException', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(null);

      await expect(service.publishSchool('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllSchools', () => {
    it('전체 학교 목록 조회 (상태 필터 없음)', async () => {
      mockPrismaService.school.findMany.mockResolvedValue([
        { id: 'school-1', publishStatus: PublishStatus.PUBLISHED },
        { id: 'school-2', publishStatus: PublishStatus.DRAFT },
      ]);

      const result = await service.getAllSchools();

      expect(result.schools).toHaveLength(2);
    });

    it('상태별 필터링', async () => {
      mockPrismaService.school.findMany.mockResolvedValue([
        { id: 'school-1', publishStatus: PublishStatus.PUBLISHED },
      ]);

      const result = await service.getAllSchools(PublishStatus.PUBLISHED);

      expect(mockPrismaService.school.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { publishStatus: PublishStatus.PUBLISHED },
        }),
      );
    });
  });
});



