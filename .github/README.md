# 🔄 CI/CD 파이프라인 설정 가이드

**GitHub Actions를 통한 자동 배포 시스템**

---

## 📋 목차

1. [워크플로우 개요](#1-워크플로우-개요)
2. [GitHub Secrets 설정](#2-github-secrets-설정)
3. [배포 플랫폼 설정](#3-배포-플랫폼-설정)
4. [사용 방법](#4-사용-방법)
5. [트러블슈팅](#5-트러블슈팅)

---

## 1. 워크플로우 개요

### 생성된 워크플로우 파일

| 파일 | 목적 | 트리거 |
|------|------|--------|
| `test.yml` | 테스트 자동 실행 | PR 생성, main 브랜치 푸시 |
| `deploy-backend.yml` | Backend 자동 배포 | `backend/**` 변경 시 |
| `deploy-frontend.yml` | Frontend 자동 배포 | `frontend/**` 변경 시 |

### 워크플로우 흐름

```
코드 푸시
    ↓
test.yml 실행 (테스트)
    ↓
테스트 통과?
    ↓
┌───────────┴───────────┐
│                       │
Backend 변경?      Frontend 변경?
│                       │
↓                       ↓
deploy-backend.yml  deploy-frontend.yml
│                       │
↓                       ↓
Render 배포         Vercel 배포
```

---

## 2. GitHub Secrets 설정

### 필수 Secrets

GitHub 저장소 → Settings → Secrets and variables → Actions에서 다음 Secrets를 추가하세요:

#### Backend 배포용

| Secret 이름 | 설명 | 예시 |
|------------|------|------|
| `RENDER_SERVICE_ID` | Render 서비스 ID | `srv-xxxxxxxxxxxxx` |
| `RENDER_API_KEY` | Render API 키 | `rnd_xxxxxxxxxxxxx` |
| `TEST_DATABASE_URL` | 테스트용 DB URL (선택) | `postgresql://...` |

#### Frontend 배포용

| Secret 이름 | 설명 | 예시 |
|------------|------|------|
| `VERCEL_TOKEN` | Vercel API 토큰 | `xxxxxxxxxxxxx` |
| `VERCEL_ORG_ID` | Vercel 조직 ID | `team_xxxxxxxxxxxxx` |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID | `prj_xxxxxxxxxxxxx` |
| `NEXT_PUBLIC_API_URL` | 프로덕션 API URL | `https://api.3m5m.app` |

---

## 3. 배포 플랫폼 설정

### 3.1 Render 설정 (Backend)

**1. Render 대시보드에서 서비스 ID 확인:**
- Render 대시보드 → 서비스 선택
- Settings → Service ID 복사

**2. Render API 키 생성:**
- Render 대시보드 → Account Settings
- API Keys → New API Key 생성
- 생성된 키 복사

**3. GitHub Secrets에 추가:**
- `RENDER_SERVICE_ID`: 서비스 ID
- `RENDER_API_KEY`: API 키

### 3.2 Vercel 설정 (Frontend)

**1. Vercel CLI로 토큰 생성:**
```bash
npm i -g vercel
vercel login
vercel link
```

**2. 또는 Vercel 대시보드에서:**
- Settings → Tokens → Create Token
- 토큰 복사

**3. 프로젝트 정보 확인:**
```bash
vercel inspect
# 또는 Vercel 대시보드에서 확인
```

**4. GitHub Secrets에 추가:**
- `VERCEL_TOKEN`: API 토큰
- `VERCEL_ORG_ID`: 조직 ID
- `VERCEL_PROJECT_ID`: 프로젝트 ID

---

## 4. 사용 방법

### 4.1 자동 배포

**코드 푸시 시 자동 배포:**
```bash
# Backend 변경 시
git add backend/
git commit -m "feat: 새로운 기능 추가"
git push origin main
# → 자동으로 테스트 실행 후 배포
```

```bash
# Frontend 변경 시
git add frontend/
git commit -m "feat: UI 개선"
git push origin main
# → 자동으로 테스트 실행 후 배포
```

### 4.2 수동 배포

**GitHub Actions에서 수동 실행:**
1. GitHub 저장소 → Actions 탭
2. 원하는 워크플로우 선택 (예: Deploy Backend)
3. "Run workflow" 클릭
4. 브랜치 선택 후 실행

### 4.3 배포 상태 확인

**GitHub Actions에서 확인:**
- 저장소 → Actions 탭
- 각 워크플로우 실행 상태 확인
- 실패 시 로그 확인

---

## 5. 트러블슈팅

### 문제 1: 테스트 실패로 배포 안 됨

**증상:**
```
❌ Tests failed
Deployment skipped
```

**해결:**
1. 로컬에서 테스트 실행:
   ```bash
   cd backend
   pnpm test
   ```
2. 테스트 실패 원인 확인 및 수정
3. 다시 푸시

### 문제 2: Render 배포 실패

**증상:**
```
❌ Deploy to Render failed
```

**해결:**
1. Secrets 확인:
   - `RENDER_SERVICE_ID` 올바른지 확인
   - `RENDER_API_KEY` 유효한지 확인
2. Render 대시보드에서 수동 배포 시도
3. Render 로그 확인

### 문제 3: Vercel 배포 실패

**증상:**
```
❌ Deploy to Vercel failed
```

**해결:**
1. Secrets 확인:
   - `VERCEL_TOKEN` 유효한지 확인
   - `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` 올바른지 확인
2. Vercel CLI로 수동 배포 시도:
   ```bash
   cd frontend
   vercel --prod
   ```
3. Vercel 대시보드에서 로그 확인

### 문제 4: 빌드 실패

**증상:**
```
❌ Build failed
```

**해결:**
1. 로컬에서 빌드 확인:
   ```bash
   # Backend
   cd backend
   pnpm build
   
   # Frontend
   cd frontend
   pnpm build
   ```
2. 빌드 에러 수정
3. 다시 푸시

### 문제 5: 환경 변수 누락

**증상:**
```
❌ Environment variable not found
```

**해결:**
1. 필요한 환경 변수 확인
2. 배포 플랫폼(Vercel/Render)에서 환경 변수 설정
3. GitHub Secrets에 추가 (필요 시)

---

## 📚 추가 리소스

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Render API 문서](https://render.com/docs/api)
- [Vercel CLI 문서](https://vercel.com/docs/cli)

---

## ✅ 체크리스트

배포 전 확인:
- [ ] GitHub Secrets 모두 설정됨
- [ ] 로컬 테스트 통과
- [ ] 로컬 빌드 성공
- [ ] 배포 플랫폼 설정 완료

---

_Last updated: 2025-01-20_

