# 🔧 Work Package M23 — 테스트 & QA

## 📋 WP 목록

| WP | 제목 | 우선순위 | 상태 |
|----|------|----------|------|
| WP23.1 | Backend Unit Tests | P0 | ✅ 완료 |
| WP23.2 | Backend E2E Tests | P0 | ✅ 완료 |
| WP23.3 | Frontend Unit Tests | P0 | ✅ 완료 |
| WP23.4 | E2E Tests (Cypress) | P1 | ✅ 완료 |

---

## 🔧 WP23.1 — Backend Unit Tests

### 목적
Jest를 사용한 Backend 서비스 단위 테스트 구현

### 산출물
- `backend/src/auth/auth.service.spec.ts`
- `backend/src/student/student.service.spec.ts`
- `backend/src/school/school.service.spec.ts`
- `backend/src/ai/ai.service.spec.ts`

### 테스트 항목
| 서비스 | 테스트 케이스 |
|--------|---------------|
| AuthService | 로그인 성공/실패, 회원가입, 토큰 검증 |
| StudentService | 학생 조회, 성적 CRUD, 활동 CRUD |
| SchoolService | 학교 목록, 상세 조회, 캐싱 동작 |
| AiService | 분석 생성, 추천, 히스토리 조회 |

### 기술 스택
- Jest
- Mock (Prisma, 외부 서비스)

---

## 🔧 WP23.2 — Backend E2E Tests

### 목적
Supertest를 사용한 API 통합 테스트 구현

### 산출물
- `backend/test/auth.e2e-spec.ts`
- `backend/test/student.e2e-spec.ts`
- `backend/test/school.e2e-spec.ts`
- `backend/test/ai.e2e-spec.ts`

### 테스트 항목
| API | 테스트 케이스 |
|-----|---------------|
| /api/auth | POST /login, POST /signup, GET /me |
| /api/student | GET /:id, PATCH /:id, GET /:id/grades |
| /api/school | GET /, GET /:id, POST /, PATCH /:id/publish |
| /api/ai | POST /analyze, POST /recommend, GET /history |

### 기술 스택
- Supertest
- Test DB (SQLite 또는 테스트 PostgreSQL)

---

## 🔧 WP23.3 — Frontend Unit Tests

### 목적
Jest + RTL을 사용한 컴포넌트/훅/유틸 테스트 구현

### 산출물
**컴포넌트 테스트**
- `frontend/src/__tests__/components/Button.test.tsx`
- `frontend/src/__tests__/components/Badge.test.tsx`
- `frontend/src/__tests__/components/Card.test.tsx`
- `frontend/src/__tests__/components/LoadingState.test.tsx`

**유틸리티 테스트**
- `frontend/src/__tests__/lib/utils.test.ts`
- `frontend/src/__tests__/lib/api.test.ts`

**훅 테스트**
- `frontend/src/__tests__/hooks/useDarkMode.test.ts`
- `frontend/src/__tests__/hooks/useWidgetSettings.test.ts`

### 테스트 항목
| 카테고리 | 테스트 케이스 |
|----------|---------------|
| Button | 렌더링, 클릭 이벤트, disabled, variant, size |
| Badge | 렌더링, variant 스타일 |
| Card | 렌더링, hover, glass, animate, padding |
| LoadingState | 스피너, 메시지, fullScreen |
| utils | cn(), formatDate(), getDDay(), formatDDay() |
| api | getToken(), setToken(), clearToken(), getApiUrl() |
| useDarkMode | 토글, 저장, 복원 |
| useWidgetSettings | 토글, 순서변경, 초기화 |

### 기술 스택
- Jest
- React Testing Library
- localStorage 모킹

---

## 🔧 WP23.4 — E2E Tests (Cypress)

### 목적
Cypress를 사용한 사용자 시나리오 테스트 구현

### 산출물
- `frontend/cypress/e2e/auth.cy.ts`
- `frontend/cypress/e2e/dashboard.cy.ts`
- `frontend/cypress/e2e/student-data.cy.ts`
- `frontend/cypress/e2e/school.cy.ts`
- `frontend/cypress/e2e/settings.cy.ts`
- `frontend/cypress/e2e/features.cy.ts`
- `frontend/cypress/e2e/parent.cy.ts`

### 테스트 시나리오
| 파일 | 시나리오 |
|------|----------|
| auth | 로그인/회원가입/로그아웃 흐름 |
| dashboard | 학생/보호자 대시보드, 반응형 네비게이션 |
| student-data | 성적/활동/독서 입력, 목표 학교 설정 |
| school | 학교 목록, 검색, 비교 |
| settings | 다크 모드, 위젯 설정 |
| features | 캘린더, 채팅, AI 튜터, 학습 시간 |
| parent | 자녀 현황, 상담, 캘린더 |

### 기술 스택
- Cypress
- @testing-library/cypress
- Custom Commands (login, logout)

---

## 📊 전체 테스트 현황

| WP | 테스트 수 | 파일 수 | 상태 |
|----|----------|---------|------|
| WP23.1 | 30+ | 10+ | ✅ |
| WP23.2 | 20+ | 4 | ✅ |
| WP23.3 | 87 | 10 | ✅ |
| WP23.4 | 80+ | 7 | ✅ |
| **합계** | **217+** | **31+** | **✅** |

---

_Last updated: 2025-12-20_



