# 🧩 M10 — Analytics & 운영 대시보드 (Growth Layer)

> **버전**: 2.0 (M9 완료 후 보완)
> **의존성**: M1~M9 전체 기능 완료 필수
> **예상 기간**: 1주

---

## 🎯 목적

- KPI 기반 서비스 성장 모니터링
- AI 품질 지속 개선
- 운영 안정성 확보
- 데이터 기반 의사결정 지원

---

## 📦 산출물

| 구분 | 항목 | 설명 |
|------|------|------|
| **Backend** | Admin 모듈 | 관리자 전용 API |
| **Backend** | KPI 서비스 | 통계 집계 로직 |
| **Backend** | AI 분석 서비스 | Feedback 분석 로직 |
| **Config** | Sentry 설정 | 오류 모니터링 연동 |
| **API** | 12개 엔드포인트 | 통계/KPI/AI 분석 |

---

## 🔗 의존성

### 필수 선행 완료

| 마일스톤 | 필요 데이터 | 상태 |
|----------|------------|------|
| M1 | User (가입 통계) | ✅ |
| M2 | Student Data (활동 통계) | ✅ |
| M4 | DiagnosisResult (진단 통계) | ✅ |
| M5 | AIOutput, AIFeedback (AI 분석) | ✅ |
| M6 | EventLog, WeeklyTask (KPI) | ✅ |
| M8 | Consultation (상담 통계) | ✅ |
| M9 | Subscription, Payment (매출) | ✅ |

---

## 📋 Work Packages

### WP10.0 — 시스템 모니터링 설정

**산출물:**
- [ ] Sentry SDK 설치 및 초기화
- [ ] 글로벌 예외 필터 설정
- [ ] Health check 엔드포인트

**API 엔드포인트:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/health` | 시스템 상태 확인 |

---

### WP10.1 — 운영 통계 대시보드

**산출물:**
- [ ] 전체 통계 요약 API
- [ ] 사용자 통계 API
- [ ] 이벤트 로그 통계 API

**API 엔드포인트:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/stats/overview` | 전체 통계 |
| GET | `/api/admin/stats/users` | 사용자 통계 |
| GET | `/api/admin/stats/events` | 이벤트 통계 |

**구현 로직:**
```typescript
// 사용자 통계
const userStats = await prisma.user.groupBy({
  by: ['role'],
  _count: true,
  where: {
    createdAt: { gte: periodStart, lte: periodEnd }
  }
});

// 이벤트 통계
const eventStats = await prisma.eventLog.groupBy({
  by: ['type'],
  _count: true,
  where: {
    createdAt: { gte: periodStart, lte: periodEnd }
  }
});
```

---

### WP10.2 — KPI 대시보드

**산출물:**
- [ ] 활동 입력률 계산 API
- [ ] 진단 실행률 계산 API
- [ ] 프리미엄 전환율 계산 API
- [ ] Task 완료율 계산 API
- [ ] 전체 KPI 요약 API

**API 엔드포인트:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/kpi` | 전체 KPI |
| GET | `/api/admin/kpi/activity-rate` | 활동 입력률 |
| GET | `/api/admin/kpi/diagnosis-rate` | 진단 실행률 |
| GET | `/api/admin/kpi/conversion-rate` | 전환율 |
| GET | `/api/admin/kpi/task-rate` | Task 완료율 |

**KPI 계산 공식:**

| KPI | 공식 |
|-----|------|
| 활동 입력률 | EventLog(입력 이벤트) / STUDENT 수 |
| 진단 실행률 | DiagnosisResult 수 / STUDENT 수 × 100 |
| 전환율 | 유료 Subscription / 신규 User × 100 |
| Task 완료율 | DONE Task / 전체 Task × 100 |

---

### WP10.3 — AI 품질 분석 도구

**산출물:**
- [ ] AI 품질 요약 API
- [ ] Feedback 통계 API
- [ ] 에이전트별 성능 API
- [ ] 수정 패턴 분석 API

**API 엔드포인트:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/ai/quality` | AI 품질 요약 |
| GET | `/api/admin/ai/feedback-stats` | Feedback 통계 |
| GET | `/api/admin/ai/agents` | 에이전트별 성능 |
| GET | `/api/admin/ai/quality/edit-patterns` | 수정 패턴 |

