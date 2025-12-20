# 🔧 M20 — 코드 리팩토링 (Code Quality Layer) 시나리오

> **버전**: 1.0
> **의존성**: 전체 마일스톤
> **대상 사용자**: 개발자
> **상태**: ✅ 완료 (일부 예정)

---

## 🔑 WP20.1 — 토큰 관리 통일

### Scenario WP20.1-1: 토큰 저장 함수 통일

**Given:**
- 로그인 성공 후 토큰 수신

**When:**
- setToken(accessToken, refreshToken) 호출

**Then:**
- localStorage에 저장:
  - `accessToken` 키에 accessToken
  - `refreshToken` 키에 refreshToken
  - `token` 키에 accessToken (하위 호환)

**선행 Scenario:** WP1.1-3

**Before:**
```typescript
localStorage.setItem("token", data.accessToken);
localStorage.setItem("accessToken", data.accessToken);
```

**After:**
```typescript
import { setToken } from "@/lib/api";
setToken(data.accessToken, data.refreshToken);
```

---

### Scenario WP20.1-2: 토큰 조회 함수 통일

**Given:**
- API 요청 필요

**When:**
- getToken() 호출

**Then:**
- accessToken 키 우선 조회
- 없으면 token 키 폴백 조회
- 둘 다 없으면 null 반환

**선행 Scenario:** WP20.1-1

**Before:**
```typescript
const token = localStorage.getItem("accessToken");
```

**After:**
```typescript
import { getToken } from "@/lib/api";
const token = getToken();
```

---

### Scenario WP20.1-3: 토큰 삭제 함수 통일

**Given:**
- 로그아웃 요청

**When:**
- clearToken() 호출

**Then:**
- localStorage에서 모든 토큰 키 삭제:
  - accessToken
  - refreshToken
  - token

**선행 Scenario:** WP20.1-1

---

## 🌐 WP20.2 — API URL 통일

### Scenario WP20.2-1: getApiUrl 함수 전역 사용

**Given:**
- API 호출 필요

**When:**
- getApiUrl() 호출

**Then:**
- localhost/127.0.0.1: `http://localhost:3000`
- 그 외: `http://{hostname}:3000`

**선행 Scenario:** 없음

**Before:**
```typescript
const res = await fetch("http://localhost:3000/api/...");
```

**After:**
```typescript
import { getApiUrl } from "@/lib/api";
const res = await fetch(`${getApiUrl()}/api/...`);
```

---

### Scenario WP20.2-2: 모바일 환경 동적 URL

**Given:**
- 모바일 기기에서 192.168.1.100:3001 접속

**When:**
- getApiUrl() 호출

**Then:**
- `http://192.168.1.100:3000` 반환
- 모바일에서 백엔드 접근 가능

**선행 Scenario:** WP20.2-1

---

## 📅 WP20.3 — 날짜/시간 포맷 통일

### Scenario WP20.3-1: formatDate 함수 사용

**Given:**
- 날짜 표시 필요

**When:**
- formatDate(date) 호출

**Then:**
- `2025년 1월 15일` 형식 반환

**선행 Scenario:** 없음

**Before:**
```typescript
new Date(date).toLocaleDateString('ko-KR');
```

**After:**
```typescript
import { formatDate } from "@/lib/utils";
formatDate(date);
```

---

### Scenario WP20.3-2: formatRelativeTime 함수 사용

**Given:**
- 상대 시간 표시 필요

**When:**
- formatRelativeTime(date) 호출

**Then:**
- `3일 전`, `2시간 전` 등 반환

**선행 Scenario:** 없음

---

## ⚠️ WP20.4 — 에러 처리 통일

### Scenario WP20.4-1: handleApiError 함수 사용

**Given:**
- API 호출 중 에러 발생

**When:**
- catch 블록에서 handleApiError(error) 호출

**Then:**
- 콘솔에 에러 로깅
- 사용자 친화적 메시지 반환
- 일관된 에러 처리

**선행 Scenario:** 없음

**Before:**
```typescript
catch (error) {
  console.error("Error:", error);
  setError("오류가 발생했습니다");
}
```

**After:**
```typescript
import { handleApiError } from "@/lib/api";
catch (error) {
  const message = handleApiError(error);
  setError(message);
}
```

---

## 📦 WP20.5 — 타입 정의 통합

### Scenario WP20.5-1: 공통 타입 사용

**Given:**
- User 타입 필요

**When:**
- types.ts에서 import

**Then:**
- 중복 정의 없이 공통 타입 사용

**선행 Scenario:** 없음

**Before:**
```typescript
interface User {
  id: string;
  email: string;
  role: string;
}
```

**After:**
```typescript
import { User } from "@/lib/types";
```

---

## 🔄 WP20.6 — Backend API 응답 형식 통일

### Scenario WP20.6-1: ApiResponse 유틸리티 사용

**Given:**
- API 응답 반환 필요

**When:**
- ApiResponse.success(data) 호출

**Then:**
- `{ success: true, data: ... }` 형식 반환

**선행 Scenario:** 없음

**Before:**
```typescript
return { success: true, data: result };
```

**After:**
```typescript
import { ApiResponse } from '../common';
return ApiResponse.success(result);
```

---

### Scenario WP20.6-2: 메시지 응답

**Given:**
- 메시지만 반환 필요

**When:**
- ApiResponse.message(msg) 호출

**Then:**
- `{ success: true, message: "..." }` 형식 반환

**선행 Scenario:** WP20.6-1

---

## 🤖 WP20.7 — AI 서비스 중복 제거 (예정)

### Scenario WP20.7-1: BaseAiService 추상 클래스

**Given:**
- AI 서비스 구현 필요

**When:**
- BaseAiService 상속

**Then:**
- 공통 로직 재사용:
  - API 호출
  - 프롬프트 생성
  - 응답 파싱

**선행 Scenario:** 없음
**상태:** 📋 예정 (복잡도 높음)

---

## ✅ 완료 체크리스트

- [x] WP20.1: 토큰 관리 통일
- [x] WP20.2: API URL 통일
- [x] WP20.3: 날짜/시간 포맷
- [x] WP20.4: 에러 처리 통일
- [x] WP20.5: 타입 정의 통합
- [x] WP20.6: Backend 응답 형식
- [ ] WP20.7: AI 서비스 통합 (예정)


