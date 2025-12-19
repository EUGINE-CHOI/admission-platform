# 🧩 M21 — 기능 확장 Work Packages

> **버전**: 1.0
> **상태**: ✅ 완료

---

## WP21.1 — PDF 리포트 다운로드

**목표:** 학생 리포트 PDF 생성

**산출물:**
- 학생 대시보드 PDF 다운로드 버튼
- PDFKit 기반 리포트 생성

**API:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/report/student/:id/pdf` | 학생 PDF |

→ 오프라인 리포트 활용

---

## WP21.2 — 이메일 알림 스케줄러

**목표:** 자동 이메일 알림

**산출물:**
- D-Day 7일 전 알림 (매일 9시)
- 주간 학습 리포트 (매주 일요일)
- 상담 리마인더 (1시간 전)

**기술 스택:**
- @nestjs/schedule
- node-cron

→ 중요 일정 자동 알림

---

## WP21.3 — 위젯 커스터마이징

**목표:** 대시보드 개인화

**산출물:**
- useWidgetSettings 훅
- WidgetSettings 모달
- 위젯 토글/순서 변경
- localStorage 저장

→ 사용자별 맞춤 대시보드

---

## WP21.4 — 학습 캘린더

**목표:** 통합 일정 관리

**산출물:**
- D-Day + Task + 상담 통합 캘린더
- 월간/주간 뷰
- 날짜별 이벤트 목록

**위치:** `/dashboard/student/calendar`

→ 모든 일정 한눈에 확인

---

## WP21.5 — 상담 채팅

**목표:** 컨설턴트와 실시간 소통

**산출물:**
- 채팅 UI
- 메시지 전송/조회
- 폴링 기반 업데이트

**위치:** `/dashboard/student/chat`

→ 상담 시간 외 소통 가능

---

## WP21.6 — 학습 시간 트래커

**목표:** 과목별 학습 시간 관리

**산출물:**
- 과목별 스톱워치
- 학습 세션 저장
- 오늘/이번주 통계

**위치:** `/dashboard/student/study-time`

→ 학습 시간 자가 관리

---

## WP21.7 — AI 튜터 챗봇

**목표:** AI 기반 학습 질문 답변

**산출물:**
- 과목 선택 UI
- AI 질문/답변 인터페이스
- 대화 기록 저장

**위치:** `/dashboard/student/tutor`

→ 24시간 학습 지원

---

## WP21.8 — Coming Soon 페이지

**목표:** 향후 기능 안내

**산출물:**
- 대입 확장 Coming Soon
- 학원/과외 매칭 Coming Soon
- 멘토링 프로그램 Coming Soon

→ 서비스 로드맵 공유

---

## 📁 파일 구조

```
frontend/src/hooks/
├── useWidgetSettings.ts
└── useDarkMode.ts

frontend/src/app/dashboard/student/
├── calendar/page.tsx
├── chat/page.tsx
├── study-time/page.tsx
├── tutor/page.tsx
├── college/page.tsx
├── academy/page.tsx
└── mentoring/page.tsx

backend/src/notification/
└── email-scheduler.service.ts
```

---

## ✅ 완료 체크리스트

- [x] WP21.1: PDF 다운로드
- [x] WP21.2: 이메일 스케줄러
- [x] WP21.3: 위젯 설정
- [x] WP21.4: 학습 캘린더
- [x] WP21.5: 상담 채팅
- [x] WP21.6: 학습 시간
- [x] WP21.7: AI 튜터
- [x] WP21.8: Coming Soon

