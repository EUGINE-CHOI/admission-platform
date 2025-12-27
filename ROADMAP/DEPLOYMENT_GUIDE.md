# 🚀 배포 준비 가이드 (Deployment Guide)

**3m5m 프로덕션 배포를 위한 완전한 체크리스트**  
_Last updated: 2025-01-20_

---

## 📋 목차

1. [배포 아키텍처 선택](#1-배포-아키텍처-선택)
2. [프로덕션 환경 변수 설정](#2-프로덕션-환경-변수-설정)
3. [도메인 및 SSL 인증서](#3-도메인-및-ssl-인증서)
4. [데이터베이스 설정](#4-데이터베이스-설정)
5. [CI/CD 파이프라인 구축](#5-cicd-파이프라인-구축)
6. [서버 설정 및 최적화](#6-서버-설정-및-최적화)
7. [보안 강화](#7-보안-강화)
8. [모니터링 및 로깅](#8-모니터링-및-로깅)
9. [백업 및 복구 전략](#9-백업-및-복구-전략)
10. [배포 체크리스트](#10-배포-체크리스트)

---

## 1. 배포 아키텍처 선택

### 1.1 옵션 비교

| 옵션 | 장점 | 단점 | 비용 | 추천도 |
|------|------|------|------|--------|
| **Vercel (FE) + Render (BE)** | 간단, 무료 티어, 자동 SSL | 제한적 커스터마이징 | $0~$25/월 | ⭐⭐⭐⭐⭐ |
| **Vercel (FE) + Railway (BE)** | 빠른 배포, 쉬운 설정 | 비용 증가 시 빠름 | $5~$20/월 | ⭐⭐⭐⭐ |
| **AWS (EC2 + RDS + S3)** | 완전한 제어, 확장성 | 복잡한 설정, 높은 비용 | $50~$200/월 | ⭐⭐⭐ |
| **Docker + VPS** | 유연성, 비용 효율 | 직접 관리 필요 | $10~$50/월 | ⭐⭐⭐ |

### 1.2 추천 아키텍처 (초기 MVP)

```
┌─────────────────┐
│   Vercel (FE)   │ ← Next.js 프론트엔드
│   (자동 배포)    │
└────────┬────────┘
         │ HTTPS
         │
┌────────▼────────┐
│  Render (BE)    │ ← NestJS 백엔드
│  (Node.js)      │
└────────┬────────┘
         │
┌────────▼────────┐
│ Render PostgreSQL│ ← 데이터베이스
│  (Managed DB)   │
└─────────────────┘
```

**이유:**
- ✅ 무료 티어로 시작 가능
- ✅ 자동 SSL 인증서
- ✅ GitHub 연동으로 자동 배포
- ✅ 관리형 데이터베이스 (백업 자동)

---

## 2. 프로덕션 환경 변수 설정

### 2.1 Backend 환경 변수 (`.env.production`)

```bash
# ===========================================
# 서버 설정
# ===========================================
NODE_ENV=production
PORT=3000

# ===========================================
# 데이터베이스 (Render PostgreSQL)
# ===========================================
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public&sslmode=require"

# ===========================================
# JWT 인증 (⚠️ 강력한 시크릿 사용)
# ===========================================
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-change-this"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars-change-this"
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ===========================================
# CORS 설정 (프로덕션 도메인만 허용)
# ===========================================
CORS_ORIGINS=https://3m5m.app,https://www.3m5m.app

# ===========================================
# AI API
# ===========================================
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash

# ===========================================
# 이메일 (SMTP)
# ===========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@3m5m.app
SMTP_PASS=your-app-specific-password
EMAIL_FROM=noreply@3m5m.app

# ===========================================
# 보안 (Rate Limiting)
# ===========================================
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### 2.2 Frontend 환경 변수 (Vercel)

Vercel 대시보드에서 설정:
- `NEXT_PUBLIC_API_URL=https://api.3m5m.app`
- `NEXT_PUBLIC_ENV=production`

### 2.3 환경 변수 관리 전략

**✅ DO:**
- 환경 변수는 배포 플랫폼의 관리 도구 사용
- 민감한 정보는 절대 코드에 하드코딩하지 않기
- 개발/스테이징/프로덕션 분리

**❌ DON'T:**
- `.env` 파일을 Git에 커밋
- 프로덕션 시크릿을 개발 환경에서 사용
- 공개 저장소에 환경 변수 노출

---

## 3. 도메인 및 SSL 인증서

### 3.1 도메인 구매 및 설정

**도메인 구매:**
- [Namecheap](https://www.namecheap.com/) - $10~$15/년
- [Google Domains](https://domains.google/) - $12/년
- [Cloudflare](https://www.cloudflare.com/) - 비용 + 보안 기능

**DNS 설정:**
```
Type    Name    Value                    TTL
A       @       <Vercel IP>              3600
CNAME   www     cname.vercel-dns.com     3600
A       api     <Render IP>              3600
```

### 3.2 SSL 인증서

**Vercel & Render:**
- ✅ 자동 SSL 인증서 제공 (Let's Encrypt)
- ✅ 자동 갱신
- ✅ HTTPS 강제 리다이렉트 설정

**수동 설정 (필요 시):**
```nginx
# Nginx 설정 예시
server {
    listen 80;
    server_name 3m5m.app www.3m5m.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 3m5m.app www.3m5m.app;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # SSL 최적화
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

---

## 4. 데이터베이스 설정

### 4.1 Render PostgreSQL 설정

**1. 데이터베이스 생성:**
- Render 대시보드 → PostgreSQL 생성
- 자동 백업 활성화 (일일 백업)

**2. 연결 정보:**
- External Connection String 사용
- SSL 모드: `require`

**3. 마이그레이션 실행:**
```bash
# 프로덕션 마이그레이션
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 4.2 데이터베이스 최적화

**인덱스 확인:**
```sql
-- 인덱스 사용률 확인
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

**연결 풀 설정:**
```typescript
// backend/src/prisma/prisma.service.ts
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // 연결 풀 설정
  connection_limit = 10
}
```

### 4.3 시드 데이터

**프로덕션 시드:**
```bash
# 필수 데이터만 시드
npx ts-node prisma/seed-production.ts
```

---

## 5. CI/CD 파이프라인 구축

### 5.1 GitHub Actions 워크플로우

**`.github/workflows/deploy-backend.yml`:**
```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: |
          cd backend
          pnpm install
      
      - name: Run tests
        run: |
          cd backend
          pnpm test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
      
      - name: Build
        run: |
          cd backend
          pnpm build
      
      - name: Deploy to Render
        uses: johnbeynon/render-deploy@v1.1.0
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

**`.github/workflows/deploy-frontend.yml`:**
```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: |
          cd frontend
          pnpm install
      
      - name: Run tests
        run: |
          cd frontend
          pnpm test
      
      - name: Build
        run: |
          cd frontend
          pnpm build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 5.2 Vercel 자동 배포 설정

**Vercel 프로젝트 설정:**
1. GitHub 저장소 연결
2. Root Directory: `frontend`
3. Build Command: `pnpm build`
4. Output Directory: `.next`
5. Install Command: `pnpm install`

### 5.3 Render 자동 배포 설정

**Render 서비스 설정:**
1. GitHub 저장소 연결
2. Root Directory: `backend`
3. Build Command: `pnpm install && pnpm build`
4. Start Command: `node dist/main.js`
5. Environment: `Node`

---

## 6. 서버 설정 및 최적화

### 6.1 NestJS 프로덕션 최적화

**`backend/src/main.ts` 개선:**
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn'] 
      : ['log', 'error', 'warn', 'debug'],
  });

  // 프로덕션 최적화
  if (process.env.NODE_ENV === 'production') {
    app.use(compression());
    app.use(helmet());
  }

  // ... 나머지 설정
}
```

### 6.2 Next.js 프로덕션 최적화

**`frontend/next.config.mjs` 확인:**
```javascript
const nextConfig = {
  // 이미 설정됨
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  
  // 추가 최적화
  swcMinify: true,
  experimental: {
    optimizeCss: true,
  },
};
```

### 6.3 PM2 설정 (Render 대신 직접 서버 사용 시)

**`ecosystem.config.js`:**
```javascript
module.exports = {
  apps: [{
    name: '3m5m-backend',
    script: './dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
  }],
};
```

---

## 7. 보안 강화

### 7.1 보안 헤더 (이미 구현됨)

**확인 사항:**
- ✅ Helmet 설정 완료
- ✅ CORS 환경별 분리 완료
- ✅ Rate Limiting 완료
- ✅ Input Sanitization 완료

### 7.2 추가 보안 체크리스트

**환경 변수:**
- [ ] 모든 시크릿 키 변경 (JWT_SECRET 등)
- [ ] 강력한 비밀번호 정책 적용
- [ ] API 키 로테이션 계획 수립

**데이터베이스:**
- [ ] 데이터베이스 접근 IP 화이트리스트 설정
- [ ] SSL 연결 강제
- [ ] 정기적인 보안 업데이트

**API:**
- [ ] Swagger UI 프로덕션에서 비활성화
- [ ] 디버그 모드 비활성화
- [ ] 에러 메시지에서 민감 정보 제거

---

## 8. 모니터링 및 로깅

### 8.1 에러 추적 (Sentry)

**Backend 설정:**
```typescript
// backend/src/main.ts
import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1,
  });
}
```

**Frontend 설정:**
```typescript
// frontend/src/app/layout.tsx
import * as Sentry from '@sentry/nextjs';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1,
  });
}
```

### 8.2 로깅 전략

**구조화된 로깅:**
```typescript
// backend/src/common/logger.service.ts
import { Logger } from '@nestjs/common';

export class AppLogger extends Logger {
  log(message: string, context?: string) {
    super.log(JSON.stringify({ message, context, timestamp: new Date() }), context);
  }
  
  error(message: string, trace: string, context?: string) {
    super.error(JSON.stringify({ message, trace, context, timestamp: new Date() }), trace, context);
  }
}
```

### 8.3 성능 모니터링

**APM 도구:**
- **New Relic** - 무료 티어 제공
- **Datadog** - 유료, 강력한 기능
- **Render Metrics** - Render 기본 제공

---

## 9. 백업 및 복구 전략

### 9.1 데이터베이스 백업

**Render PostgreSQL:**
- ✅ 자동 일일 백업 (7일 보관)
- ✅ 수동 백업 가능

**추가 백업 전략:**
```bash
# 주간 전체 백업 스크립트
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://3m5m-backups/
```

### 9.2 복구 절차

**1. 데이터베이스 복구:**
```bash
# 백업 파일에서 복구
psql $DATABASE_URL < backup_20250120.sql
```

**2. 롤백 절차:**
- Vercel: 이전 배포로 즉시 롤백 가능
- Render: 이전 버전으로 재배포

### 9.3 재해 복구 계획

**체크리스트:**
- [ ] 백업 주기 정의 (일일/주간)
- [ ] 백업 저장소 설정 (S3 등)
- [ ] 복구 테스트 계획
- [ ] RTO (Recovery Time Objective) 정의
- [ ] RPO (Recovery Point Objective) 정의

---

## 10. 배포 체크리스트

### 10.1 배포 전 체크리스트

**코드 품질:**
- [ ] 모든 테스트 통과
- [ ] 린터 에러 없음
- [ ] 타입 에러 없음
- [ ] 빌드 성공 확인

**환경 설정:**
- [ ] 프로덕션 환경 변수 설정 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 시드 데이터 적용 완료

**보안:**
- [ ] 모든 시크릿 키 변경
- [ ] CORS 설정 확인
- [ ] Rate Limiting 활성화
- [ ] 보안 헤더 설정 확인

**성능:**
- [ ] 데이터베이스 인덱스 확인
- [ ] 이미지 최적화 확인
- [ ] 번들 크기 확인
- [ ] 캐싱 설정 확인

### 10.2 배포 후 체크리스트

**기능 테스트:**
- [ ] 회원가입/로그인 동작 확인
- [ ] 주요 기능 동작 확인
- [ ] API 응답 시간 확인
- [ ] 에러 핸들링 확인

**모니터링:**
- [ ] 에러 로그 확인
- [ ] 성능 메트릭 확인
- [ ] 사용자 피드백 모니터링

**문서화:**
- [ ] 배포 노트 작성
- [ ] 알려진 이슈 문서화
- [ ] 롤백 절차 문서화

---

## 📚 참고 자료

- [Vercel 배포 가이드](https://vercel.com/docs)
- [Render 배포 가이드](https://render.com/docs)
- [Next.js 프로덕션 최적화](https://nextjs.org/docs/advanced-features/measuring-performance)
- [NestJS 프로덕션 모범 사례](https://docs.nestjs.com/techniques/performance)

---

## 🚨 긴급 연락처

**문제 발생 시:**
1. 즉시 롤백 실행
2. 에러 로그 확인
3. 모니터링 대시보드 확인
4. 팀에 알림

---

_이 문서는 프로덕션 배포 전 필수 확인 사항을 포함합니다. 각 단계를 순차적으로 진행하세요._

