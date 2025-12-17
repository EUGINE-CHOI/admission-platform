import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';

// axios 모킹
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: '' }),
  head: jest.fn().mockResolvedValue({ request: { res: { responseUrl: 'http://example.com' } } }),
}));

describe('NewsService', () => {
  let service: NewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewsService],
    }).compile();

    service = module.get<NewsService>(NewsService);
    
    // 캐시에 샘플 데이터 설정
    (service as any).cachedNews = [
      {
        id: 'news-1',
        title: '2025학년도 과학고 입학전형 주요 일정 안내',
        description: '과학고 입시 관련 뉴스',
        link: 'http://example.com/news1',
        source: '교육부',
        publishedAt: new Date().toISOString(),
        keyword: '과학고',
      },
      {
        id: 'news-2',
        title: '외고 입시 전형 안내',
        description: '외고 입시 관련 뉴스',
        link: 'http://example.com/news2',
        source: '교육청',
        publishedAt: new Date().toISOString(),
        keyword: '외고',
      },
    ];
    (service as any).lastFetchTime = Date.now();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNews', () => {
    it('뉴스 목록 조회 - 기본 페이지네이션', async () => {
      const result = await service.getNews(undefined, 1, 10);

      expect(result).toHaveProperty('news');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('keywords');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(Array.isArray(result.news)).toBe(true);
    });

    it('뉴스 목록 조회 - 키워드 필터링', async () => {
      const result = await service.getNews('외고', 1, 10);

      expect(result).toHaveProperty('news');
      expect(result.page).toBe(1);
      expect(Array.isArray(result.news)).toBe(true);
      // 필터링된 결과 확인
      result.news.forEach(news => {
        expect(news.keyword === '외고' || news.title.includes('외고')).toBe(true);
      });
    });

    it('뉴스 목록 조회 - 2페이지', async () => {
      const result = await service.getNews(undefined, 2, 10);

      expect(result.page).toBe(2);
    });
  });

  describe('getKeywords', () => {
    it('키워드 목록 반환', () => {
      const keywords = service.getKeywords();

      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords).toContain('외고');
      expect(keywords).toContain('과학고');
    });
  });
});
