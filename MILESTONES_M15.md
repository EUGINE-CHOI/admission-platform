# 🧩 M15 — 사용자 경험 개선 (UX Polish Layer)

> **버전**: 1.0
> **의존성**: M1 (로그인), M7 (대시보드)
> **상태**: ✅ 완료

---

## 🎯 목적

- 신규 사용자 온보딩 개선
- 이메일 알림 시스템 구축
- 로딩/에러 상태 UI 표준화

---

## 📦 산출물

| 구분 | 항목 | 설명 |
|------|------|------|
| **Frontend** | 온보딩 튜토리얼 | react-joyride 가이드 |
| **Backend** | 이메일 서비스 | Nodemailer 연동 |
| **Frontend** | 로딩 UI | 스피너, 스켈레톤 |
| **Frontend** | 에러 UI | 에러 메시지, 재시도 |

---

## 📋 Work Packages

### WP15.1 — 온보딩 튜토리얼

**산출물:**
- [x] 첫 로그인 시 가이드 표시
- [x] 역할별 맞춤 튜토리얼
- [x] 단계별 하이라이트
- [x] 건너뛰기 옵션

**기술 스택:**
- react-joyride

---

### WP15.2 — 이메일 알림

**산출물:**
- [x] 환영 이메일
- [x] 상담 예약 알림
- [x] 진단 완료 알림
- [x] Nodemailer 설정

**API 엔드포인트:**
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/email/send` | 이메일 발송 |

---

### WP15.3 — 로딩/에러 상태 UI

**산출물:**
- [x] LoadingState 컴포넌트
- [x] SkeletonCard 컴포넌트
- [x] SkeletonList 컴포넌트
- [x] ErrorState 컴포넌트

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

## ✅ 완료 조건

- [x] 온보딩 튜토리얼 동작
- [x] 이메일 발송 성공
- [x] 로딩 상태 UI 표시
- [x] 에러 상태 UI 표시




