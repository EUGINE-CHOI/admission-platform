# 🧩 M19 — 커뮤니티 & AI 고급 기능 Work Packages

> **버전**: 1.0
> **상태**: ✅ 완료

---

## WP19.1 — Q&A 커뮤니티

**목표:** 입시 정보 공유 커뮤니티

**산출물:**
- 질문/답변 CRUD
- 좋아요 기능
- 답변 채택 기능

**API:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/community/questions` | 질문 목록 |
| POST | `/api/community/questions` | 질문 작성 |
| POST | `/api/community/questions/:id/answers` | 답변 |
| POST | `/api/community/questions/:id/like` | 좋아요 |

→ 사용자 간 정보 공유

---

## WP19.2 — 합격생 후기

**목표:** 합격 경험 공유 플랫폼

**산출물:**
- 후기 작성/조회
- 검증 뱃지 (합격 확인)
- 댓글 기능

**API:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/community/stories` | 후기 목록 |
| POST | `/api/community/stories` | 후기 작성 |
| POST | `/api/community/stories/:id/comments` | 댓글 |

→ 실제 합격 경험 학습

---

## WP19.3 — AI 자기소개서 도우미

**목표:** AI 기반 자기소개서 작성 지원

**산출물:**
- 자기소개서 초안 생성
- 첨삭 피드백
- 학교별 템플릿

**API:**
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/ai/personal-statement/generate` | 초안 |
| POST | `/api/ai/personal-statement/review` | 첨삭 |
| GET | `/api/ai/personal-statement/templates` | 템플릿 |

→ 자기소개서 작성 부담 감소

---

## WP19.4 — 학교별 합격 예측 AI

**목표:** 데이터 기반 합격 확률 분석

**산출물:**
- 현재 스펙 기반 합격 확률
- 학교별 상세 분석
- 개선 추천 제공

**API:**
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/ai/admission-prediction` | 합격 예측 |
| POST | `/api/ai/admission-prediction/improve` | 개선 추천 |

→ 현실적인 목표 설정 지원

---

## 📁 파일 구조

```
backend/src/community/
├── community.module.ts
├── qna.controller.ts
├── qna.service.ts
├── story.controller.ts
└── story.service.ts

backend/src/ai/
├── personal-statement.service.ts
└── admission-prediction.service.ts
```

---

## ✅ 완료 체크리스트

- [x] WP19.1: Q&A 커뮤니티
- [x] WP19.2: 합격생 후기
- [x] WP19.3: AI 자기소개서
- [x] WP19.4: 합격 예측 AI




