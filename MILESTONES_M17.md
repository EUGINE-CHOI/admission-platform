# 🧩 M17 — 모바일 & 성능 최적화 (Mobile & Performance Layer)

> **버전**: 1.0
> **의존성**: M7 (대시보드)
> **상태**: ✅ 완료

---

## 🎯 목적

- 모바일 사용자 경험 최적화
- 전반적인 성능 향상
- 모바일 테스트 환경 구축

---

## 📦 산출물

| 구분 | 항목 | 설명 |
|------|------|------|
| **Frontend** | 모바일 사이드바 | 슬라이드 애니메이션 |
| **Frontend** | 하단 네비게이션 | 역할별 주요 메뉴 |
| **Frontend** | 스켈레톤 UI | 로딩 상태 개선 |
| **Backend** | API 캐싱 | TTL 기반 캐싱 |
| **Config** | 동적 API URL | 모바일 환경 지원 |

---

## 📋 Work Packages

### WP17.1 — 모바일 반응형 UI

**산출물:**
- [x] 사이드바 슬라이드 애니메이션
- [x] 오버레이 배경
- [x] 햄버거 메뉴 버튼
- [x] 터치 최적화 (버튼 크기, 간격)

---

### WP17.2 — 하단 네비게이션 바

**산출물:**
- [x] 역할별 주요 메뉴 표시
- [x] 모바일에서만 표시
- [x] 현재 페이지 하이라이트

---

### WP17.3 — 성능 최적화

**산출물:**
- [x] 이미지 최적화 (WebP/AVIF)
- [x] 지연 로딩 (Lazy Loading)
- [x] 스켈레톤 UI 적용
- [x] API 캐싱 (TTL)

---

### WP17.4 — 모바일 테스트 환경

**산출물:**
- [x] 동적 API URL (getApiUrl)
- [x] CORS 확장 (모든 origin 허용)
- [x] 전체 네트워크 바인딩 (0.0.0.0)

**동적 URL 로직:**
```typescript
export function getApiUrl(): string {
  if (typeof window === "undefined") {
    return "http://localhost:3000";
  }
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3000";
  }
  return `http://${hostname}:3000`;
}
```

---

## 📁 파일 구조

```
frontend/src/components/layout/
├── Sidebar.tsx (모바일 슬라이드)
├── MobileNav.tsx (하단 네비게이션)
└── DashboardLayout.tsx

frontend/src/lib/
└── api.ts (getApiUrl)

backend/src/
└── main.ts (CORS 설정)
```

---

## ✅ 완료 조건

- [x] 모바일에서 사이드바 슬라이드 동작
- [x] 하단 네비게이션 표시
- [x] 스켈레톤 UI 로딩 표시
- [x] 모바일 기기에서 로그인 성공

