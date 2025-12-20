# 🧩 M13 — AI 멘토 고도화 (AI Advanced Layer)

> **버전**: 1.0
> **의존성**: M5 (AI 에이전트)
> **상태**: ✅ 완료

---

## 🎯 목적

- AI 기반 멘토링 기능 다양화
- 빠른 조언 / 종합 분석 / 학교 추천 분리
- AI 사용 히스토리 저장 및 재활용

---

## 📦 산출물

| 구분 | 항목 | 설명 |
|------|------|------|
| **Backend** | Quick Advice API | 즉각적인 입시 조언 |
| **Backend** | Analysis API | 현황 분석 + 핵심 조언 |
| **Backend** | Recommendation API | 맞춤형 학교 리스트 |
| **Frontend** | AI 히스토리 | 최근 사용 기록 저장 |

---

## 📋 Work Packages

### WP13.1 — 빠른 조언 (Quick Advice)

**산출물:**
- [x] 입시 관련 즉시 답변 API
- [x] 짧은 응답 시간 (2초 이내)
- [x] 카테고리별 조언 (성적, 활동, 면접)

**API 엔드포인트:**
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/ai/quick-advice` | 빠른 조언 요청 |

---

### WP13.2 — 종합 분석 (Comprehensive Analysis)

**산출물:**
- [x] 학생 현황 분석 API
- [x] 강점/약점 분석
- [x] 핵심 개선 조언 제공

**API 엔드포인트:**
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/ai/analysis` | 종합 분석 요청 |

---

### WP13.3 — AI 학교 추천

**산출물:**
- [x] 성적/활동 기반 학교 매칭
- [x] 적합도 점수 계산
- [x] 추천 이유 설명

**API 엔드포인트:**
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/ai/school-recommendations` | 학교 추천 요청 |

---

### WP13.4 — AI 히스토리

**산출물:**
- [x] AI 사용 기록 저장
- [x] 최근 히스토리 조회
- [x] 히스토리 재활용 (동일 질문 캐싱)

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

## ✅ 완료 조건

- [x] 빠른 조언 2초 이내 응답
- [x] 종합 분석 결과 구조화
- [x] 학교 추천 적합도 점수 정확
- [x] AI 히스토리 저장/조회 동작




