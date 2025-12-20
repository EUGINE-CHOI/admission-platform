# 🔧 환경 변수 설정 가이드

## 필수 환경 변수

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# ===========================================
# 서버 설정
# ===========================================
NODE_ENV=development  # development | production
PORT=3000

# ===========================================
# 데이터베이스
# ===========================================
DATABASE_URL="postgresql://user:password@localhost:5432/roadmap?schema=public"

# ===========================================
# JWT 인증
# ===========================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ===========================================
# CORS 설정 (⚠️ 보안 중요)
# ===========================================
# 허용할 도메인들 (쉼표로 구분)
# 개발환경: http://localhost:4000
# 프로덕션: https://your-domain.com
CORS_ORIGINS=http://localhost:4000,http://localhost:3000

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
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@roadmap.com
```

## 환경별 설정

### 개발 환경 (Development)
```bash
NODE_ENV=development
CORS_ORIGINS=http://localhost:4000,http://localhost:3000
```

### 프로덕션 환경 (Production)
```bash
NODE_ENV=production
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

## ⚠️ 보안 주의사항

1. **절대 `.env` 파일을 Git에 커밋하지 마세요**
2. 프로덕션에서는 강력한 JWT_SECRET 사용 (최소 32자)
3. CORS_ORIGINS에 신뢰할 수 있는 도메인만 추가
4. API 키는 환경변수로만 관리

