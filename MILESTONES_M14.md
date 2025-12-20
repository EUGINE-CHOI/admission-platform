# 🧩 M14 — 기능 완성도 강화 (Feature Polish Layer)

> **버전**: 1.0
> **의존성**: M7 (대시보드), M8 (상담)
> **상태**: ✅ 완료

---

## 🎯 목적

- 핵심 기능들의 완성도 향상
- 상담 예약 캘린더 통합
- PDF 리포트 생성
- 보호자 대시보드 상세화

---

## 📦 산출물

| 구분 | 항목 | 설명 |
|------|------|------|
| **Backend** | PDF Service | 리포트 PDF 생성 |
| **Frontend** | 상담 캘린더 | 입시일정 + 상담 통합 |
| **Frontend** | 보호자 대시보드 | 차트, 학생별 상세 |
| **UX** | 용어 통일 | 학부모 → 보호자 |

---

## 📋 Work Packages

### WP14.1 — 상담 예약 캘린더

**산출물:**
- [x] 입시 일정 캘린더 표시
- [x] 상담 예약 일정 통합
- [x] 캘린더 뷰에서 직접 예약

---

### WP14.2 — PDF 리포트 생성

**산출물:**
- [x] 학생 종합 리포트 PDF
- [x] 진단 결과 PDF
- [x] pdfkit 라이브러리 연동

**API 엔드포인트:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/report/student/:id/pdf` | 학생 리포트 PDF |
| GET | `/api/report/diagnosis/:id/pdf` | 진단 리포트 PDF |

---

### WP14.3 — 보호자 대시보드 상세화

**산출물:**
- [x] 성적 추이 차트
- [x] 학생별 상세 페이지
- [x] 활동 요약 카드

---

### WP14.4 — 용어 통일

**산출물:**
- [x] "학부모" → "보호자" 전환
- [x] "자녀" → "학생" 전환
- [x] UI 전체 용어 일관성

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

## ✅ 완료 조건

- [x] 상담 캘린더 통합 표시
- [x] PDF 다운로드 동작
- [x] 보호자 대시보드 차트 표시
- [x] 용어 통일 완료




