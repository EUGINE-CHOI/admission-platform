import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('DashboardController (e2e)', () => {
  let app: INestApplication;
  let studentToken: string;
  let parentToken: string;

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

    // 테스트 계정으로 로그인
    const studentLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'student@test.com', password: 'password123' });
    studentToken = studentLogin.body.accessToken;

    const parentLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'parent@test.com', password: 'password123' });
    parentToken = parentLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/dashboard/admissions', () => {
    it('학생이 입시 일정 캘린더 조회 - 200 OK', async () => {
      if (!studentToken) return; // 테스트 계정이 없으면 스킵

      const response = await request(app.getHttpServer())
        .get('/api/dashboard/admissions')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('보호자가 입시 일정 캘린더 조회 - 200 OK', async () => {
      if (!parentToken) return;

      const response = await request(app.getHttpServer())
        .get('/api/dashboard/admissions')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('인증 없이 조회 - 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard/admissions')
        .expect(401);
    });
  });

  describe('GET /api/dashboard/admissions/upcoming', () => {
    it('다가오는 일정 조회 (기본 30일) - 200 OK', async () => {
      if (!studentToken) return;

      const response = await request(app.getHttpServer())
        .get('/api/dashboard/admissions/upcoming')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('다가오는 일정 조회 (60일) - 200 OK', async () => {
      if (!studentToken) return;

      const response = await request(app.getHttpServer())
        .get('/api/dashboard/admissions/upcoming?days=60')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/dashboard/stats', () => {
    it('학생 대시보드 통계 조회 - 200 OK', async () => {
      if (!studentToken) return;

      const response = await request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalActivities');
      expect(response.body).toHaveProperty('totalReadingLogs');
      expect(response.body).toHaveProperty('totalTargetSchools');
    });
  });
});

