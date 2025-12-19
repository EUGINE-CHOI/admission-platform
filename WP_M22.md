# 🧩 M22 — UI/UX 고도화 Work Packages

> **버전**: 1.0
> **상태**: ✅ 완료

---

## WP22.1 — 애니메이션 시스템

**목표:** 일관된 애니메이션 효과

**산출물:**
- @keyframes 정의 (globals.css)
- Tailwind 애니메이션 확장
- 유틸리티 클래스

**애니메이션:**
| 클래스 | 효과 |
|--------|------|
| `animate-fade-in` | 페이드 인 |
| `animate-slide-up` | 슬라이드 업 |
| `animate-slide-down` | 슬라이드 다운 |
| `animate-scale-in` | 스케일 인 |
| `animate-bounce-in` | 바운스 인 |
| `animate-shimmer` | Shimmer |

→ 세련된 UI 전환 효과

---

## WP22.2 — 다크 모드

**목표:** 다크 테마 완성

**산출물:**
- CSS 변수 기반 테마
- useDarkMode 훅
- ThemeToggle 컴포넌트
- localStorage 저장

**다크 모드 색상:**
| 항목 | 색상 |
|------|------|
| 배경 | #0f172a |
| 텍스트 | #f8fafc |
| 카드 | #1e293b |

→ 눈 피로도 감소

---

## WP22.3 — Glass Morphism

**목표:** 모던한 UI 효과

**산출물:**
- `.glass` 클래스
- 반투명 배경 + 블러
- 다크 모드 지원

**CSS:**
```css
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
}
```

→ 세련된 시각적 효과

---

## WP22.4 — 스켈레톤 로더 개선

**목표:** 로딩 경험 향상

**산출물:**
- Shimmer 애니메이션 적용
- SkeletonCard 개선
- SkeletonList 개선
- SkeletonTable 개선

→ 로딩 중 콘텐츠 구조 미리보기

---

## 📁 파일 구조

```
frontend/src/app/
└── globals.css

frontend/tailwind.config.ts

frontend/src/hooks/
└── useDarkMode.ts

frontend/src/components/ui/
├── ThemeToggle.tsx
├── Button.tsx
├── Card.tsx
└── LoadingState.tsx
```

---

## ✅ 완료 체크리스트

- [x] WP22.1: 애니메이션
- [x] WP22.2: 다크 모드
- [x] WP22.3: Glass Morphism
- [x] WP22.4: 스켈레톤 개선