**품질 점수 계산:**
```typescript
// 만족도 점수 (0~100)
const satisfactionScore = 
  (likeCount * 100 + editedCount * 50) / totalFeedbacks;

// 품질 경고 기준
if (dislikeRate > 0.3 && previousDislikeRate < 0.15) {
  alerts.push({ type: 'QUALITY_DEGRADATION', ... });
}
```

---

## 🏗️ 구현 순서

```
1. WP10.0: Sentry 설정, Health check
   ↓
2. WP10.1: Admin 모듈 생성, 기본 통계 API
   ↓
3. WP10.2: KPI 계산 서비스, KPI API
   ↓
4. WP10.3: AI 분석 서비스, AI 품질 API
```

---

## 📁 파일 구조

```
backend/src/
├── admin/
│   ├── admin.module.ts
│   ├── admin.controller.ts
│   ├── services/
│   │   ├── stats.service.ts
│   │   ├── kpi.service.ts
│   │   └── ai-quality.service.ts
│   └── dto/
│       ├── query-period.dto.ts
│       └── index.ts
├── common/
│   └── filters/
│       └── sentry-exception.filter.ts
└── main.ts (Sentry 초기화)
```

---

## ✅ 완료 조건

### WP10.0
- [ ] Sentry SDK 초기화 성공
- [ ] 예외 발생 시 Sentry에 보고됨
- [ ] Health check API 응답 확인

### WP10.1
- [ ] Admin 역할만 접근 가능
- [ ] 전체 통계 요약 조회 성공
- [ ] 기간 필터링 동작 확인

### WP10.2
- [ ] 4가지 KPI 모두 계산 정확
- [ ] 트렌드(전월 대비) 계산 정확
- [ ] 데이터 없음 시 적절한 응답

### WP10.3
- [ ] Feedback 통계 집계 정확
- [ ] 에이전트별 성능 분리
- [ ] 품질 저하 경고 동작

---

## 🔒 보안 요구사항

1. **역할 기반 접근 제어**
   - 모든 `/api/admin/*` 엔드포인트는 ADMIN 역할 필수
   - JWT Guard + Roles Guard 적용

2. **민감 데이터 보호**
   - 개별 사용자 정보 노출 금지
   - 집계된 통계만 반환

3. **Rate Limiting**
   - 통계 API는 분당 60회 제한 (서버 부하 방지)

---

## 📊 테스트 시나리오

| 테스트 | 기대 결과 |
|--------|----------|
| ADMIN으로 KPI 조회 | 200 OK + KPI 데이터 |
| STUDENT로 KPI 조회 | 403 Forbidden |
| 빈 데이터로 조회 | "데이터 없음" 메시지 |
| 유효하지 않은 period | 400 Bad Request |

---

## 🔄 M8/M9 연동

### 상담 통계 (M8)
```sql
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
  AVG(duration) as avg_duration
FROM consultations
WHERE created_at BETWEEN ? AND ?
```

### 매출 통계 (M9)
```sql
SELECT 
  SUM(amount) as mrr,
  COUNT(DISTINCT user_id) as subscribers
FROM payments
WHERE status = 'COMPLETED'
  AND paid_at BETWEEN ? AND ?
```

---

## 🚀 배포 고려사항

1. **Sentry DSN 환경변수**
   ```
   SENTRY_DSN=https://xxx@sentry.io/xxx
   ```

2. **통계 쿼리 최적화**
   - 복잡한 집계는 캐싱 고려 (Redis)
   - 인덱스: `event_logs(student_id, created_at)`

3. **로깅**
   - Admin API 호출 로그 기록
   - 감사 추적 (누가, 언제, 무엇을 조회)
