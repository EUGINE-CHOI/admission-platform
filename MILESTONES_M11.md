# 🧩 M11 — 뉴스 & 정보 서비스 (Info Service Layer)

> **버전**: 1.0
> **의존성**: M1 (로그인), M3 (학교 데이터)
> **상태**: ✅ 완료

---

## 🎯 목적

- 특목고 관련 최신 뉴스 자동 수집
- 사용자에게 입시 관련 정보 실시간 제공
- 뉴스 북마크 및 공유 기능

---

## 📦 산출물

| 구분 | 항목 | 설명 |
|------|------|------|
| **Backend** | News 모듈 | 뉴스 크롤링 및 제공 API |
| **Backend** | RSS Parser | Google News RSS 파싱 |
| **Frontend** | 뉴스 페이지 | 뉴스 목록 및 상세 모달 |
| **Frontend** | 북마크 기능 | 뉴스 저장 및 링크 복사 |

---

## 📋 Work Packages

### WP11.1 — Google News RSS 크롤링

**산출물:**
- [x] Google News RSS 파서
- [x] 키워드별 뉴스 수집 (외고, 자사고, 과학고, 영재고)
- [x] 뉴스 캐싱 (TTL 기반)

**API 엔드포인트:**
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/news` | 뉴스 목록 조회 |
| GET | `/api/news/:id` | 뉴스 상세 조회 |

---

### WP11.2 — 뉴스 상세 모달

**산출물:**
- [x] 뉴스 상세 모달 UI
- [x] 원문 링크 제공
- [x] 뉴스 북마크 기능
- [x] 링크 복사 기능

---

### WP11.3 — 데모 체험 모드

**산출물:**
- [x] 랜딩 페이지 데모 로그인 버튼
- [x] 테스트 계정 자동 로그인
- [x] 체험 중 뱃지 표시

---

## 📁 파일 구조

```
backend/src/news/
├── news.module.ts
├── news.controller.ts
├── news.service.ts
└── dto/
    └── news.dto.ts

frontend/src/app/dashboard/student/news/
└── page.tsx
```

---

## ✅ 완료 조건

- [x] Google News RSS에서 실시간 뉴스 수집
- [x] 키워드 필터링 동작
- [x] 뉴스 상세 모달 표시
- [x] 북마크/링크 복사 동작
- [x] 데모 모드 동작


