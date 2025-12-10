# 🧩 M8 — 컨설턴트 기능 (Premium Layer)

> **목적**: 프리미엄 서비스의 핵심 가치인 전문 컨설턴트 상담 기능 구현  
> **Last Updated**: 2025-12-06

---

## 🎯 마일스톤 목적

- 프리미엄 핵심 가치이자 수익 모델의 핵심
- 전문 컨설턴트의 1:1 맞춤 상담 제공
- AI 기반 효율적인 리포트 생성
- 학생/학부모에게 체계적인 상담 결과 전달

---

## 📦 산출물

### 1. 컨설턴트 승인 시스템 (WP8.0)
- [ ] 관리자 컨설턴트 목록 조회 API
- [ ] 관리자 컨설턴트 승인 API
- [ ] 관리자 컨설턴트 거부 API
- [ ] 승인 상태별 접근 제어

### 2. 컨설턴트 대시보드 (WP8.1)
- [ ] 컨설턴트 대시보드 API
- [ ] 프로필 조회/수정 API
- [ ] 가용 시간 설정 API
- [ ] CONSULTANT Role Guard

### 3. 상담 예약 시스템 (WP8.2)
- [ ] 컨설턴트 목록 조회 API (예약용)
- [ ] 예약 가능 시간 슬롯 API
- [ ] 상담 예약 생성 API
- [ ] 예약 확정/거절 API
- [ ] 예약 취소 API
- [ ] 일정 중복 방지 로직

### 4. 상담 기록 시스템 (WP8.3)
- [ ] 상담 상세 조회 API
- [ ] 학생 요약 정보 API
- [ ] 상담 노트 CRUD API
- [ ] 상담 완료 처리 API

### 5. AI 상담 리포트 (WP8.4)
- [ ] AI 리포트 초안 생성 API
- [ ] 리포트 조회/수정 API
- [ ] 리포트 확정 API
- [ ] AI 장애 시 Fallback 처리

### 6. 리포트 공유 (WP8.5)
- [ ] 리포트 공유 API
- [ ] 공유받은 리포트 목록 API
- [ ] 공유받은 리포트 상세 API
- [ ] 권한 검증 로직

---

## 🗂 스키마 변경

### 기존 스키마 수정

#### 1. EventType 확장
```prisma
enum EventType {
  // ... 기존 타입 유지
  CONSULTATION_REQUESTED   // 상담 예약 요청
  CONSULTATION_CONFIRMED   // 상담 확정
  CONSULTATION_COMPLETED   // 상담 완료
  REPORT_SHARED            // 리포트 공유
}
```

#### 2. AIOutputType 확장
```prisma
enum AIOutputType {
  // ... 기존 타입 유지
  CONSULTATION_REPORT      // AI 상담 리포트 초안
}
```

#### 3. User 모델 확장
```prisma
model User {
  // 기존 필드 유지 + 추가 필드
  bio            String?    @db.Text  // 컨설턴트 소개글
  specialty      String?              // 전문 분야
  experience     String?    @db.Text  // 경력/자격
  profileImage   String?              // 프로필 이미지
  hasPremium     Boolean    @default(false)  // M9 임시 필드
  
  // M8 관계 추가
  consultantAvailabilities ConsultantAvailability[]
  studentConsultations     Consultation[] @relation("StudentConsultations")
  parentConsultations      Consultation[] @relation("ParentConsultations")
  consultantConsultations  Consultation[] @relation("ConsultantConsultations")
  notifications            Notification[]
}
```

---

### 신규 Enums
```prisma
enum ConsultationStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum ConsultationMethod {
  ONLINE
  OFFLINE
}

enum ReportStatus {
  DRAFT
  FINALIZED
}
```

