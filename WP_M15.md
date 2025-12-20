# 🧩 M15 — 사용자 경험 개선 Work Packages

> **버전**: 1.0
> **상태**: ✅ 완료

---

## WP15.1 — 온보딩 튜토리얼

**목표:** 신규 사용자 적응 지원

**산출물:**
- 첫 로그인 시 가이드 표시
- 역할별 맞춤 튜토리얼
- 단계별 하이라이트
- 건너뛰기 옵션

**기술 스택:**
- react-joyride

→ 신규 사용자 이탈률 감소

---

## WP15.2 — 이메일 알림

**목표:** 주요 이벤트 이메일 알림

**산출물:**
- 환영 이메일
- 상담 예약 알림
- 진단 완료 알림
- Nodemailer 설정

**API:**
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/email/send` | 이메일 발송 |

→ 중요 정보 놓치지 않도록 안내

---

## WP15.3 — 로딩/에러 상태 UI

**목표:** 사용자 경험 일관성

**산출물:**
- LoadingState 컴포넌트
- SkeletonCard 컴포넌트
- SkeletonList 컴포넌트
- ErrorState 컴포넌트

→ 로딩/에러 상황에서 명확한 피드백

---

## 📁 파일 구조

```
backend/src/email/
├── email.module.ts
├── email.service.ts
└── templates/

frontend/src/components/
├── onboarding/
│   └── OnboardingTutorial.tsx
└── ui/
    ├── LoadingState.tsx
    └── ErrorState.tsx
```

---

## ✅ 완료 체크리스트

- [x] WP15.1: 온보딩 튜토리얼
- [x] WP15.2: 이메일 알림
- [x] WP15.3: 로딩/에러 UI




