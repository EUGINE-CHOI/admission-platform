# 📊 M10 — Analytics & 운영 대시보드 (Growth Layer) 시나리오

> **버전**: 2.0 (M9 구현 완료 후 보완)
> **의존성**: M1~M9 전체 기능 완료 필요
> **대상 사용자**: ADMIN 역할만 접근 가능

---

## 🔧 WP10.0 — 시스템 모니터링 설정 (Sentry Integration)

### Scenario WP10.0-1: Sentry SDK 설치 및 초기화 성공

**Given:**
- NestJS 백엔드 서버가 배포되어 있다
- Sentry 프로젝트가 생성되어 DSN이 발급되었다

**When:**
- 서버가 시작되고 `SENTRY_DSN` 환경변수가 설정되어 있다

**Then:**
- Sentry SDK가 초기화되고
- 모든 unhandled exception이 자동으로 Sentry에 보고된다
- 요청 정보(URL, method, user ID)가 함께 기록된다

**선행 Scenario:** 없음

---

### Scenario WP10.0-2: 글로벌 예외 필터에서 Sentry 보고

**Given:**
- Sentry SDK가 초기화되어 있다
- NestJS 글로벌 예외 필터가 설정되어 있다

**When:**
- API 실행 중 예기치 않은 오류가 발생한다

**Then:**
- 오류가 Sentry에 자동 보고되고
- 스택 트레이스, 요청 정보, 환경(prod/dev)이 포함된다
- 클라이언트에는 sanitized된 에러 메시지만 반환된다

**선행 Scenario:** WP10.0-1

---

### Scenario WP10.0-3: 헬스체크 엔드포인트 제공

**Given:**
- 서버가 정상 실행 중이다

**When:**
- `GET /api/admin/health` 요청

**Then:**
- 응답:
```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": "2025-01-15T10:00:00Z",
  "database": "connected",
  "sentry": "enabled"
}
```

**선행 Scenario:** WP10.0-1

---

## 📈 WP10.1 — 운영 통계 대시보드 (Admin Stats)

### API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/admin/stats/overview` | 전체 통계 요약 |
| GET | `/api/admin/stats/users` | 사용자 통계 |
| GET | `/api/admin/stats/events` | 이벤트 로그 통계 |

---

### Scenario WP10.1-1: 전체 통계 요약 조회 성공

**Given:**
- Admin 계정으로 로그인되어 있다
- 시스템에 사용자, 활동, 구독 데이터가 존재한다

**When:**
- `GET /api/admin/stats/overview?period=month`

**Then:**
- 응답:
```json
{
  "period": "2025-01",
  "users": {
    "total": 1000,
    "newThisPeriod": 120,
    "byRole": {
      "STUDENT": 600,
      "PARENT": 350,
      "CONSULTANT": 30,
      "ADMIN": 20
    }
  },
  "activities": {
    "totalEvents": 5000,
    "byType": {
      "GRADE_ADDED": 1200,
      "ACTIVITY_ADDED": 800,
      "DIAGNOSIS_RUN": 450
    }
  },
  "subscriptions": {
    "activeCount": 200,
    "byPlan": {
      "FREE": 800,
      "BASIC": 120,
      "PREMIUM": 60,
      "VIP": 20
    }
  }
}
```

**선행 Scenario:** 없음

---

### Scenario WP10.1-2: 사용자 통계 상세 조회

**Given:**
- Admin 계정으로 로그인되어 있다

**When:**
- `GET /api/admin/stats/users?period=month&groupBy=day`

**Then:**
- 일별 신규 가입자 수가 배열로 반환된다
```json
{
  "period": "2025-01",
  "data": [
    { "date": "2025-01-01", "signups": 15, "activeUsers": 340 },
    { "date": "2025-01-02", "signups": 12, "activeUsers": 355 }
  ]
}
```

**선행 Scenario:** WP10.1-1

---

### Scenario WP10.1-3: 권한 없는 사용자 접근 차단

**Given:**
- STUDENT 역할로 로그인되어 있다

**When:**
- `GET /api/admin/stats/overview`