### Models
```prisma
model ConsultantAvailability {
  id           String   @id @default(cuid())
  consultantId String
  dayOfWeek    Int      // 0~6
  startTime    String   // "09:00"
  endTime      String   // "18:00"
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  consultant User @relation(...)
  @@unique([consultantId, dayOfWeek])
  @@map("consultant_availabilities")
}

model Consultation {
  id           String              @id @default(cuid())
  studentId    String
  parentId     String
  consultantId String
  status       ConsultationStatus  @default(PENDING)
  method       ConsultationMethod  @default(ONLINE)
  scheduledAt  DateTime
  duration     Int                 @default(60)
  topic        String?             @db.Text
  cancelReason String?
  completedAt  DateTime?
  createdAt    DateTime            @default(now())
  updatedAt    DateTime            @updatedAt

  student    User                 @relation("StudentConsultations", ...)
  parent     User                 @relation("ParentConsultations", ...)
  consultant User                 @relation("ConsultantConsultations", ...)
  notes      ConsultationNote[]
  report     ConsultationReport?
  @@map("consultations")
}

model ConsultationNote {
  id             String   @id @default(cuid())
  consultationId String
  content        String   @db.Text
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  consultation Consultation @relation(...)
  @@map("consultation_notes")
}

model ConsultationReport {
  id             String       @id @default(cuid())
  consultationId String       @unique
  title          String
  summary        String?      @db.Text
  content        String       @db.Text
  aiDraftContent String?      @db.Text
  status         ReportStatus @default(DRAFT)
  sharedAt       DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  consultation Consultation @relation(...)
  @@map("consultation_reports")
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String
  title     String
  message   String   @db.Text
  isRead    Boolean  @default(false)
  metadata  String?  @db.Text
  createdAt DateTime @default(now())

  user User @relation(...)
  @@index([userId, isRead])
  @@map("notifications")
}
```

---

## 🔗 의존성

| 모듈 | 의존 내용 |
|------|----------|
| **M1 Auth** | CONSULTANT Role, ConsultantStatus 활용 |
| **M2 Student Data** | 학생 성적/활동 데이터 조회 |
| **M4 Diagnosis** | 진단 결과 조회 |
| **M5 AI** | 리포트 초안 생성 Orchestrator |
| **M6 Task** | 액션 플랜 진행 현황 |
| **M7 Dashboard** | 학생 요약 정보 API 재사용 |
| **M9 Payment** | 구독 상태 확인 (선택적) |

---

## 📋 API 엔드포인트 (32개)

| 그룹 | Count | 주요 엔드포인트 |
|------|-------|----------------|
| WP8.0 Admin | 3 | `/admin/consultants`, `/:id/approve`, `/:id/reject` |
| WP8.1 Dashboard | 5 | `/consultant/dashboard`, `/profile`, `/availability` |
| WP8.2 Booking | 9 | `/consultants`, `/consultations`, `/confirm`, `/cancel` |
| WP8.3 Notes | 6 | `/consultations/:id/notes`, `/student-summary`, `/complete` |
| WP8.4 Report | 4 | `/report/generate`, `/report`, `/report/finalize` |
| WP8.5 Share | 5 | `/report/share`, `/reports/received` |

---

## ⚠️ 구현 시 주의사항

### 1. M9 의존성 해결
상담 예약 시 구독 상태 확인이 필요하나, M9가 아직 구현되지 않음.

**임시 해결책:**
```prisma
// User 모델에 임시 필드 추가
model User {
  // ... 기존 필드
  hasPremium Boolean @default(false)  // M9 완료 후 제거
}
```

### 2. 알림 시스템
- 예약 확정/취소, 리포트 공유 시 알림 필요
- Notification 모델로 인앱 알림 구현
- 또는 이메일 발송으로 대체 가능

### 3. 시간대 처리
- 모든 시간은 서버 시간(KST) 기준
- 클라이언트에서 타임존 변환 처리

---

## 🚀 구현 순서 (권장)

```
1. 스키마 추가 (ConsultantAvailability, Consultation, ConsultationNote, ConsultationReport)
   ↓
2. WP8.0 - 컨설턴트 승인 API (Admin)
   ↓
3. WP8.1 - 컨설턴트 대시보드 + 가용시간 설정
   ↓
4. WP8.2 - 상담 예약 시스템
   ↓
5. WP8.3 - 상담 노트 + 완료 처리
   ↓
6. WP8.4 - AI 리포트 생성
   ↓
7. WP8.5 - 리포트 공유
   ↓
8. Notification 모델 (Optional)
```

---

## ✅ 완료 기준

- [ ] 관리자가 컨설턴트를 승인/거부할 수 있다
- [ ] 승인된 컨설턴트가 가용 시간을 설정할 수 있다
- [ ] 학부모가 컨설턴트와 상담을 예약할 수 있다
- [ ] 컨설턴트가 예약을 확정/거절할 수 있다
- [ ] 컨설턴트가 상담 노트를 작성할 수 있다
- [ ] AI가 상담 리포트 초안을 생성할 수 있다
- [ ] 컨설턴트가 리포트를 수정하고 확정할 수 있다
- [ ] 확정된 리포트를 학생/학부모에게 공유할 수 있다
- [ ] 학생/학부모가 공유받은 리포트를 조회할 수 있다
