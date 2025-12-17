import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('NewsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  const testUser = {
    email: `news-test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: '뉴스 테스트 사용자',
    role: 'STUDENT',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // 테스트 사용자 생성 및 로그인
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(testUser);
    
    accessToken = signupRes.body.accessToken;
  });

  afterAll(async () => {
    // 테스트 사용자 정리
    const prismaService = app.get<PrismaService>(PrismaService);
    try {
      await prismaService.user.deleteMany({
        where: { email: testUser.email },
      });
    } catch (e) {
      // 이미 삭제되었거나 없는 경우 무시
    }
    await app.close();
  });

  describe('GET /api/news', () => {
    it('WP11.1-2: 뉴스 목록 조회 (기본 페이지) - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/news')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('news');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('totalPages');
          expect(Array.isArray(res.body.news)).toBe(true);
        });
    });

    it('WP11.1-2: 페이지네이션 테스트 (10개씩)', () => {
      return request(app.getHttpServer())
        .get('/api/news?page=1&limit=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.news.length).toBeLessThanOrEqual(10);
          expect(res.body.page).toBe(1);
        });
    });

    it('WP11.1-3: 키워드 필터링 (과학고)', () => {
      return request(app.getHttpServer())
        .get('/api/news?keyword=과학고')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          // 필터링된 결과 확인 (빈 배열도 유효)
          expect(Array.isArray(res.body.news)).toBe(true);
        });
    });

    it('WP11.1-3: 키워드 필터링 (외고)', () => {
      return request(app.getHttpServer())
        .get('/api/news?keyword=외고')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.news)).toBe(true);
        });
    });

    it('WP11.1-4: 뉴스 검색', () => {
      return request(app.getHttpServer())
        .get('/api/news?search=입시')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.news)).toBe(true);
        });
    });

    it('인증 없이 뉴스 조회 - 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .get('/api/news')
        .expect(401);
    });
  });

  describe('뉴스 데이터 유효성', () => {
    it('뉴스 항목에 필수 필드 존재', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/news')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      if (response.body.news.length > 0) {
        const newsItem = response.body.news[0];
        expect(newsItem).toHaveProperty('id');
        expect(newsItem).toHaveProperty('title');
        expect(newsItem).toHaveProperty('link');
        expect(newsItem).toHaveProperty('source');
        expect(newsItem).toHaveProperty('publishedAt');
      }
    });

    it('뉴스 내용에 HTML 엔티티 없음', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/news')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      response.body.news.forEach((item: any) => {
        if (item.description) {
          expect(item.description).not.toContain('&nbsp;');
          expect(item.description).not.toContain('&amp;');
        }
      });
    });
  });
});

