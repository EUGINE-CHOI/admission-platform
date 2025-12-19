# 🧩 M19 — 커뮤니티 & AI 고급 기능 (Community & AI Advanced Layer)

> **버전**: 1.0
> **의존성**: M1 (로그인), M5 (AI)
> **상태**: ✅ 완료

---

## 🎯 목적

- 커뮤니티 기반 정보 공유 플랫폼
- AI 자기소개서 작성 지원
- 학교별 합격 예측 고도화

---

## 📦 산출물

| 구분 | 항목 | 설명 |
|------|------|------|
| **Backend** | Q&A 커뮤니티 | 질문/답변 시스템 |
| **Backend** | 합격생 후기 | 후기 공유 플랫폼 |
| **Backend** | AI 자기소개서 | 초안/첨삭 서비스 |
| **Backend** | 합격 예측 AI | 학교별 합격 확률 |

---

## 📋 Work Packages

### WP19.1 — Q&A 커뮤니티

**산출물:**
- [x] 질문 작성/조회 API
- [x] 답변 작성/조회 API
- [x] 좋아요 기능
- [x] 답변 채택 기능

**API 엔드포인트:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/community/questions` | 질문 목록 |
| POST | `/api/community/questions` | 질문 작성 |
| POST | `/api/community/questions/:id/answers` | 답변 작성 |
| POST | `/api/community/questions/:id/like` | 좋아요 |

---

### WP19.2 — 합격생 후기

**산출물:**
- [x] 후기 작성/조회 API
- [x] 검증 뱃지 (합격 확인)
- [x] 댓글 기능
- [x] 좋아요 기능

**API 엔드포인트:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/community/stories` | 후기 목록 |
| POST | `/api/community/stories` | 후기 작성 |
| POST | `/api/community/stories/:id/comments` | 댓글 |

---

### WP19.3 — AI 자기소개서 도우미

**산출물:**
- [x] 자기소개서 초안 생성
- [x] 첨삭 피드백
- [x] 학교별 템플릿

**API 엔드포인트:**
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/ai/personal-statement/generate` | 초안 생성 |
| POST | `/api/ai/personal-statement/review` | 첨삭 |
| GET | `/api/ai/personal-statement/templates` | 템플릿 |

---

### WP19.4 — 학교별 합격 예측 AI

**산출물:**
- [x] 현재 스펙 기반 합격 확률 계산
- [x] 학교별 상세 분석
- [x] 개선 추천 제공

**API 엔드포인트:**
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/ai/admission-prediction` | 합격 예측 |
| POST | `/api/ai/admission-prediction/improve` | 개선 추천 |

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

frontend/src/app/dashboard/student/
├── qna/page.tsx
├── stories/page.tsx
├── statement/page.tsx
└── prediction/page.tsx
```

---

## ✅ 완료 조건

- [x] Q&A 질문/답변 CRUD 동작
- [x] 좋아요/채택 기능 동작
- [x] 합격생 후기 작성/조회 동작
- [x] AI 자기소개서 생성 동작
- [x] 합격 예측 확률 표시

