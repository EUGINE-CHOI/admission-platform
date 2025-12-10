# 🧩 M8 — 컨설턴트 기능 (Premium Layer)

> **목적**: 프리미엄 서비스의 핵심인 전문 컨설턴트 상담 기능 제공  
> **의존성**: M1(계정), M2(학생데이터), M4(진단), M5(AI), M6(Task), M7(Dashboard)  
> **Last Updated**: 2025-12-06

---

## WP8.0 — 컨설턴트 승인 프로세스 (신규)

- 관리자(ADMIN)가 컨설턴트 계정 승인/거부
- ConsultantStatus: PENDING → APPROVED/REJECTED
- 승인된 컨설턴트만 상담 기능 사용 가능

→ **서비스 품질 관리 기반 확보**

---

## WP8.1 — 컨설턴트 로그인 & 대시보드

- Role=CONSULTANT + ConsultantStatus=APPROVED 확인
- 컨설턴트 전용 대시보드 (예약 현황, 상담 일정)
- 가용 시간 설정 (요일별 시작/종료 시간)

→ **컨설턴트 업무 환경 제공**

---

## WP8.2 — 상담 예약 시스템

- 학부모가 컨설턴트 선택 + 자녀 선택 + 시간 선택
- 컨설턴트 가용 시간 기반 슬롯 제공
- 예약 상태: PENDING → CONFIRMED/CANCELLED
- 일정 중복 방지
- 구독 상태 확인 (M9 연동)

→ **상담 스케줄링 기능 제공**

---

## WP8.3 — 상담 페이지 + 기록 기능

- 상담 상세 페이지 (예약 정보, 학생/학부모 정보)
- 학생 요약 정보 조회 (성적, 활동, 진단, 액션플랜)
- 상담 노트 작성/수정/삭제
- 상담 완료 처리 (CONFIRMED → COMPLETED)

→ **상담 준비 및 기록 관리**

---

## WP8.4 — AI 보조 상담 리포트 생성

- AI가 학생 데이터 + 상담 노트 기반 초안 생성
- 컨설턴트가 초안 수정 및 보완
- 리포트 상태: DRAFT → FINALIZED
- AI 장애 시 수동 작성 Fallback

→ **효율적인 리포트 작성 지원**

---

## WP8.5 — 리포트 공유 기능

- 확정된 리포트만 공유 가능
- 학생/학부모에게 공유 및 알림
- 권한 검증 (공유받은 사람만 조회 가능)
- 공유받은 리포트 목록 조회

→ **프리미엄 서비스 가치 전달**

---

## 📦 산출물 요약

| 구분 | 산출물 |
|------|--------|
| **API** | 컨설턴트 대시보드, 상담 예약 CRUD, 노트/리포트 관리 |
| **스키마** | ConsultantAvailability, Consultation, ConsultationNote, ConsultationReport |
| **AI 연동** | 상담 리포트 초안 생성 (M5 Orchestrator 활용) |
| **권한** | CONSULTANT Role Guard, 승인 상태 Guard |

---

## 🔗 기존 모듈 연동

| 모듈 | 연동 내용 |
|------|----------|
| M1 Auth | CONSULTANT Role, ConsultantStatus |
| M2 Student | 학생 성적/활동 데이터 조회 |
| M4 Diagnosis | 진단 결과, 추천 학교 |
| M5 AI | 리포트 초안 생성 |
| M6 Task | 액션 플랜 진행 현황 |
| M7 Dashboard | 학생 요약 정보 API 재사용 |
| M9 Payment | 구독 상태 확인 (연동 예정) |

---

## ⚠️ 주의사항

1. **M9 의존성**: 상담 예약 시 구독 체크 필요
   - 임시: User.hasPremium 필드로 처리
   - 완성: M9 Subscription 모델 연동

2. **알림 시스템**: 예약 확정/리포트 공유 시 알림 필요
   - Optional로 Notification 모델 구현
   - 또는 이메일 발송으로 대체 가능