**Then:**
- 403 Forbidden 응답
```json
{
  "message": "관리자 권한이 필요합니다",
  "statusCode": 403
}
```

**선행 Scenario:** 없음

---

## 📊 WP10.2 — KPI 대시보드

### API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/admin/kpi` | 전체 KPI 요약 |
| GET | `/api/admin/kpi/activity-rate` | 활동 입력률 |
| GET | `/api/admin/kpi/diagnosis-rate` | 진단 실행률 |
| GET | `/api/admin/kpi/conversion-rate` | 프리미엄 전환율 |
| GET | `/api/admin/kpi/task-rate` | Task 완료율 |

---

### Scenario WP10.2-1: 월간 활동 입력률 계산 성공

**Given:**
- 이번 달 활동 입력 이벤트가 500건 존재한다
- 활동 입력 대상 학생 수(STUDENT 역할)가 100명이다

**When:**
- `GET /api/admin/kpi/activity-rate?period=2025-01`

**Then:**
- 응답:
```json
{
  "period": "2025-01",
  "metric": "activity_input_rate",
  "value": 5.0,
  "unit": "activities_per_student",
  "breakdown": {
    "totalEvents": 500,
    "totalStudents": 100,
    "byEventType": {
      "GRADE_ADDED": 150,
      "ACTIVITY_ADDED": 200,
      "READING_ADDED": 100,
      "VOLUNTEER_ADDED": 50
    }
  },
  "trend": {
    "previousPeriod": 4.2,
    "changePercent": 19.0
  }
}
```

**선행 Scenario:** 없음 (EventLog M6 구현 필요)

---

### Scenario WP10.2-2: 프리미엄 전환율 계산 성공

**Given:**
- 이번 달 신규 가입자 수 = 100명
- 그 중 유료 구독(BASIC 이상) 전환 = 15명

**When:**
- `GET /api/admin/kpi/conversion-rate?period=2025-01`

**Then:**
- 응답:
```json
{
  "period": "2025-01",
  "metric": "premium_conversion_rate",
  "value": 15.0,
  "unit": "percent",
  "breakdown": {
    "newUsers": 100,
    "conversions": 15,
    "byPlan": {
      "BASIC": 8,
      "PREMIUM": 5,
      "VIP": 2
    }
  },
  "trend": {
    "previousPeriod": 12.0,
    "changePercent": 25.0
  }
}
```

**선행 Scenario:** 없음 (Subscription M9 구현 완료)

---

### Scenario WP10.2-3: 진단 실행률 계산 성공

**Given:**
- 이번 달 진단 실행 횟수 = 80회
- 활성 학생 수 = 100명

**When:**
- `GET /api/admin/kpi/diagnosis-rate?period=2025-01`

**Then:**
- 응답:
```json
{
  "period": "2025-01",
  "metric": "diagnosis_execution_rate",
  "value": 80.0,
  "unit": "percent",
  "breakdown": {
    "diagnosisCount": 80,
    "activeStudents": 100,
    "uniqueStudents": 65
  },
  "trend": {
    "previousPeriod": 70.0,
    "changePercent": 14.3
  }
}
```

**선행 Scenario:** 없음

---

### Scenario WP10.2-4: Task 완료율 계산 성공

**Given:**
- 이번 달 생성된 Task = 500개
- 완료(DONE) 상태 Task = 350개

**When:**
- `GET /api/admin/kpi/task-rate?period=2025-01`

**Then:**
- 응답:
```json
{
  "period": "2025-01",
  "metric": "task_completion_rate",
  "value": 70.0,
  "unit": "percent",
  "breakdown": {
    "totalTasks": 500,
    "byStatus": {
      "TODO": 100,
      "IN_PROGRESS": 50,
      "DONE": 350,
      "SKIPPED": 0
    }
  },
  "trend": {
    "previousPeriod": 65.0,
    "changePercent": 7.7
  }
}
```

**선행 Scenario:** 없음 (WeeklyTask M6 구현 완료)

---

### Scenario WP10.2-5: 전체 KPI 대시보드 요약 조회

**Given:**
- Admin 계정으로 로그인되어 있다

**When:**
- `GET /api/admin/kpi?period=2025-01`

