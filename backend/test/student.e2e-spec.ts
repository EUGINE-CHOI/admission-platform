import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('StudentController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;
  let userId: string;

  const testUser = {
    email: `student-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: '테스트 학생',
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
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    try {
      await prismaService.grade.deleteMany({ where: { userId } });
      await prismaService.activity.deleteMany({ where: { userId } });
      await prismaService.readingLog.deleteMany({ where: { userId } });
      await prismaService.user.delete({ where: { id: userId } });
    } catch (e) {
      // 이미 삭제되었거나 없는 경우 무시
    }
    await app.close();
  });

  describe('POST /api/student/grades', () => {
    it('WP2.1-1: 유효한 성적 저장 - 201 Created', () => {
      return request(app.getHttpServer())
        .post('/api/student/grades')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          subject: '국어',
          year: 2024,
          semester: 1,
          written: 95,
          performance: 90,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.subject).toBe('국어');
          expect(res.body.written).toBe(95);
        });
    });

    it('WP2.1-2: 점수 범위 오류 (150점) - 400 Bad Request', () => {
      return request(app.getHttpServer())
        .post('/api/student/grades')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          subject: '수학',
          year: 2024,
          semester: 1,
          written: 150,
          performance: 90,
        })
        .expect(400);
    });

    it('WP2.1-2: 점수 범위 오류 (음수) - 400 Bad Request', () => {
      return request(app.getHttpServer())
        .post('/api/student/grades')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          subject: '수학',
          year: 2024,
          semester: 1,
          written: -10,
          performance: 90,
        })
        .expect(400);
    });

    it('인증 없이 성적 저장 - 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .post('/api/student/grades')
        .send({
          subject: '영어',
          year: 2024,
          semester: 1,
          written: 88,
          performance: 85,
        })
        .expect(401);
    });
  });

  describe('GET /api/student/grades', () => {
    it('성적 목록 조회 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/student/grades')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('POST /api/student/activities', () => {
    it('WP2.2-1: 활동 저장 성공 - 201 Created', () => {
      return request(app.getHttpServer())
        .post('/api/student/activities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '과학 동아리',
          type: 'CLUB',
          content: '물리 실험 활동 참여',
          startDate: '2024-03-01',
          endDate: '2024-12-31',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe('과학 동아리');
          expect(res.body.type).toBe('CLUB');
        });
    });

    it('WP2.2-2: 활동명 누락 - 400 Bad Request', () => {
      return request(app.getHttpServer())
        .post('/api/student/activities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          type: 'CLUB',
          content: '활동 내용',
          startDate: '2024-03-01',
        })
        .expect(400);
    });
  });

  describe('GET /api/student/activities', () => {
    it('활동 목록 조회 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/student/activities')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('POST /api/student/reading-logs', () => {
    it('WP2.3-1: 독서 기록 저장 - 201 Created', () => {
      return request(app.getHttpServer())
        .post('/api/student/reading-logs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          bookTitle: '코스모스',
          author: '칼 세이건',
          readDate: '2024-06-15',
          review: '우주에 대한 깊은 통찰을 제공하는 책',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.bookTitle).toBe('코스모스');
        });
    });

    it('WP2.3-2: 중복 기록 - 409 Conflict', () => {
      return request(app.getHttpServer())
        .post('/api/student/reading-logs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          bookTitle: '코스모스',
          author: '칼 세이건',
          readDate: '2024-06-15',
          review: '중복 기록',
        })
        .expect(409);
    });
  });

  describe('GET /api/student/reading-logs', () => {
    it('독서 기록 목록 조회 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/student/reading-logs')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /api/student/profile', () => {
    it('학생 프로필 조회 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/student/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.name).toBe(testUser.name);
        });
    });
  });
});

