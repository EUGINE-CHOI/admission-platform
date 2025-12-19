# 🧩 M14 — 기능 완성도 강화 Work Packages

> **버전**: 1.0
> **상태**: ✅ 완료

---

## WP14.1 — 상담 예약 캘린더

**목표:** 입시 일정과 상담 일정 통합 관리

**산출물:**
- 입시 일정 캘린더 표시
- 상담 예약 일정 통합
- 캘린더에서 직접 예약

→ 일정 관리 편의성 향상

---

## WP14.2 — PDF 리포트 생성

**목표:** 학생 현황 리포트 다운로드

**산출물:**
- 학생 종합 리포트 PDF
- 진단 결과 PDF
- pdfkit 라이브러리 연동

**API:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/report/student/:id/pdf` | 학생 리포트 |
| GET | `/api/report/diagnosis/:id/pdf` | 진단 리포트 |

→ 오프라인에서 리포트 활용 가능

---

## WP14.3 — 보호자 대시보드 상세화

**목표:** 보호자 관점 정보 제공 강화

**산출물:**
- 성적 추이 차트
- 학생별 상세 페이지
- 활동 요약 카드

→ 보호자가 자녀 현황 쉽게 파악

---

## WP14.4 — 용어 통일

**목표:** UI 용어 일관성 확보

**산출물:**
- "학부모" → "보호자" 전환
- "자녀" → "학생" 전환
- UI 전체 용어 일관성

→ 사용자 혼란 방지

---

## 📁 파일 구조

```
backend/src/report/
├── report.module.ts
├── report.controller.ts
└── pdf.service.ts

frontend/src/app/dashboard/parent/
├── page.tsx
├── calendar/page.tsx
└── children/[childId]/page.tsx
```

---

## ✅ 완료 체크리스트

- [x] WP14.1: 상담 캘린더
- [x] WP14.2: PDF 리포트
- [x] WP14.3: 보호자 대시보드
- [x] WP14.4: 용어 통일

