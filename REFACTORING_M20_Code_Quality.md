# 🔧 M20 — 코드 리팩토링 (Code Quality Layer)

> **목적**: 코드베이스 정리 및 유지보수성 향상  
> **의존성**: M1~M19 (전체 기능 구현 완료 후 진행)  
> **Last Updated**: 2025-12-19

---

## 📋 개요

### 리팩토링 목표
| # | 목표 | 설명 |
|---|------|------|
| 1 | **코드 중복 제거** | 반복되는 패턴을 공통 함수로 추출 |
| 2 | **일관성 확보** | 토큰 관리, API URL 등 통일된 방식 적용 |
| 3 | **유지보수성 향상** | 변경 시 영향 범위 최소화 |
| 4 | **모바일 호환성** | 동적 URL 처리로 다양한 환경 지원 |

### 리팩토링 원칙
- ✅ 기능 동작을 변경하지 않음 (행위 보존)
- ✅ 단계별 진행 및 매 단계 테스트
- ✅ 하위 호환성 유지
- ✅ 빌드 성공 확인 후 다음 단계 진행

---

## ✅ WP20.1 — 토큰 관리 통일

> **목적**: 분산된 토큰 관리 로직을 공통 함수로 통일

### 변경 전 문제점

```typescript
// 파일마다 다른 방식으로 토큰 관리
// 파일 A
const getToken = () => localStorage.getItem("accessToken");

// 파일 B
const getToken = () => localStorage.getItem("token");

// 파일 C
const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
```

**문제점:**
- 18개 파일에서 로컬 `getToken` 함수 중복 정의
- `token`과 `accessToken` 키 혼용
- 로그아웃 시 일부 키만 삭제되는 버그 가능성

### 해결 방안

**`frontend/src/lib/api.ts`에 공통 함수 추가:**

```typescript
/**
 * 토큰 키 상수 (통일된 키 사용)
 */
export const TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * 토큰 조회 함수
 * - 통일된 방식으로 토큰 조회
 * - fallback으로 'token' 키도 확인 (하위 호환성)
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
}

/**
 * 토큰 저장 함수
 */
export function setToken(accessToken: string, refreshToken?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem('token', accessToken); // 하위 호환성
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

/**
 * 토큰 삭제 함수 (로그아웃 시)
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
```

### Scenario WP20.1-1: 토큰 저장 함수 통일

**Given:**
- 사용자가 로그인을 성공했다.

**When:**
- 서버에서 accessToken과 refreshToken을 반환한다.

**Then:**
- `setToken()` 함수가 호출된다.
- `accessToken`과 `token` 키 모두에 토큰이 저장된다 (하위 호환성).
- `refreshToken` 키에 리프레시 토큰이 저장된다.

**선행 Scenario:** WP1.1-3 (로그인 성공)

---

### Scenario WP20.1-2: 토큰 조회 함수 통일

**Given:**
- 사용자가 로그인된 상태이다.
- localStorage에 토큰이 저장되어 있다.

**When:**
- API 호출이 필요하다.

**Then:**
- `getToken()` 함수가 호출된다.
- `accessToken` 키를 먼저 확인하고, 없으면 `token` 키를 확인한다.
- 유효한 토큰이 반환된다.

**선행 Scenario:** WP20.1-1

---

### Scenario WP20.1-3: 토큰 삭제 함수 통일

**Given:**
- 사용자가 로그인된 상태이다.

**When:**
- 로그아웃 버튼을 클릭한다.

**Then:**
- `clearToken()` 함수가 호출된다.
- `accessToken`, `token`, `refreshToken` 키가 모두 삭제된다.
- 이전 세션 토큰이 남아있지 않다.

**선행 Scenario:** WP20.1-1

---

### 변경된 파일 목록 (20개)

