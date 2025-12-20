# 🧩 M20 — 코드 리팩토링 Work Packages

> **버전**: 1.0
> **상태**: ✅ 완료 (일부 예정)

---

## WP20.1 — 토큰 관리 통일

**목표:** 인증 토큰 관리 일관성

**산출물:**
- TOKEN_KEY, REFRESH_TOKEN_KEY 상수
- getToken() - 토큰 조회
- setToken() - 토큰 저장
- clearToken() - 토큰 삭제

**영향 범위:** 20개 파일

→ 토큰 관련 버그 방지

---

## WP20.2 — API URL 통일

**목표:** API URL 하드코딩 제거

**산출물:**
- getApiUrl() 함수 구현
- 모든 API 호출에 적용

**영향 범위:** 32개 파일

→ 환경별 URL 자동 처리

---

## WP20.3 — 날짜/시간 포맷 통일

**목표:** 날짜/시간 표시 일관성

**산출물:**
- formatDate() - 날짜 포맷
- formatDateTime() - 날짜+시간
- formatRelativeTime() - 상대 시간
- getDDay() - D-Day 계산

**위치:** `frontend/src/lib/utils.ts`

→ 전체 UI 날짜 표시 일관성

---

## WP20.4 — 에러 처리 통일

**목표:** 에러 처리 일관성

**산출물:**
- getErrorMessage() - 에러 메시지 추출
- handleApiError() - 에러 처리 공통화

**위치:** `frontend/src/lib/api.ts`

→ 사용자 친화적 에러 메시지

---

## WP20.5 — 타입 정의 통합

**목표:** 중복 타입 정의 제거

**산출물:**
- User, School, Grade 등 공통 타입
- ApiResponse, PaginatedResponse 타입

**위치:** `frontend/src/lib/types.ts`

→ 타입 안정성 향상

---

## WP20.6 — Backend API 응답 형식 통일

**목표:** API 응답 구조 일관성

**산출물:**
- ApiResponse 유틸리티 클래스
- success(), message(), error() 메서드

**위치:** `backend/src/common/api-response.ts`

→ 프론트엔드 응답 처리 단순화

---

## WP20.7 — AI 서비스 중복 제거 (예정)

**목표:** AI 서비스 코드 재사용

**예정 산출물:**
- BaseAiService 추상 클래스
- 공통 프롬프트 생성 로직
- 공통 응답 파싱 로직

**상태:** 📋 예정 (복잡도 높음)

---

## 📁 파일 구조

```
frontend/src/lib/
├── api.ts (토큰, URL, 에러)
├── utils.ts (날짜/시간)
└── types.ts (공통 타입)

backend/src/common/
├── api-response.ts
└── index.ts
```

---

## ✅ 완료 체크리스트

- [x] WP20.1: 토큰 관리
- [x] WP20.2: API URL
- [x] WP20.3: 날짜/시간
- [x] WP20.4: 에러 처리
- [x] WP20.5: 타입 정의
- [x] WP20.6: Backend 응답
- [ ] WP20.7: AI 서비스 (예정)