**Then:**
- 모든 KPI 지표가 한 번에 반환:
```json
{
  "period": "2025-01",
  "kpis": {
    "activityRate": { "value": 5.0, "trend": 19.0 },
    "diagnosisRate": { "value": 80.0, "trend": 14.3 },
    "conversionRate": { "value": 15.0, "trend": 25.0 },
    "taskRate": { "value": 70.0, "trend": 7.7 }
  },
  "highlights": [
    "프리미엄 전환율이 전월 대비 25% 상승했습니다",
    "Task 완료율이 목표(75%)에 근접했습니다"
  ]
}
```

**선행 Scenario:** WP10.2-1 ~ WP10.2-4

---

### Scenario WP10.2-6: 데이터 부족 시 적절한 응답

**Given:**
- 서비스 런칭 첫 달로 데이터가 0건이다

**When:**
- `GET /api/admin/kpi?period=2025-01`

**Then:**
- 응답:
```json
{
  "period": "2025-01",
  "kpis": {
    "activityRate": { "value": null, "message": "데이터 없음" },
    "diagnosisRate": { "value": null, "message": "데이터 없음" },
    "conversionRate": { "value": null, "message": "데이터 없음" },
    "taskRate": { "value": null, "message": "데이터 없음" }
  },
  "highlights": ["충분한 데이터가 수집되면 KPI가 표시됩니다"]
}
```

**선행 Scenario:** 없음

---

## 🤖 WP10.3 — AI 품질 분석 도구

### API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/admin/ai/quality` | AI 품질 요약 |
| GET | `/api/admin/ai/feedback-stats` | Feedback 통계 |
| GET | `/api/admin/ai/agents` | 에이전트별 성능 |

---

### Scenario WP10.3-1: AI Feedback 통계 조회 성공

**Given:**
- 특정 기간 동안 AI 출력에 대한 Feedback이 존재한다:
  - LIKE: 200건
  - DISLIKE: 50건
  - EDITED: 80건

**When:**
- `GET /api/admin/ai/feedback-stats?period=2025-01`

**Then:**
- 응답:
```json
{
  "period": "2025-01",
  "totalFeedbacks": 330,
  "breakdown": {
    "LIKE": { "count": 200, "percent": 60.6 },
    "DISLIKE": { "count": 50, "percent": 15.2 },
    "EDITED": { "count": 80, "percent": 24.2 }
  },
  "satisfactionScore": 72.5,
  "trend": {
    "previousPeriod": 68.0,
    "changePercent": 6.6
  }
}
```

**선행 Scenario:** 없음 (AIFeedback M5 구현 완료)

---

### Scenario WP10.3-2: 에이전트별 성능 분석

**Given:**
- 각 AI 에이전트(생기부 문장, 동아리 추천 등)의 출력과 Feedback이 존재한다

**When:**
- `GET /api/admin/ai/agents?period=2025-01`

**Then:**
- 응답:
```json
{
  "period": "2025-01",
  "agents": [
    {
      "type": "RECORD_SENTENCE",
      "name": "생기부 문장 생성",
      "outputs": 150,
      "feedbacks": 120,
      "likeRate": 65.0,
      "editRate": 25.0,
      "avgEditLength": 45
    },
    {
      "type": "CLUB_RECOMMENDATION",
      "name": "동아리 추천",
      "outputs": 80,
      "feedbacks": 60,
      "likeRate": 75.0,
      "editRate": 10.0,
      "avgEditLength": 12
    },
    {
      "type": "ACTION_PLAN",
      "name": "액션 플랜 생성",
      "outputs": 50,
      "feedbacks": 40,
      "likeRate": 80.0,
      "editRate": 15.0,
      "avgEditLength": 30
    }
  ],
  "bestPerforming": "ACTION_PLAN",
  "needsImprovement": "RECORD_SENTENCE"
}
```

**선행 Scenario:** WP10.3-1

---

### Scenario WP10.3-3: AI 품질 저하 경고 감지

**Given:**
- 최근 7일 동안 DISLIKE 비율이 30% 이상으로 급증했다
- 이전 주 DISLIKE 비율은 10%였다

**When:**
- `GET /api/admin/ai/quality?period=week`

