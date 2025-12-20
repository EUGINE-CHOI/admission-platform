# 👥 M19 — 커뮤니티 & AI 고급 기능 (Community & AI Advanced Layer) 시나리오

> **버전**: 1.0
> **의존성**: M1 (로그인), M5 (AI)
> **대상 사용자**: 모든 역할
> **상태**: ✅ 완료

---

## ❓ WP19.1 — Q&A 커뮤니티

### API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/community/questions` | 질문 목록 |
| POST | `/api/community/questions` | 질문 작성 |
| GET | `/api/community/questions/:id` | 질문 상세 |
| POST | `/api/community/questions/:id/answers` | 답변 작성 |
| POST | `/api/community/questions/:id/like` | 좋아요 |
| POST | `/api/community/answers/:id/accept` | 답변 채택 |

---

### Scenario WP19.1-1: 질문 작성

**Given:**
- 로그인된 사용자
- Q&A 페이지 접속

**When:**
- "질문하기" → 제목/내용 입력 → 저장

**Then:**
- 질문 등록 완료
- 질문 목록에 표시

**선행 Scenario:** WP1.1-3

---

### Scenario WP19.1-2: 답변 작성

**Given:**
- 질문 상세 페이지

**When:**
- 답변 입력 → "답변 등록"

**Then:**
- 답변 등록 완료
- 질문 작성자에게 알림

**선행 Scenario:** WP19.1-1

---

### Scenario WP19.1-3: 좋아요

**Given:**
- 질문/답변이 표시됨

**When:**
- 좋아요 버튼 클릭

**Then:**
- 좋아요 수 +1
- 버튼 활성화 표시
- 다시 클릭 시 좋아요 취소

**선행 Scenario:** WP19.1-1

---

### Scenario WP19.1-4: 답변 채택

**Given:**
- 질문 작성자가 질문 상세 페이지에 있다
- 답변이 1개 이상 존재

**When:**
- 답변의 "채택" 버튼 클릭

**Then:**
- 해당 답변 채택 표시
- 답변 작성자에게 알림
- 채택 뱃지 부여

**선행 Scenario:** WP19.1-2

---

## 📝 WP19.2 — 합격생 후기

### API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/community/stories` | 후기 목록 |
| POST | `/api/community/stories` | 후기 작성 |
| GET | `/api/community/stories/:id` | 후기 상세 |
| POST | `/api/community/stories/:id/comments` | 댓글 작성 |
| POST | `/api/community/stories/:id/like` | 좋아요 |

---

### Scenario WP19.2-1: 합격 후기 작성

**Given:**
- 로그인된 사용자
- 합격생 후기 페이지

**When:**
- "후기 작성" → 합격 학교, 내용 입력 → 저장

**Then:**
- 후기 등록 완료
- 관리자 검증 대기 상태

**선행 Scenario:** WP1.1-3

---

### Scenario WP19.2-2: 검증 뱃지 부여

**Given:**
- 합격 후기가 등록됨

**When:**
- 관리자가 합격 여부 확인 → 승인

**Then:**
- "검증된 합격생" 뱃지 부여
- 후기에 검증 마크 표시

**선행 Scenario:** WP19.2-1

---

### Scenario WP19.2-3: 댓글 작성

**Given:**
- 합격 후기 상세 페이지

**When:**
- 댓글 입력 → "댓글 등록"

**Then:**
- 댓글 등록 완료
- 후기 작성자에게 알림

**선행 Scenario:** WP19.2-1

---

### Scenario WP19.2-4: 학교별 후기 필터링

**Given:**
- 합격생 후기 목록 페이지

**When:**
- 학교 필터에서 "대원외고" 선택

**Then:**
- 대원외고 합격 후기만 표시

**선행 Scenario:** WP19.2-1

---

## ✍️ WP19.3 — AI 자기소개서 도우미

### API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/ai/personal-statement/generate` | 초안 생성 |
| POST | `/api/ai/personal-statement/review` | 첨삭 |
| GET | `/api/ai/personal-statement/templates` | 템플릿 |

---

### Scenario WP19.3-1: 자기소개서 초안 생성

**Given:**
- 학생 데이터 (활동, 성적) 존재
- 자기소개서 페이지 접속

**When:**
- 목표 학교 선택 → "초안 생성"

**Then:**
- AI가 학생 데이터 기반 초안 생성
- 학교별 맞춤 내용 포함
- 편집 가능한 형태로 제공

**선행 Scenario:** WP2.2-1

---

### Scenario WP19.3-2: 자기소개서 첨삭

**Given:**
- 자기소개서 초안이 작성됨

**When:**
- 내용 입력 → "첨삭 받기"

**Then:**
- AI가 개선점 피드백 제공:
  - 문장 다듬기
  - 구체적 표현 제안
  - 강점 강화 포인트

**선행 Scenario:** WP19.3-1

---

### Scenario WP19.3-3: 학교별 템플릿

**Given:**
- 자기소개서 페이지 접속

**When:**
- "템플릿" 탭 → 목표 학교 선택

**Then:**
- 해당 학교 자기소개서 가이드라인 표시
- 항목별 작성 팁 제공
- 예시 문구 제공

**선행 Scenario:** 없음

---

## 🎯 WP19.4 — 학교별 합격 예측 AI

### API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/ai/admission-prediction` | 합격 예측 |
| POST | `/api/ai/admission-prediction/improve` | 개선 추천 |

---

### Scenario WP19.4-1: 합격 예측 조회

**Given:**
- 학생 데이터 + 목표 학교 설정됨

**When:**
- 합격 예측 페이지 → "예측하기"

**Then:**
- 학교별 합격 확률 (%) 표시
- 현재 위치 분석
- 경쟁자 대비 분석

**선행 Scenario:** WP2.1-1, WP3.3-1

---

### Scenario WP19.4-2: 개선 추천

**Given:**
- 합격 예측 결과 확인

**When:**
- "개선점 보기" 클릭

**Then:**
- 합격 확률 높이기 위한 개선점 제시:
  - 성적 개선 목표
  - 추천 활동
  - 필요한 스펙
- 개선 시 예상 확률 변화 표시

**선행 Scenario:** WP19.4-1

---

### Scenario WP19.4-3: 여러 학교 비교 예측

**Given:**
- 여러 목표 학교 설정됨

**When:**
- 합격 예측 실행

**Then:**
- 학교별 합격 확률 비교표
- 가장 유리한 학교 추천
- 각 학교별 필요 개선점

**선행 Scenario:** WP19.4-1

---

## ✅ 완료 체크리스트

- [x] WP19.1-1: 질문 작성
- [x] WP19.1-2: 답변 작성
- [x] WP19.1-3: 좋아요
- [x] WP19.1-4: 답변 채택
- [x] WP19.2-1: 후기 작성
- [x] WP19.2-2: 검증 뱃지
- [x] WP19.2-3: 댓글
- [x] WP19.2-4: 학교 필터
- [x] WP19.3-1: 초안 생성
- [x] WP19.3-2: 첨삭
- [x] WP19.3-3: 템플릿
- [x] WP19.4-1: 합격 예측
- [x] WP19.4-2: 개선 추천
- [x] WP19.4-3: 비교 예측


