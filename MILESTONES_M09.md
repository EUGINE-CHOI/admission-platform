# 🧩 M9 — 결제/구독 시스템 (Business Layer)

> **Last Updated**: 2025-12-06

---

## 🎯 목적

지속 가능한 비즈니스 모델을 구축하고, 프리미엄 서비스(M8 컨설턴트 상담)에 대한 과금 체계를 완성한다.

---

## 📦 산출물

| 구분 | 산출물 | 설명 |
|------|-------|------|
| **플랜** | 구독 플랜 시스템 | FREE/BASIC/PREMIUM/VIP 4단계 |
| **결제** | PG 연동 | Toss Payments 또는 Portone |
| **구독** | 구독 관리 | 시작/취소/갱신/재활성화 |
| **할인** | 가족 할인 | 자녀 수에 따른 자동 할인 (10~20%) |
| **연동** | M8 프리미엄 잠금 | 구독 상태에 따른 상담 기능 제어 |

---

## 📋 Work Package 구성

| WP | 이름 | 시나리오 수 | API 수 |
|----|-----|-----------|--------|
| WP9.0 | 구독 플랜 조회 | 3개 | 2개 |
| WP9.1 | 결제 플로우 | 6개 | 4개 |
| WP9.2 | 구독 상태 관리 | 5개 | 5개 |
| WP9.3 | 가족 할인 | 3개 | 1개 |
| WP9.4 | M8 프리미엄 연동 | 4개 | 2개 |
| **합계** | | **21개** | **14개** |

---

## 🔗 의존성

### 선행 의존성
| 모듈 | 의존 내용 |
|------|----------|
| M1 Auth | 학부모 인증, JWT |
| M1 Family | 가족 구성원 수 (할인 계산) |
| M8 Consultant | 상담 예약 시 구독 체크 |

### 후행 영향
| 모듈 | 영향 내용 |
|------|----------|
| M8 | hasPremium → Subscription 연동 |
| M10 | 결제 전환율 분석 |

---

## 📊 스키마 요구사항

### 신규 Enum
```prisma
enum PlanType {
  FREE
  BASIC
  PREMIUM
  VIP
}

enum SubscriptionStatus {
  ACTIVE
  TRIAL
  PAST_DUE
  CANCELLED
  EXPIRED
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}
```

### 신규 모델
| 모델 | 설명 |
|------|------|
| `Plan` | 구독 플랜 정의 (가격, 기능 등) |
| `Subscription` | 사용자 구독 정보 |
| `Payment` | 결제 기록 |

### 기존 모델 수정
| 모델 | 수정 내용 |
|------|----------|
| `User` | `subscriptions` 관계 추가 |

---

## 🛠️ 구현 순서

### Phase 1: 기반 구축
1. 스키마 추가 (Enum, Plan, Subscription, Payment)
2. Prisma migrate
3. Plan 시드 데이터 (FREE, BASIC, PREMIUM, VIP)

### Phase 2: 플랜 조회
4. WP9.0: Plans 모듈 (GET /plans)

### Phase 3: 결제 연동
5. WP9.1: Subscription 모듈 (POST /subscriptions)
6. WP9.1: Webhook 처리 (POST /payments/webhook)

### Phase 4: 구독 관리
7. WP9.2: 구독 상태 API (GET, POST)

### Phase 5: 가족 할인
8. WP9.3: 할인 계산 로직

### Phase 6: M8 연동
9. WP9.4: hasPremium 동기화
10. WP9.4: 상담 횟수 체크 로직

---

## ✅ 완료 기준

### 기능 완료
- [ ] 플랜 목록 조회 API 작동
- [ ] 결제 시작 → Webhook → 구독 활성화 플로우 완료
- [ ] 구독 취소/재활성화 작동
- [ ] 가족 할인 자동 적용
- [ ] M8 상담 예약 시 구독 체크 작동

### 테스트 완료
- [ ] WP9.0 시나리오 3개 통과
- [ ] WP9.1 시나리오 6개 통과
- [ ] WP9.2 시나리오 5개 통과
- [ ] WP9.3 시나리오 3개 통과
- [ ] WP9.4 시나리오 4개 통과

### 통합 테스트
- [ ] 결제 → 구독 활성화 → 상담 예약 E2E 테스트
- [ ] 구독 만료 → 상담 차단 E2E 테스트
- [ ] 가족 할인 적용 결제 테스트

---

## 📁 파일 구조 (예상)

```
backend/src/
├── plan/
│   ├── dto/
│   │   └── query-plan.dto.ts
│   ├── plan.service.ts
│   ├── plan.controller.ts
│   └── plan.module.ts
├── subscription/
│   ├── dto/
│   │   ├── create-subscription.dto.ts
│   │   ├── cancel-subscription.dto.ts
│   │   └── update-payment-method.dto.ts
│   ├── subscription.service.ts
│   ├── subscription.controller.ts
│   └── subscription.module.ts
├── payment/
│   ├── dto/
│   │   └── webhook.dto.ts
│   ├── payment.service.ts
│   ├── payment.controller.ts
│   └── payment.module.ts
```

---

## 🔄 M8 수정 필요사항

M9 완료 후 M8의 `consultation.service.ts`를 수정해야 합니다:

### 변경 전 (현재)
```typescript
// 단순 hasPremium 필드 체크
if (!parent.hasPremium) {
  throw new ForbiddenException('상담 예약은 프리미엄 구독이 필요합니다');
}
```

### 변경 후 (M9 연동)
```typescript
// Subscription 모델 기반 체크
const { allowed, remaining } = await this.subscriptionService.checkConsultationLimit(parentId);

if (!allowed) {
  if (remaining === 0) {
    throw new ForbiddenException('이번 달 상담 횟수를 모두 사용했습니다');
  }
  throw new ForbiddenException('상담 예약은 프리미엄 구독이 필요합니다');
}
```

---

## ⚙️ 환경 변수 (추가 필요)

```env
# PG 연동 (Toss Payments 예시)
TOSS_CLIENT_KEY=your-client-key
TOSS_SECRET_KEY=your-secret-key
TOSS_WEBHOOK_SECRET=your-webhook-secret

# 또는 Portone
PORTONE_IMP_KEY=your-imp-key
PORTONE_IMP_SECRET=your-imp-secret
```

---

## 📝 참고 문서

- [SCENARIO_M9(WP9.0-9.4)_Subscription.md](./SCENARIO_M9(WP9.0-9.4)_Subscription.md)
- [SCENARIO_M8(WP8.1-8.5)_Premium Layer.md](./SCENARIO_M8(WP8.1-8.5)_Premium%20Layer.md)
- [Toss Payments 개발자 문서](https://docs.tosspayments.com/)
