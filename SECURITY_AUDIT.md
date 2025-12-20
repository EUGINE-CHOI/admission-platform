# 🔒 보안 감사 (Security Audit) - M24

## 📋 개요

이 문서는 입시 로드맵 플랫폼의 보안 강화 작업을 기록합니다.

| 항목 | 상태 | 위험도 감소 |
|------|------|-------------|
| Rate Limiting | ✅ 완료 | DDoS, 브루트포스 방지 |
| 보안 헤더 (Helmet) | ✅ 완료 | XSS, Clickjacking 방지 |
| 입력값 검증/XSS 방지 | ✅ 완료 | 인젝션 공격 방지 |
| CORS 강화 | ✅ 완료 | CSRF 공격 방지 |

---

## 1️⃣ Rate Limiting

### 패키지
```bash
npm install @nestjs/throttler
```

### 설정 (app.module.ts)
```typescript
ThrottlerModule.forRoot([
  { name: 'short', ttl: 1000, limit: 3 },    // 초당 3회
  { name: 'medium', ttl: 10000, limit: 20 }, // 10초당 20회
  { name: 'long', ttl: 60000, limit: 100 },  // 분당 100회
])
```

### 민감한 API 추가 제한 (auth.controller.ts)
```typescript
@Throttle({ default: { limit: 5, ttl: 60000 } })  // 로그인: 분당 5회
@Throttle({ default: { limit: 3, ttl: 60000 } })  // 회원가입: 분당 3회
```

### 효과
- ✅ DDoS 공격 완화
- ✅ 브루트포스 비밀번호 공격 차단
- ✅ 서버 자원 보호

---

## 2️⃣ 보안 헤더 (Helmet)

### 패키지
```bash
npm install helmet
```

### 설정 (main.ts)
```typescript
app.use(helmet({
  contentSecurityPolicy: { /* CSP 설정 */ },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: process.env.NODE_ENV === 'production' 
    ? { maxAge: 31536000, includeSubDomains: true }
    : false,
}));
```

### 적용된 헤더
| 헤더 | 값 | 효과 |
|------|-----|------|
| Content-Security-Policy | 설정됨 | XSS 공격 방지 |
| X-Frame-Options | DENY | Clickjacking 방지 |
| X-Content-Type-Options | nosniff | MIME 스니핑 방지 |
| X-XSS-Protection | 1; mode=block | 브라우저 XSS 필터 |
| Referrer-Policy | strict-origin-when-cross-origin | 리퍼러 정보 보호 |
| Strict-Transport-Security | 프로덕션만 | HTTPS 강제 |

---

## 3️⃣ 입력값 검증 / XSS 방지

### 파일
- `backend/src/common/sanitize.util.ts` - 정제 함수들
- `backend/src/common/sanitize.interceptor.ts` - 전역 인터셉터
- `backend/src/common/sanitize.util.spec.ts` - 17개 테스트

### 정제 함수
```typescript
escapeHtml(str)           // HTML 특수문자 이스케이프
stripDangerousTags(str)   // 위험 태그 제거
detectSqlInjection(str)   // SQL 인젝션 감지 (경고)
sanitizeObject(obj)       // 객체 전체 정제
```

### 차단되는 패턴
```
❌ <script>alert('xss')</script>
❌ <iframe src="evil.com">
❌ onclick="malicious()"
❌ javascript:void(0)
❌ onerror="attack()"
```

### 자동 적용
모든 POST/PUT/PATCH 요청의 body가 자동으로 정제됩니다.

---

## 4️⃣ CORS 강화

### 환경별 설정
```typescript
// 개발환경
origin: true  // 모든 도메인 허용

// 프로덕션
origin: CORS_ORIGINS 환경변수 기반 화이트리스트
```

### 환경변수 (프로덕션 필수)
```bash
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
NODE_ENV=production
```

### CORS 옵션
```typescript
{
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
  maxAge: 86400, // 24시간 preflight 캐시
}
```

---

## 📁 수정된 파일 목록

```
backend/
├── package.json                    # @nestjs/throttler, helmet 추가
├── src/
│   ├── main.ts                     # Helmet, CORS 설정
│   ├── app.module.ts               # ThrottlerModule 등록
│   ├── auth/
│   │   └── auth.controller.ts      # 로그인/회원가입 Rate Limit
│   └── common/
│       ├── common.module.ts        # SanitizeInterceptor 전역 등록
│       ├── sanitize.util.ts        # XSS 방지 유틸리티
│       ├── sanitize.interceptor.ts # 요청 자동 정제
│       └── sanitize.util.spec.ts   # 단위 테스트 (17개)
├── ENV_SETUP.md                    # 환경변수 가이드
```

---

## ✅ 테스트 결과

```
Test Suites: 2 passed, 2 total
Tests:       24 passed, 24 total
- Auth: 7개 테스트
- Sanitize: 17개 테스트
```

---

## 🔮 추가 권장 사항

### 향후 고려할 보안 강화
1. **HTTPS 적용** - SSL/TLS 인증서 설치
2. **WAF (Web Application Firewall)** - 클라우드 WAF 서비스 적용
3. **로그 모니터링** - 의심스러운 활동 실시간 감지
4. **취약점 스캐닝** - 정기적인 보안 점검
5. **2FA (Two-Factor Authentication)** - 관리자 계정 이중 인증

---

## 📅 작업 일자
- **완료일**: 2025-12-20
- **담당**: AI Agent (Claude)
- **검토 필요**: 프로덕션 배포 전 보안 전문가 검토 권장