| 파일 경로 | 변경 내용 |
|----------|----------|
| `frontend/src/lib/api.ts` | getToken/setToken/clearToken 함수 추가 |
| `frontend/src/app/login/page.tsx` | setToken import 및 사용 |
| `frontend/src/app/page.tsx` | getToken, setToken import 및 사용 |
| `frontend/src/app/dashboard/student/news/page.tsx` | getToken import |
| `frontend/src/app/dashboard/student/ai/page.tsx` | getToken import |
| `frontend/src/app/dashboard/student/tasks/page.tsx` | getToken import |
| `frontend/src/app/dashboard/student/diagnosis/page.tsx` | getToken import |
| `frontend/src/app/dashboard/student/data/page.tsx` | getToken import |
| `frontend/src/app/dashboard/student/consultation/page.tsx` | getToken import |
| `frontend/src/app/dashboard/parent/children/[childId]/page.tsx` | getToken import |
| `frontend/src/app/dashboard/parent/calendar/page.tsx` | getToken import |
| `frontend/src/app/dashboard/parent/subscription/page.tsx` | getToken import |
| `frontend/src/app/dashboard/parent/child/[childId]/page.tsx` | getToken import |
| `frontend/src/app/dashboard/parent/reports/page.tsx` | getToken import |
| `frontend/src/app/dashboard/consultant/consultations/page.tsx` | getToken import |
| `frontend/src/app/dashboard/consultant/students/page.tsx` | getToken import |
| `frontend/src/app/dashboard/consultant/schedule/page.tsx` | getToken import |
| `frontend/src/app/dashboard/admin/ai-quality/page.tsx` | getToken import |
| `frontend/src/app/dashboard/admin/schools/page.tsx` | getToken import |
| `frontend/src/app/dashboard/admin/consultants/page.tsx` | getToken import |
| `frontend/src/app/dashboard/admin/users/page.tsx` | getToken import |

---

## ✅ WP20.2 — API URL 통일

> **목적**: 하드코딩된 API URL을 동적 함수로 통일

### 변경 전 문제점

```typescript
// 32개 파일에서 하드코딩된 URL
const res = await fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  // ...
});
```

**문제점:**
- 113건의 하드코딩된 `http://localhost:3000`
- 모바일 테스트 시 수동으로 IP 변경 필요
- 배포 환경 전환 시 모든 파일 수정 필요

### 해결 방안

**`frontend/src/lib/api.ts`의 `getApiUrl()` 함수 활용:**

```typescript
/**
 * API URL 동적 결정
 * - 모바일에서 IP로 접속 시 자동으로 같은 IP의 백엔드 사용
 * - localhost 접속 시 localhost 백엔드 사용
 */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // localhost가 아닌 경우 (모바일 등에서 IP로 접속)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:3000`;
    }
  }
  
  // 기본값: localhost
  return 'http://localhost:3000';
}
```

### Scenario WP20.2-1: 동적 API URL 사용

**Given:**
- 프론트엔드 페이지가 로드되었다.

**When:**
- API 호출이 필요하다.

**Then:**
- `getApiUrl()` 함수가 현재 hostname을 확인한다.
- localhost 접속 시 `http://localhost:3000` 반환.
- 192.168.x.x 접속 시 `http://192.168.x.x:3000` 반환.

**선행 Scenario:** 없음

---

### Scenario WP20.2-2: 모바일 환경 자동 감지

**Given:**
- 모바일 기기에서 컴퓨터의 IP(예: 192.168.1.100:4000)로 접속했다.

**When:**
- 로그인 API를 호출한다.

**Then:**
- `getApiUrl()`이 `http://192.168.1.100:3000`을 반환한다.
- 별도 설정 없이 모바일 테스트가 가능하다.

**선행 Scenario:** WP20.2-1

---

### 변경된 파일 목록 (32개)

| 카테고리 | 파일 수 | 변경 내용 |
|----------|---------|----------|
| Student Dashboard | 8개 | getApiUrl import 및 사용 |
| Parent Dashboard | 6개 | getApiUrl import 및 사용 |
| Consultant Dashboard | 4개 | getApiUrl import 및 사용 |
| Admin Dashboard | 5개 | getApiUrl import 및 사용 |
| 기타 페이지 | 7개 | getApiUrl import 및 사용 |
| 컴포넌트 | 2개 | getApiUrl import 및 사용 |

**변경 패턴:**

