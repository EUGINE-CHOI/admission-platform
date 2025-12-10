# 🧩 M10 — Analytics & 운영 대시보드 Work Packages

> **버전**: 2.0 (M9 완료 후 보완)

---

## WP10.0 — 시스템 모니터링 설정

**목표:** Sentry 연동 및 시스템 헬스체크

**산출물:**
- Sentry SDK 초기화
- 글로벌 예외 필터
- Health check 엔드포인트

**API:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/health` | 시스템 상태 |

---

## WP10.1 — 운영 통계 대시보드

**목표:** 전체 시스템 운영 현황 파악

**산출물:**
- 전체 통계 요약 API
- 사용자 역할별/기간별 통계
- 이벤트 로그 집계

**API:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/stats/overview` | 전체 통계 요약 |
| GET | `/api/admin/stats/users` | 사용자 통계 |
| GET | `/api/admin/stats/events` | 이벤트 통계 |

→ 운영팀이 서비스 현황을 한눈에 파악 가능

---

## WP10.2 — KPI 대시보드

**목표:** 핵심 성과 지표 모니터링

**KPI 지표:**
- 월간 활동 입력률 (활동/학생)
- 진단 실행률 (%)
- 프리미엄 전환율 (%)
- Task 실행률 (%)

**API:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/kpi` | 전체 KPI 요약 |
| GET | `/api/admin/kpi/activity-rate` | 활동 입력률 |
| GET | `/api/admin/kpi/diagnosis-rate` | 진단 실행률 |
| GET | `/api/admin/kpi/conversion-rate` | 전환율 |
| GET | `/api/admin/kpi/task-rate` | Task 완료율 |

→ 운영팀·PM이 지표 기반 개선 가능

---

## WP10.3 — AI 품질 분석 도구

**목표:** AI 출력 품질 지속 개선

**분석 항목:**
- Feedback 패턴 분석 (LIKE/DISLIKE/EDITED)
- 에이전트별 성능 비교
- 품질 저하 경고 감지
- 수정 패턴 분석

**API:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/ai/quality` | AI 품질 요약 |
| GET | `/api/admin/ai/feedback-stats` | Feedback 통계 |
| GET | `/api/admin/ai/agents` | 에이전트별 성능 |
| GET | `/api/admin/ai/quality/edit-patterns` | 수정 패턴 |

→ AI의 지속적 개선 가능

---

## 📊 전체 API 엔드포인트 요약

| WP | Endpoints | 권한 |
|----|-----------|------|
| WP10.0 | 1개 | ADMIN |
| WP10.1 | 3개 | ADMIN |
| WP10.2 | 5개 | ADMIN |
| WP10.3 | 4개 | ADMIN |
| **합계** | **13개** | |

---

## 🔗 연동 포인트

### M6 (Task/Event) 연동
- `EventLog` → 활동 입력률 계산
- `WeeklyTask` → Task 완료율 계산

### M8 (Consultant) 연동
- `Consultation` → 상담 통계

### M9 (Subscription) 연동
- `Subscription` → 전환율 계산
- `Payment` → 매출 통계
