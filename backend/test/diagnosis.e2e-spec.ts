import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('DiagnosisController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;
  let userId: string;

  const testUser = {
    email: `diagnosis-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: '진단 테스트 학생',
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

    prismaService = app.get<PrismaService>(PrismaService);

    // 테스트 사용자 생성 및 로그인
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(testUser);
    
    accessToken = signupRes.body.accessToken;
    userId = signupRes.body.user.id;

    // 테스트용 성적 데이터 입력
    await request(app.getHttpServer())
      .post('/api/student/grades')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        subject: '국어',
        year: 2024,
        semester: 1,
        written: 95,
        performance: 92,
      });

    await request(app.getHttpServer())
      .post('/api/student/grades')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        subject: '수학',
        year: 2024,
        semester: 1,
        written: 98,
        performance: 95,
      });

    await request(app.getHttpServer())
      .post('/api/student/grades')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        subject: '영어',
        year: 2024,
        semester: 1,
        written: 90,
        performance: 88,
      });
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    try {
      await prismaService.diagnosisResult.deleteMany({ where: { userId } });
      await prismaService.targetSchool.deleteMany({ where: { userId } });
      await prismaService.grade.deleteMany({ where: { userId } });
      await prismaService.activity.deleteMany({ where: { userId } });
      await prismaService.user.delete({ where: { id: userId } });
    } catch (e) {
      // 이미 삭제되었거나 없는 경우 무시
    }
    await app.close();
  });

  describe('POST /api/diagnosis/target-schools', () => {
    let schoolId: string;

    beforeAll(async () => {
      // 테스트용 학교 찾기
      const school = await prismaService.school.findFirst({
        where: { type: 'SCIENCE' },
      });
      if (school) {
        schoolId = school.id;
      }
    });

    it('목표 학교 추가 - 201 Created', async () => {
      if (!schoolId) {
        console.log('테스트 학교가 없어 스킵');
        return;
      }

      return request(app.getHttpServer())
        .post('/api/diagnosis/target-schools')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ schoolId, priority: 1 })
        .expect(201)
        .expect((res) => {
          expect(res.body.schoolId).toBe(schoolId);
          expect(res.body.priority).toBe(1);
        });
    });

    it('중복 목표 학교 추가 - 409 Conflict', async () => {
      if (!schoolId) {
        console.log('테스트 학교가 없어 스킵');
        return;
      }

      return request(app.getHttpServer())
        .post('/api/diagnosis/target-schools')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ schoolId, priority: 2 })
        .expect(409);
    });
  });

  describe('GET /api/diagnosis/target-schools', () => {
    it('목표 학교 목록 조회 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/diagnosis/target-schools')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('POST /api/diagnosis/run', () => {
    it('WP4.1-1: 진단 실행 - 201 Created', () => {
      return request(app.getHttpServer())
        .post('/api/diagnosis/run')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('analysisData');
          // FIT, CHALLENGE, UNLIKELY 중 하나
          if (res.body.schoolDiagnoses && res.body.schoolDiagnoses.length > 0) {
            expect(['FIT', 'CHALLENGE', 'UNLIKELY']).toContain(
              res.body.schoolDiagnoses[0].level,
            );
          }
        });
    });

    it('인증 없이 진단 실행 - 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .post('/api/diagnosis/run')
        .expect(401);
    });
  });

  describe('GET /api/diagnosis/results', () => {
    it('진단 결과 목록 조회 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/diagnosis/results')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /api/diagnosis/results/latest', () => {
    it('최신 진단 결과 조회 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/diagnosis/results/latest')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('analysisData');
        });
    });
  });

  describe('GET /api/diagnosis/recommendations', () => {
    it('WP4.3-1: 추천 학교 조회 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/diagnosis/recommendations')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          // 추천 학교가 있으면 최대 3개
          expect(res.body.length).toBeLessThanOrEqual(3);
        });
    });
  });
});

