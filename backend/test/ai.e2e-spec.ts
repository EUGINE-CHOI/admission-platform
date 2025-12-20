import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AIController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;
  let userId: string;
  let activityId: string;
  let aiOutputId: string;

  const testUser = {
    email: `ai-test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'AI 테스트 학생',
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

    // 테스트용 활동 데이터 생성
    const activityRes = await request(app.getHttpServer())
      .post('/api/student/activities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'AI 테스트용 과학 동아리',
        type: 'CLUB',
        content: '물리 실험과 과학 탐구 활동에 참여하여 과학적 사고력을 기름',
        startDate: '2024-03-01',
        endDate: '2024-12-31',
      });
    
    if (activityRes.body.activity) {
      activityId = activityRes.body.activity.id;
    }
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    try {
      await prismaService.aIFeedback.deleteMany({ where: { userId } });
      await prismaService.aIOutput.deleteMany({ where: { studentId: userId } });
      await prismaService.activity.deleteMany({ where: { studentId: userId } });
      await prismaService.user.delete({ where: { id: userId } });
    } catch (e) {
      // 이미 삭제되었거나 없는 경우 무시
    }
    await app.close();
  });

  describe('GET /api/ai/health', () => {
    it('AI 서비스 상태 확인 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/ai/health')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          // mock 또는 connected
          expect(['mock', 'connected']).toContain(res.body.status);
        });
    });
  });

  describe('POST /api/ai/record-sentence', () => {
    it('WP5.2-1: 생기부 문장 생성 - 201 Created', async () => {
      if (!activityId) {
        console.log('활동 ID가 없어 스킵');
        return;
      }

      return request(app.getHttpServer())
        .post('/api/ai/record-sentence')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ activityId })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('sentence');
          expect(res.body).toHaveProperty('aiOutput');
          aiOutputId = res.body.aiOutput.id;
        });
    });

    it('존재하지 않는 활동 ID - 404 Not Found', () => {
      return request(app.getHttpServer())
        .post('/api/ai/record-sentence')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ activityId: 'non-existent-id' })
        .expect(404);
    });

    it('인증 없이 요청 - 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .post('/api/ai/record-sentence')
        .send({ activityId })
        .expect(401);
    });
  });

  describe('POST /api/ai/quick-advice', () => {
    it('WP13.1: 빠른 조언 요청 - 201 Created', () => {
      return request(app.getHttpServer())
        .post('/api/ai/quick-advice')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          question: '영어 성적을 올리려면 어떻게 해야 하나요?',
          category: 'STUDY',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('advice');
          expect(res.body).toHaveProperty('followUpQuestions');
          expect(Array.isArray(res.body.followUpQuestions)).toBe(true);
        });
    });

    it('카테고리 없이 요청 - 201 Created (기본값 사용)', () => {
      return request(app.getHttpServer())
        .post('/api/ai/quick-advice')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          question: '과학고에 가려면 무엇을 준비해야 하나요?',
        })
        .expect(201);
    });
  });

  describe('POST /api/ai/club-recommendation', () => {
    it('WP5.3-1: 동아리 추천 - 201 Created', () => {
      return request(app.getHttpServer())
        .post('/api/ai/club-recommendation')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          interests: ['과학', '수학'],
          targetSchoolType: 'SCIENCE',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('recommendations');
        });
    });
  });

  describe('POST /api/ai/subject-advice', () => {
    it('WP5.4-1: 교과 조언 - 201 Created', () => {
      return request(app.getHttpServer())
        .post('/api/ai/subject-advice')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          subject: '수학',
          currentScore: 85,
          targetScore: 95,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('advice');
        });
    });
  });

  describe('POST /api/ai/reading-recommendation', () => {
    it('WP5.5-1: 독서 추천 - 201 Created', () => {
      return request(app.getHttpServer())
        .post('/api/ai/reading-recommendation')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          interests: ['과학', '우주'],
          targetSchoolType: 'SCIENCE',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('recommendations');
        });
    });
  });

  describe('GET /api/ai/history', () => {
    it('AI 사용 히스토리 조회 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/ai/history')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('outputs');
          expect(Array.isArray(res.body.outputs)).toBe(true);
        });
    });

    it('타입별 필터링 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/ai/history?type=RECORD_SENTENCE')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('outputs');
          res.body.outputs.forEach((output: any) => {
            expect(output.type).toBe('RECORD_SENTENCE');
          });
        });
    });
  });

  describe('POST /api/ai/feedback', () => {
    it('AI 출력에 피드백 제출 (LIKE) - 201 Created', async () => {
      if (!aiOutputId) {
        console.log('AI Output ID가 없어 스킵');
        return;
      }

      return request(app.getHttpServer())
        .post('/api/ai/feedback')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          outputId: aiOutputId,
          type: 'LIKE',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('feedback');
          expect(res.body).toHaveProperty('message');
        });
    });

    it('존재하지 않는 출력에 피드백 - 404 Not Found', () => {
      return request(app.getHttpServer())
        .post('/api/ai/feedback')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          outputId: 'non-existent-id',
          type: 'LIKE',
        })
        .expect(404);
    });
  });

  describe('POST /api/ai/comprehensive-analysis', () => {
    it('WP13.2: 종합 분석 요청 - 201 Created', () => {
      return request(app.getHttpServer())
        .post('/api/ai/comprehensive-analysis')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('analysis');
        });
    });
  });
});