**Then:**
- 응답에 경고 포함:
```json
{
  "period": "2025-01-08 ~ 2025-01-14",
  "overallScore": 55.0,
  "status": "WARNING",
  "alerts": [
    {
      "type": "QUALITY_DEGRADATION",
      "message": "AI 품질 저하가 감지되었습니다",
      "details": "DISLIKE 비율이 10% → 30%로 급증 (200% 증가)",
      "affectedAgent": "RECORD_SENTENCE"
    }
  ],
  "recommendations": [
    "생기부 문장 생성 프롬프트 검토 필요",
    "최근 부정적 피드백 샘플 확인 권장"
  ]
}
```

**선행 Scenario:** WP10.3-1

---

### Scenario WP10.3-4: 수정 패턴 분석

**Given:**
- EDITED 타입 Feedback 중 수정된 내용(editedContent)이 존재한다

**When:**
- `GET /api/admin/ai/quality/edit-patterns?period=2025-01&agentType=RECORD_SENTENCE`

**Then:**
- 응답:
```json
{
  "period": "2025-01",
  "agentType": "RECORD_SENTENCE",
  "totalEdits": 80,
  "patterns": [
    { "type": "LENGTH_REDUCTION", "count": 30, "percent": 37.5 },
    { "type": "TONE_ADJUSTMENT", "count": 25, "percent": 31.25 },
    { "type": "FACT_CORRECTION", "count": 15, "percent": 18.75 },
    { "type": "STRUCTURE_CHANGE", "count": 10, "percent": 12.5 }
  ],
  "avgOriginalLength": 250,
  "avgEditedLength": 180,
  "insight": "사용자들이 주로 문장 길이를 줄이고 톤을 조정하는 경향이 있습니다"
}
```

**선행 Scenario:** WP10.3-1

---

### Scenario WP10.3-5: Feedback 데이터 없음 처리

**Given:**
- 아직 AI Feedback 데이터가 없다 (서비스 런칭 직후)

**When:**
- `GET /api/admin/ai/quality?period=2025-01`

**Then:**
- 응답:
```json
{
  "period": "2025-01",
  "overallScore": null,
  "status": "NO_DATA",
  "message": "아직 충분한 데이터가 없어 분석이 불가능합니다",
  "minDataRequired": {
    "feedbacks": 50,
    "currentCount": 0
  }
}
```

**선행 Scenario:** 없음

---

## 📋 스키마 요구사항

M10은 기존 M1~M9 스키마를 활용하며, 추가 스키마가 필요하지 않습니다.

### 활용하는 기존 모델

| 모델 | 용도 |
|------|------|
| `User` | 사용자 통계, 역할별 집계 |
| `EventLog` | 활동 입력률, 이벤트 통계 |
| `DiagnosisResult` | 진단 실행률 |
| `Subscription` | 구독 전환율 |
| `Payment` | 매출 통계 |
| `WeeklyTask` | Task 완료율 |
| `AIOutput` | AI 출력 통계 |
| `AIFeedback` | AI 품질 분석 |

---

## 🔐 접근 제어

모든 M10 API는 **ADMIN 역할만 접근 가능**합니다.

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController { ... }
```

---

## 📊 기간 필터링 옵션

| Parameter | 값 | 설명 |
|-----------|---|------|
| `period` | `YYYY-MM` | 월간 (기본값) |
| `period` | `YYYY-Www` | 주간 (ISO week) |
| `period` | `YYYY-MM-DD` | 일간 |
| `period` | `week` | 최근 7일 |
| `period` | `month` | 최근 30일 |
| `period` | `quarter` | 최근 90일 |

---

## 🔗 M8/M9 연동 포인트

### 상담 통계 (M8 연동)
```json
{
  "consultations": {
    "totalRequested": 50,
    "completed": 45,
    "avgDuration": 55,
    "satisfactionScore": 4.5
  }
}
```

### 매출 통계 (M9 연동)
```json
{
  "revenue": {
    "monthlyRecurring": 5000000,
    "newSubscriptions": 800000,
    "upgrades": 300000,
    "churnRate": 5.2
  }
}
```







