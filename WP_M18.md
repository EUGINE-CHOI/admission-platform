# 🧩 M18 — 시너지 기능 Work Packages

> **버전**: 1.0
> **상태**: ✅ 완료

---

## WP18.1 — 성적 트렌드 분석

**목표:** 성적 변화 추이 분석

**산출물:**
- 과목별 성적 추이 그래프
- 학기별 비교 분석
- AI 기반 개선 조언

**API:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/synergy/grade-trend` | 성적 트렌드 |

→ 성적 패턴 파악 및 개선 방향 제시

---

## WP18.2 — 학교 비교

**목표:** 목표 학교 간 비교 분석

**산출물:**
- 정원, 경쟁률, 입학 요건 비교
- 비교표 UI
- 결과 저장/PDF

**API:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/synergy/compare-schools` | 학교 비교 |

→ 합리적인 목표 학교 선정

---

## WP18.3 — D-Day 대시보드

**목표:** 입시 일정 카운트다운

**산출물:**
- 목표 학교 입시 일정 D-Day
- 커스텀 D-Day 추가
- 중요 일정 알림

**API:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/synergy/d-day` | D-Day 목록 |
| POST | `/api/synergy/d-day` | D-Day 추가 |

→ 입시 일정 놓치지 않도록 관리

---

## WP18.4 — 면접 준비 도우미

**목표:** AI 기반 면접 연습

**산출물:**
- 학교별 예상 질문 생성
- AI 모의 면접
- 피드백 제공

**API:**
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/synergy/interview/questions` | 예상 질문 |
| POST | `/api/synergy/interview/practice` | 모의 면접 |

→ 면접 자신감 향상

---

## WP18.5 — 게이미피케이션

**목표:** 학습 동기 부여

**산출물:**
- 15종 성취 뱃지
- 뱃지 획득 조건 로직
- 뱃지 표시 UI

**API:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/badges` | 뱃지 목록 |
| GET | `/api/badges/my` | 내 뱃지 |

→ 성취감 기반 학습 동기 유발

---

## WP18.6 — 목표 성적 트래커

**목표:** 과목별 목표 관리

**산출물:**
- 과목별 목표 설정
- 달성률 추적
- 진행 상황 시각화

**API:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/goals` | 목표 목록 |
| POST | `/api/goals` | 목표 설정 |

→ 구체적인 학습 목표 관리

---

## WP18.7 — 합격 시뮬레이션

**목표:** 가상 시나리오 기반 예측

**산출물:**
- 현재 스펙 기준 합격 확률
- 변수 조정 기능
- 학교별 비교

**API:**
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/synergy/simulate` | 시뮬레이션 |

→ 다양한 시나리오 검토

---

## 📁 파일 구조

```
backend/src/synergy/
├── synergy.module.ts
├── synergy.controller.ts
├── grade-trend.service.ts
├── school-compare.service.ts
├── d-day.service.ts
└── interview.service.ts

backend/src/gamification/
├── gamification.module.ts
├── badge.service.ts
└── goal-tracker.service.ts
```

---

## ✅ 완료 체크리스트

- [x] WP18.1: 성적 트렌드
- [x] WP18.2: 학교 비교
- [x] WP18.3: D-Day
- [x] WP18.4: 면접 준비
- [x] WP18.5: 게이미피케이션
- [x] WP18.6: 목표 트래커
- [x] WP18.7: 시뮬레이션




