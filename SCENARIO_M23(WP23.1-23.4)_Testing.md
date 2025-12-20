# 🎬 Scenario M23 — 테스트 & QA

## 📋 시나리오 목록

---

## WP23.1 — Backend Unit Tests

### Scenario WP23.1-1: AuthService 로그인 테스트
```
Given: 유효한 이메일과 비밀번호가 주어졌을 때
When: login() 메서드를 호출하면
Then: JWT 토큰이 반환되어야 함
```

### Scenario WP23.1-2: AuthService 회원가입 테스트
```
Given: 새로운 사용자 정보가 주어졌을 때
When: signup() 메서드를 호출하면
Then: 새 사용자가 생성되고 토큰이 반환되어야 함
```

### Scenario WP23.1-3: StudentService 학생 조회 테스트
```
Given: 학생 ID가 주어졌을 때
When: getStudentProfile() 메서드를 호출하면
Then: 해당 학생의 프로필 정보가 반환되어야 함
```

### Scenario WP23.1-4: SchoolService 캐싱 테스트
```
Given: 학교 목록이 캐시에 없을 때
When: getPublishedSchools()를 호출하면
Then: DB에서 조회 후 캐시에 저장되어야 함

Given: 학교 목록이 캐시에 있을 때
When: getPublishedSchools()를 호출하면
Then: 캐시에서 즉시 반환되어야 함
```

### Scenario WP23.1-5: AiService 종합분석 테스트
```
Given: 학생 ID가 주어졌을 때
When: generateComprehensiveAnalysis()를 호출하면
Then: AI 기반 종합 분석 결과가 반환되어야 함
```

---

## WP23.2 — Backend E2E Tests

### Scenario WP23.2-1: 로그인 API 테스트
```
Given: 테스트 서버가 실행 중일 때
When: POST /api/auth/login 요청을 보내면
Then: 200 상태코드와 토큰이 반환되어야 함
```

### Scenario WP23.2-2: 학교 목록 API 테스트
```
Given: 인증된 사용자가 있을 때
When: GET /api/school 요청을 보내면
Then: 200 상태코드와 학교 목록이 반환되어야 함
```

### Scenario WP23.2-3: 학교 생성 API 테스트
```
Given: 관리자 권한이 있을 때
When: POST /api/school 요청을 보내면
Then: 201 상태코드와 생성된 학교 정보가 반환되어야 함
```

### Scenario WP23.2-4: AI 분석 API 테스트
```
Given: 인증된 학생 사용자가 있을 때
When: POST /api/ai/comprehensive 요청을 보내면
Then: AI 분석 결과가 반환되어야 함
```

---

## WP23.3 — Frontend Unit Tests

### Scenario WP23.3-1: Button 컴포넌트 테스트
```
Given: Button 컴포넌트가 렌더링되었을 때
When: 클릭 이벤트가 발생하면
Then: onClick 핸들러가 호출되어야 함

Given: disabled 속성이 true일 때
When: 클릭 이벤트가 발생하면
Then: onClick 핸들러가 호출되지 않아야 함
```

### Scenario WP23.3-2: useDarkMode 훅 테스트
```
Given: 기본 테마가 system일 때
When: toggleDarkMode()를 호출하면
Then: isDark가 true로 변경되어야 함

Given: 다크 모드가 활성화되었을 때
When: 페이지를 새로고침하면
Then: 다크 모드 상태가 유지되어야 함
```

### Scenario WP23.3-3: formatDDay 유틸 테스트
```
Given: 미래 날짜가 주어졌을 때
When: formatDDay()를 호출하면
Then: "D-N" 형식으로 반환되어야 함

Given: 오늘 날짜가 주어졌을 때
When: formatDDay()를 호출하면
Then: "D-Day"가 반환되어야 함
```

### Scenario WP23.3-4: useWidgetSettings 훅 테스트
```
Given: 기본 위젯 설정이 있을 때
When: toggleWidget()을 호출하면
Then: 해당 위젯의 enabled 상태가 토글되어야 함

Given: 위젯 순서가 변경되었을 때
When: localStorage를 확인하면
Then: 변경된 순서가 저장되어 있어야 함
```

---

## WP23.4 — E2E Tests (Cypress)

### Scenario WP23.4-1: 로그인 플로우 테스트
```
Given: 로그인 페이지에 있을 때
When: 유효한 자격증명을 입력하고 제출하면
Then: 대시보드로 리다이렉트되어야 함
```

### Scenario WP23.4-2: 대시보드 네비게이션 테스트
```
Given: 학생으로 로그인되어 있을 때
When: AI 멘토 메뉴를 클릭하면
Then: AI 멘토 페이지로 이동해야 함
```

### Scenario WP23.4-3: 다크 모드 토글 테스트
```
Given: 대시보드에 있을 때
When: 테마 토글 버튼을 클릭하면
Then: html 요소에 dark 클래스가 추가되어야 함
```

### Scenario WP23.4-4: 학교 검색 테스트
```
Given: 학교 탐색 페이지에 있을 때
When: 검색어를 입력하면
Then: 검색 결과가 필터링되어 표시되어야 함
```

### Scenario WP23.4-5: 보호자 자녀 현황 테스트
```
Given: 보호자로 로그인되어 있을 때
When: 대시보드에 접속하면
Then: 자녀 현황 정보가 표시되어야 함
```

### Scenario WP23.4-6: 신규 기능 접근 테스트
```
Given: 학생으로 로그인되어 있을 때
When: 학습 캘린더 페이지에 접속하면
Then: 캘린더 UI가 표시되어야 함

When: AI 튜터 페이지에 접속하면
Then: 채팅 입력창이 표시되어야 함
```

---

## 📊 시나리오 현황

| WP | 시나리오 수 | 상태 |
|----|------------|------|
| WP23.1 | 5 | ✅ 완료 |
| WP23.2 | 4 | ✅ 완료 |
| WP23.3 | 4 | ✅ 완료 |
| WP23.4 | 6 | ✅ 완료 |
| **합계** | **19** | **✅** |

---

_Last updated: 2025-12-20_



