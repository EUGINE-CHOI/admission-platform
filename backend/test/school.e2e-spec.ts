import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('SchoolController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let adminToken: string;
  let studentToken: string;
  let testSchoolId: string;

  const adminUser = {
    email: `admin-school-${Date.now()}@example.com`,
    password: 'AdminPassword123!',
    name: '관리자',
    role: 'ADMIN',
  };

  const studentUser = {
    email: `student-school-${Date.now()}@example.com`,
    password: 'StudentPassword123!',
    name: '학생',
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

    // 관리자 생성 및 로그인
    const adminRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(adminUser);
    adminToken = adminRes.body.accessToken;

    // 학생 생성 및 로그인
    const studentRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(studentUser);
    studentToken = studentRes.body.accessToken;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    try {
      if (testSchoolId) {
        await prismaService.school.delete({ where: { id: testSchoolId } });
      }
      await prismaService.user.deleteMany({
        where: { email: { in: [adminUser.email, studentUser.email] } },
      });
    } catch (e) {
      // 이미 삭제되었거나 없는 경우 무시
    }
    await app.close();
  });

  describe('GET /api/schools', () => {
    it('학교 목록 조회 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/schools')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('schools');
          expect(Array.isArray(res.body.schools)).toBe(true);
        });
    });

    it('지역별 필터링 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/schools?region=서울')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('schools');
          // 서울 지역 학교만 반환되어야 함
          res.body.schools.forEach((school: any) => {
            expect(school.region).toBe('서울');
          });
        });
    });

    it('학교 유형별 필터링 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/schools?type=FOREIGN_LANGUAGE')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('schools');
          res.body.schools.forEach((school: any) => {
            expect(school.type).toBe('FOREIGN_LANGUAGE');
          });
        });
    });

    it('검색어로 필터링 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/schools?search=외고')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('schools');
        });
    });

    it('인증 없이 조회 - 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .get('/api/schools')
        .expect(401);
    });
  });

  describe('GET /api/schools/:id', () => {
    let existingSchoolId: string;

    beforeAll(async () => {
      // 기존 학교 ID 가져오기
      const school = await prismaService.school.findFirst({
        where: { publishStatus: 'PUBLISHED' },
      });
      if (school) {
        existingSchoolId = school.id;
      }
    });

    it('학교 상세 조회 - 200 OK', async () => {
      if (!existingSchoolId) {
        console.log('게시된 학교가 없어 스킵');
        return;
      }

      return request(app.getHttpServer())
        .get(`/api/schools/${existingSchoolId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('school');
          expect(res.body.school.id).toBe(existingSchoolId);
        });
    });

    it('존재하지 않는 학교 조회 - 404 Not Found', () => {
      return request(app.getHttpServer())
        .get('/api/schools/non-existent-id')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });
  });

  describe('POST /api/schools/favorite', () => {
    let schoolId: string;

    beforeAll(async () => {
      const school = await prismaService.school.findFirst({
        where: { publishStatus: 'PUBLISHED' },
      });
      if (school) {
        schoolId = school.id;
      }
    });

    it('관심 학교 추가 - 201 Created', async () => {
      if (!schoolId) {
        console.log('게시된 학교가 없어 스킵');
        return;
      }

      return request(app.getHttpServer())
        .post('/api/schools/favorite')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ schoolId })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('중복 관심 학교 추가 - 409 Conflict', async () => {
      if (!schoolId) {
        console.log('게시된 학교가 없어 스킵');
        return;
      }

      return request(app.getHttpServer())
        .post('/api/schools/favorite')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ schoolId })
        .expect(409);
    });
  });

  describe('GET /api/schools/favorites', () => {
    it('관심 학교 목록 조회 - 200 OK', () => {
      return request(app.getHttpServer())
        .get('/api/schools/favorites')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Admin: POST /api/admin/schools', () => {
    const newSchool = {
      name: `테스트학교-${Date.now()}`,
      type: 'SCIENCE',
      region: '서울',
      description: '테스트용 학교입니다',
    };

    it('관리자 - 학교 등록 - 201 Created', () => {
      return request(app.getHttpServer())
        .post('/api/admin/schools')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newSchool)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('school');
          expect(res.body.school.name).toBe(newSchool.name);
          testSchoolId = res.body.school.id;
        });
    });

    it('학생 - 학교 등록 시도 - 403 Forbidden', () => {
      return request(app.getHttpServer())
        .post('/api/admin/schools')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(newSchool)
        .expect(403);
    });

    it('중복 학교 등록 - 409 Conflict', () => {
      return request(app.getHttpServer())
        .post('/api/admin/schools')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newSchool)
        .expect(409);
    });
  });

  describe('Admin: PATCH /api/admin/schools/:id/publish', () => {
    it('관리자 - 학교 게시 - 200 OK', async () => {
      if (!testSchoolId) {
        console.log('테스트 학교가 없어 스킵');
        return;
      }

      return request(app.getHttpServer())
        .patch(`/api/admin/schools/${testSchoolId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('게시');
        });
    });

    it('학생 - 학교 게시 시도 - 403 Forbidden', async () => {
      if (!testSchoolId) {
        console.log('테스트 학교가 없어 스킵');
        return;
      }

      return request(app.getHttpServer())
        .patch(`/api/admin/schools/${testSchoolId}/publish`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });
});



