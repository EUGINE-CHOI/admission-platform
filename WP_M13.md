# 🧩 M13 — AI 멘토 고도화 Work Packages

> **버전**: 1.0
> **상태**: ✅ 완료

---

## WP13.1 — 빠른 조언 (Quick Advice)

**목표:** 입시 관련 즉각적인 AI 답변

**산출물:**
- 빠른 조언 API (2초 이내 응답)
- 카테고리별 조언 (성적, 활동, 면접)
- 추가 질문 제안

**API:**
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/ai/quick-advice` | 빠른 조언 |

→ 간단한 질문에 즉시 답변

---

## WP13.2 — 종합 분석 (Comprehensive Analysis)

**목표:** 학생 현황 심층 분석

**산출물:**
- 현황 분석 API
- 강점/약점 분석
- 핵심 개선 조언

**API:**
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/ai/analysis` | 종합 분석 |

→ 학생 전체 상황 파악 및 전략 제시

---

## WP13.3 — AI 학교 추천

**목표:** 맞춤형 목표 학교 제안

**산출물:**
- 성적/활동 기반 학교 매칭
- 적합도 점수 계산
- 추천 이유 설명

**API:**
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/ai/school-recommendations` | 학교 추천 |

→ 데이터 기반 합리적인 목표 설정

---

## WP13.4 — AI 히스토리

**목표:** AI 사용 기록 관리

**산출물:**
- AI 사용 기록 저장
- 최근 히스토리 조회
- 동일 질문 캐싱

**API:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/ai/history` | AI 히스토리 |

→ 이전 분석 결과 재활용 가능

---

## 📁 파일 구조

```
backend/src/ai/
├── ai.module.ts
├── ai.controller.ts
├── ai.service.ts
├── quick-advice.service.ts
├── analysis.service.ts
└── school-recommendation.service.ts
```

---

## ✅ 완료 체크리스트

- [x] WP13.1: 빠른 조언
- [x] WP13.2: 종합 분석
- [x] WP13.3: 학교 추천
- [x] WP13.4: AI 히스토리

