import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 활성화 - 개발 환경에서는 모든 origin 허용
  app.enableCors({
    origin: true, // 모든 origin 허용 (개발용)
    credentials: true,
  });

  // 전역 Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API 접두사
  app.setGlobalPrefix('api');

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('입시 정보 격차 해소 플랫폼 API')
    .setDescription(`
## 📚 API 문서

이 문서는 입시 정보 격차 해소 플랫폼의 백엔드 API를 설명합니다.

### 🔐 인증
대부분의 API는 JWT 인증이 필요합니다.
1. \`/api/auth/login\`으로 로그인하여 accessToken을 받습니다.
2. 우측 상단의 **Authorize** 버튼을 클릭합니다.
3. \`Bearer {accessToken}\` 형식으로 입력합니다.

### 👥 사용자 역할
- **STUDENT**: 학생 - 데이터 입력, 진단, AI 조언
- **PARENT**: 학부모 - 자녀 데이터 조회, 상담 예약
- **CONSULTANT**: 컨설턴트 - 상담 진행, 리포트 작성
- **ADMIN**: 관리자 - 시스템 관리, 통계 조회

### 📦 모듈 구성
- **M1**: Auth (인증/가족)
- **M2**: Student (학생 데이터)
- **M3**: School (학교 정보)
- **M4**: Diagnosis (진단)
- **M5**: AI (AI 에이전트)
- **M6**: Task (실행 관리)
- **M7**: Dashboard (대시보드)
- **M8**: Consultant (상담)
- **M9**: Subscription (구독/결제)
- **M10**: Admin (관리자 통계)
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력하세요',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', '인증 및 회원가입')
    .addTag('Family', '가족 관리')
    .addTag('Student', '학생 데이터 입력')
    .addTag('School', '학교 정보')
    .addTag('Diagnosis', '진단 엔진')
    .addTag('AI', 'AI 에이전트')
    .addTag('Task', '실행 관리')
    .addTag('Dashboard', '대시보드')
    .addTag('Consultant', '컨설턴트 관리')
    .addTag('Consultation', '상담 관리')
    .addTag('Plan', '구독 플랜')
    .addTag('Subscription', '구독 관리')
    .addTag('Admin', '관리자 통계 (ADMIN 전용)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: '입시 플랫폼 API 문서',
  });

  const port = process.env.PORT || 3000;
  // 모든 네트워크 인터페이스에서 리스닝 (모바일 테스트용)
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api-docs`);
  console.log(`📱 Mobile access: http://[YOUR_IP]:${port}/api`);
}
bootstrap();
