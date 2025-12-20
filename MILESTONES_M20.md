# 🧩 M20 — 코드 리팩토링 (Code Quality Layer)

> **버전**: 1.0
> **의존성**: 전체 마일스톤
> **상태**: ✅ 완료 (일부 예정)

---

## 🎯 목적

- 코드베이스 일관성 향상
- 유지보수성 개선
- 중복 코드 제거

---

## 📦 산출물

| 구분 | 항목 | 설명 | 상태 |
|------|------|------|------|
| **Frontend** | 토큰 관리 통일 | getToken/setToken/clearToken | ✅ |
| **Frontend** | API URL 통일 | getApiUrl() 전역 사용 | ✅ |
| **Frontend** | 날짜/시간 포맷 | formatDate, formatDateTime | ✅ |
| **Frontend** | 에러 처리 통일 | handleApiError | ✅ |
| **Frontend** | 타입 정의 통합 | 공통 types.ts | ✅ |
| **Backend** | API 응답 형식 | ApiResponse 유틸리티 | ✅ |
| **Backend** | AI 서비스 통합 | BaseAiService | 📋 예정 |

---

## 📋 Work Packages

### WP20.1 — 토큰 관리 통일 ✅

**산출물:**
- [x] TOKEN_KEY, REFRESH_TOKEN_KEY 상수
- [x] getToken() - 토큰 조회 (폴백 포함)
- [x] setToken() - 토큰 저장
- [x] clearToken() - 토큰 삭제

**영향 범위:** 20개 파일

```typescript
// frontend/src/lib/api.ts
export const TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");
}
```

---

### WP20.2 — API URL 통일 ✅

**산출물:**
- [x] getApiUrl() 함수 구현
- [x] 모든 API 호출에 적용
- [x] 하드코딩된 URL 제거

**영향 범위:** 32개 파일

```typescript
// frontend/src/lib/api.ts
export function getApiUrl(): string {
  if (typeof window === "undefined") {
    return "http://localhost:3000";
  }
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3000";
  }
  return `http://${hostname}:3000`;
}
```

---

### WP20.3 — 날짜/시간 포맷 통일 ✅

**산출물:**
- [x] formatDate() - 날짜 포맷
- [x] formatDateTime() - 날짜+시간 포맷
- [x] formatRelativeTime() - 상대 시간
- [x] getDDay() - D-Day 계산

**위치:** `frontend/src/lib/utils.ts`

---

### WP20.4 — 에러 처리 통일 ✅

**산출물:**
- [x] getErrorMessage() - 에러 메시지 추출
- [x] handleApiError() - 에러 처리 공통화

**위치:** `frontend/src/lib/api.ts`

---

### WP20.5 — 타입 정의 통합 ✅

**산출물:**
- [x] User, School, Grade 등 공통 타입
- [x] ApiResponse, PaginatedResponse 타입
- [x] 중복 인터페이스 제거

**위치:** `frontend/src/lib/types.ts`

---

### WP20.6 — Backend API 응답 형식 통일 ✅

**산출물:**
- [x] ApiResponse 유틸리티 클래스
- [x] success(), message(), error() 메서드
- [x] paginated() 메서드

**위치:** `backend/src/common/api-response.ts`

```typescript
export class ApiResponse {
  static success<T>(data: T) {
    return { success: true, data };
  }
  static message(message: string) {
    return { success: true, message };
  }
}
```

---

### WP20.7 — AI 서비스 중복 제거 📋

**예정 산출물:**
- [ ] BaseAiService 추상 클래스
- [ ] 공통 프롬프트 생성 로직
- [ ] 공통 응답 파싱 로직

**복잡도:** 높음 (영향 범위 큼)

---

## 📁 파일 구조

```
frontend/src/lib/
├── api.ts (토큰, API URL, 에러 처리)
├── utils.ts (날짜/시간 포맷)
└── types.ts (공통 타입)

backend/src/common/
├── api-response.ts
└── index.ts
```

---

## ✅ 완료 조건

- [x] 토큰 관리 함수 통일
- [x] API URL 하드코딩 제거
- [x] 날짜/시간 포맷 일관성
- [x] 에러 처리 공통화
- [x] 타입 정의 통합
- [x] Backend 응답 형식 통일
- [ ] AI 서비스 중복 제거 (예정)