```typescript
// Before
const res = await fetch("http://localhost:3000/api/...");

// After
const res = await fetch(`${getApiUrl()}/api/...`);
```

---

## 📋 WP20.3 — AI 서비스 중복 제거 (향후 예정)

> **목적**: AI 서비스들의 공통 로직을 추상 클래스로 분리

### 현재 상태

4개 AI 서비스에서 유사한 `callAI` 메서드 패턴 사용:

| 서비스 | 파일 |
|--------|------|
| AiService | `backend/src/ai/ai.service.ts` |
| PersonalStatementService | `backend/src/ai/personal-statement.service.ts` |
| AdmissionPredictionService | `backend/src/ai/admission-prediction.service.ts` |
| InterviewPrepService | `backend/src/ai/interview-prep.service.ts` |

### 계획된 개선 방안

```typescript
// BaseAiService 추상 클래스
@Injectable()
export abstract class BaseAiService {
  protected gemini: GenerativeModel | null = null;
  protected readonly MAX_RETRIES = 3;

  constructor(
    protected configService: ConfigService,
    protected prisma: PrismaService,
  ) {
    this.initializeGemini();
  }

  protected async callAI(
    prompt: string,
    systemPrompt?: string,
    retries = 0,
  ): Promise<string> {
    // 공통 AI 호출 로직
  }

  protected async saveAIOutput(
    userId: string,
    type: AIOutputType,
    input: any,
    output: any,
  ): Promise<void> {
    // 공통 히스토리 저장 로직
  }
}
```

### 진행 보류 사유

- 구조 변경으로 인한 **높은 위험도**
- 기존 4개 서비스의 **의존성 재설정** 필요
- **단위 테스트 재작성** 필요
- **별도 세션에서 집중 작업** 권장

---

## 📊 리팩토링 결과 요약

### 완료된 작업

| 단계 | 작업 | 변경 파일 | 제거된 중복 | 상태 |
|------|------|----------|------------|------|
| 1 | 토큰 키 통일 | 20개 | 18개 로컬 함수 | ✅ 완료 |
| 2 | API URL 통일 | 32개 | 113개 하드코딩 | ✅ 완료 |
| 3 | AI 서비스 통합 | - | - | 📋 예정 |

### 개선 효과

| 지표 | Before | After | 개선율 |
|------|--------|-------|--------|
| 토큰 관리 함수 | 18개 분산 | 3개 공통 | 83% 감소 |
| 하드코딩 URL | 113건 | 2건 (기본값) | 98% 감소 |
| 모바일 테스트 설정 | 수동 변경 | 자동 감지 | 100% 자동화 |

### Git 커밋 이력

```
9a43ce5 - docs: M20 리팩토링 완료 상태 반영
9c4b067 - refactor(M20): API URL 통일 - getApiUrl() 전역 사용
8046d85 - feat(M18-M20): 시너지 기능, 커뮤니티, 리팩토링
```

---

## ⚠️ 주의사항

### 리팩토링 후 테스트 필수

1. **브라우저 캐시 삭제**
   ```javascript
   localStorage.clear()
   ```

2. **재로그인 테스트**
   - 로그인 → 대시보드 이동 → 새로고침 → 로그아웃

3. **모바일 테스트**
   - 같은 네트워크의 모바일 기기에서 IP로 접속 테스트

### 롤백 방법

문제 발생 시 Git으로 즉시 롤백:

```bash
git revert 9c4b067  # API URL 통일 되돌리기
git revert 8046d85  # 토큰 통일 되돌리기
```

---

## 🔗 관련 문서

| 문서 | 설명 |
|------|------|
| [MILESTONES-FINAL.md](./MILESTONES-FINAL.md) | 전체 마일스톤 요약 |
| [MILESTONES-WP-SCENARIO.md](./MILESTONES-WP-SCENARIO.md) | WP별 시나리오 통합 |
| [agent.md](./agent.md) | 개발 가이드 및 규칙 |

---

> 📝 **Note**: 이 문서는 리팩토링 진행에 따라 업데이트됩니다.  
> 마지막 업데이트: 2025-12-19


