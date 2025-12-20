# 🤖 Agent 공통 규칙

> 이 문서는 AI 에이전트가 프로젝트 작업 시 참조해야 할 공통 규칙과 컨텍스트를 정의합니다.
> **모든 개발 작업 전 이 문서를 먼저 확인하세요.**

---

## 🚨 필수 개발 지침 (반드시 준수)

### 1. 서비스의 목적을 항상 기억하라
> **"입시 정보 격차 해소"** - 매번 코드를 작성할 때마다 이 서비스를 왜 만드는지 생각하고 작성하라.
> 모든 기능은 학생과 학부모가 더 나은 입시 준비를 할 수 있도록 돕기 위해 존재한다.

### 2. 코드 작성 전 시나리오 목적 확인
- 코드 작성 전에 해당 시나리오(SCENARIO_*.md)의 **목적을 먼저 확인**하라
- Given/When/Then을 명확히 이해한 후 작업을 시작하라
- 선행 Scenario 의존성을 반드시 확인하라

### 3. 작은 단위로 작업하라
- 한 번에 너무 많은 코드를 작성하지 말고 **작은 단위로 나눠서 작업**하라
- 하나의 기능 → 테스트 → 다음 기능 순서로 진행하라
- 복잡한 기능은 여러 단계로 분리하라

### 4. 기존 코드 수정 시 현재 동작 먼저 확인
- 기존 코드를 수정할 때는 **먼저 현재 동작을 확인**하고 수정하라
- 수정 전후의 차이점을 명확히 파악하라
- 의도하지 않은 사이드 이펙트가 없는지 확인하라

### 5. 반드시 테스트 실행
- 코드 작성이 끝나면 해당 코드가 **의도한 대로 동작하는지 반드시 테스트**를 실행하라
- 해당 WP의 모든 Scenario를 테스트하라
- 테스트 실패 시 다음 작업으로 넘어가지 마라

### 6. 에러 발생 시 원인 분석 후 수정
- 에러가 발생하면 **원인을 분석하고 설명한 뒤에 수정**하라
- 에러 메시지를 꼼꼼히 읽고 근본 원인을 파악하라
- 임시 방편이 아닌 근본적인 해결책을 적용하라

---

## 📌 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | 입시 정보 격차 해소 플랫폼 |
| **버전** | v1.0 (MVP) |
| **목적** | 고입 입시 정보 격차 해소, 학생 성장 로드맵 제공 |
| **기술 스택** | NestJS (Backend), PostgreSQL (DB), Prisma (ORM), pnpm (Monorepo) |

---

## 📚 문서 참조 가이드

### 핵심 문서 위치
```
C:\EUGINE-CHOI\Dev\Roadmap\
├── PRD v1.1.md                    # 📋 제품 요구사항 정의서
├── MILESTONES-FINAL.md            # 🎯 마일스톤 전체 요약
├── MILESTONES-WP-SCENARIO.md      # 📝 WP별 시나리오 통합본
├── MILESTONES_M00~M10.md          # 📦 마일스톤별 상세
├── WP_M00~M10.md                  # 🔧 작업 패키지 상세
├── SCENARIO_*.md                  # 🎬 기능별 시나리오
├── data-flow-overview.md          # 🔄 데이터 흐름 개요
└── backend/                       # 💻 백엔드 소스 코드
```

### 문서 참조 순서
1. **새 기능 개발 시**: PRD → MILESTONES → WP → SCENARIO 순서로 확인
2. **버그 수정 시**: 해당 WP의 SCENARIO 먼저 확인
3. **데이터 관련 작업**: data-flow-overview.md 필수 확인

---

## 🎯 PRD 핵심 요약

> 상세 내용: [`PRD v1.1.md`](./PRD%20v1.1.md)

### 서비스 핵심 가치
| # | 가치 | 설명 |
|---|------|------|
| 1 | 입시 정보 격차 해소 | 누구나 공평한 입시 정보 접근 |
| 2 | 학생 성장 로드맵 | AI 기반 맞춤형 3개월 액션 플랜 |
| 3 | AI 학생부 품질 보정 | 금지 문구 필터링 + 사실 검증 |
| 4 | 입시 일정 캘린더 | 자동 크롤링 기반 맞춤 일정 관리 |
| 5 | 학부모 중심 UX | 3줄 스냅샷, 우선순위 체크리스트 |

### 사용자 유형 & 권한
| 사용자 | 핵심 니즈 | 접근 권한 |
|--------|----------|----------|
| **학생** | 진로 탐색, AI 계획, 목표 학교 진단 | 자신의 데이터 |
| **학부모** | 일정 관리, 자녀 현황, 준비 전략 | 자녀 데이터 (승인 권한) |
| **컨설턴트** | 상담/리포트, 데이터 기반 코칭 | 배정된 학생 데이터 |
| **관리자** | 크롤링 승인, 학교/전형 관리 | 전체 시스템 |

### Version 2 확장 대비 (데이터 구조 예약)
- `grade_history` - 고1~고3 대비
- `exam_scores` - 모의고사/수능 placeholder
- `univ_admissions` - 대입 테이블 확장
- 전형 category - 고입/대입 Enum

---

## 🧩 Milestones 구조 (M0~M17)

> 상세 내용: [`MILESTONES-FINAL.md`](./MILESTONES-FINAL.md)

| Milestone | Layer | 목적 | 핵심 산출물 |
|-----------|-------|------|------------|
| **M0** | Foundation | 인프라 & 아키텍처 구축 | Monorepo, NestJS, PostgreSQL, CI/CD |
| **M1** | Identity | 계정/가족 시스템 | JWT 인증, RBAC, 가족 연결(초대코드) |
| **M2** | Student Data | 학생 데이터 입력 | 성적/활동/독서 입력, 부모 승인 Flow |
| **M3** | Admissions | 학교/전형/일정 수집 | 크롤러, Admin 승인, 학교 상세 페이지 |
| **M4** | Diagnosis Core | 진단 엔진 | FIT/CHALLENGE/UNLIKELY, Top3 추천 |
| **M5** | AI Intelligence | AI 에이전트 | 생기부/동아리/교과/독서/액션플랜 AI |
| **M6** | Execution | Task & 타임라인 | Task 관리, 완료 체크, Event Log |
| **M7** | UX Intelligence | 대시보드 & 리포트 | 학생 홈, 학부모 3줄 요약, PDF 리포트 |
| **M8** | Premium | 컨설턴트 기능 | 상담 예약, 상담 노트, AI 리포트 |
| **M9** | Business | 결제/구독 | PG 연동, 프리미엄 unlock, 가족 할인 |
| **M10** | Growth | Analytics & 운영 | Sentry, KPI 대시보드, AI Feedback 분석 |
| **M11** | Info Service | 뉴스 & 정보 | 특목고 뉴스 RSS, 데모 체험 모드 |
| **M12** | Data Expansion | 데이터 확장 | 중학교 DB, 특목고/자사고 확장 |
| **M13** | AI Advanced | AI 멘토 고도화 | 종합분석, 학교추천, 동아리/독서 추천 |
| **M14** | Feature Polish | 기능 완성도 | 상담캘린더, PDF 리포트, 보호자 상세화 |
| **M15** | UX Polish | 사용자 경험 | 온보딩 튜토리얼, 이메일 알림, 로딩 UI |
| **M16** | Data Advanced | 데이터 고도화 | 학교 확장, 입시일정 2025-2026, AI 진단 개선 |
| **M17** | Mobile & Performance | 모바일 & 성능 | 반응형 UI, 성능 최적화, 모바일 테스트 환경 |

### Milestone 의존성
```
M0 (Foundation)
 └── M1 (Identity)
      ├── M2 (Student Data)
      │    └── M4 (Diagnosis)
      │         └── M5 (AI)
      │              └── M6 (Execution)
      │                   └── M7 (Dashboard)
      └── M3 (Admissions)
           └── M4 (Diagnosis)

M9 (Payment) ← M8 (Consultant) ← M7 (Dashboard)
M10 (Analytics) ← 모든 Milestone
```

---

## 🔧 Work Package (WP) 구조

> 상세 내용: 각 `WP_M*.md` 파일 참조

### WP 명명 규칙
- `WP{M번호}.{순번}` 형식 (예: WP1.1, WP2.3)
- 각 WP는 독립적으로 개발/테스트 가능한 단위

### 주요 WP 목록

#### M0 - Foundation
| WP | 내용 |
|----|------|
| WP0.1 | Monorepo 초기 세팅 (pnpm) |
| WP0.2 | NestJS 부트스트랩 |
| WP0.3 | PostgreSQL + Prisma 연결 |
| WP0.4 | CI/CD 파이프라인 |

#### M1 - Identity
| WP | 내용 |
|----|------|
| WP1.1 | 회원가입/로그인 (JWT) |
| WP1.3 | 가족 연결 (초대 코드) |
| WP1.4 | 부모의 자녀 정보 열람 |

#### M2 - Student Data
| WP | 내용 |
|----|------|
| WP2.1 | 성적 입력 (점수 범위 검증 0~100) |
| WP2.2 | 활동 입력 |
| WP2.3 | 독서 입력 |
| WP2.4 | 학부모 승인 Flow |

#### M3 - Admissions
| WP | 내용 |
|----|------|
| WP3.1 | 크롤러 스크립트 |
| WP3.2 | 전형/일정 DB 반영 |
| WP3.3 | 관리자 승인 Pipeline |
| WP3.4 | 학교 상세 페이지 |

#### M4 - Diagnosis
| WP | 내용 |
|----|------|
| WP4.1 | 단순 진단 (FIT/CHALLENGE/UNLIKELY) |
| WP4.3 | 추천 학교 Top3 |

#### M5 - AI
| WP | 내용 |
|----|------|
| WP5.2 | 생기부 문장 생성 |
| WP5.4 | 액션 플랜 생성 |

#### M6~M10
> 상세 내용은 해당 WP 문서 참조

---

## 🎬 Scenario 참조 가이드

> 통합본: [`MILESTONES-WP-SCENARIO.md`](./MILESTONES-WP-SCENARIO.md)

### Scenario 형식
```
Scenario WP{M}.{WP}-{번호}: {시나리오 제목}
Given: {사전 조건}
When: {실행 동작}
Then: {기대 결과}
선행 Scenario: {의존 시나리오}
```

### 주요 Scenario 파일
| 파일 | 내용 |
|------|------|
| `SCENARIO_M1(WP1.1_1.3_1.4)_Acc_Family.md` | 계정/가족 시나리오 |
| `SCENARIO_M2(WP2.1_2.2_2.3_2.4)_Data Input.md` | 데이터 입력 시나리오 |
| `SCENARIO_M3(WP3.1-3.4)_Admissions Layer.md` | 전형 수집 시나리오 |
| `SCENARIO_M4(WP2.1_2.2_2.3_2.4)_Diag.md` | 진단 시나리오 |
| `SCENARIO_M5(WP5.2_5.4_AI.md` | AI 에이전트 시나리오 |
| `SCENARIO_M6(WP6.2-1_6.2-2)_Task.md` | Task 시나리오 |
| `SCENARIO_M7(WP7.1_7.2)_Dashboard.md` | 대시보드 시나리오 |
| `SCENARIO_M8(WP8.1-8.5)_Premium Layer.md` | 컨설턴트 시나리오 |
| `SCENARIO_M9(WP9.1)_Checkout.md` | 결제 시나리오 |
| `SCENARIO_M10(WP10.1-10.3)_Growth Layer.md` | Analytics 시나리오 |

### HTTP 응답 코드 규칙
| 코드 | 의미 | 사용 상황 |
|------|------|----------|
| 200 | OK | 성공 (조회/수정) |
| 201 | Created | 생성 성공 |
| 400 | Bad Request | 입력값 오류, 필수값 누락 |
| 401 | Unauthorized | 인증 실패 |
| 402/403 | Forbidden | 권한 없음, 구독 필요 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 중복 데이터 |

---

## 🔄 데이터 흐름 개요

> 상세 내용: [`data-flow-overview.md`](./data-flow-overview.md)

### 6개 데이터 도메인
1. **User & Family** - 계정, 가족 관계
2. **Student Academic & Activity** - 성적, 활동, 독서
3. **School / Admissions / Schedule** - 학교, 전형, 일정
4. **Diagnosis & Recommendation** - 진단, 추천, 액션 플랜
5. **AI Analysis** - AI 생성 결과, 로그
6. **Subscription / Payment / Consultation** - 결제, 상담

### 핵심 데이터 파이프라인
```
[학생 입력]
    → 성적/활동/독서 데이터
        → 구조화 저장 (PostgreSQL)
            → 진단 엔진
                → AI 에이전트 분석
                    → 추천/액션 플랜 생성
                        → 학생/학부모/컨설턴트 전달
                            → 부모 승인·피드백
                                → 리포트/PDF/상담
```

### 권한별 데이터 접근
| 데이터 | 학생 | 학부모 | 컨설턴트 | 관리자 |
|--------|:----:|:------:|:--------:|:------:|
| 자신의 성적/활동 | ✅ | ✅(자녀) | ✅ | ❌ |
| AI 분석 결과 | ✅ | ✅ | ✅ | 제한적 |
| 진단/추천 | ✅ | ✅ | ✅ | 통계만 |
| 학교/전형/일정 | ✅ | ✅ | ✅ | ✅ |
| 결제/구독 | ❌ | ✅ | ❌ | ✅ |
| 상담 리포트 | ✅ | ✅ | ✅ | ❌ |

---

## ⚙️ 개발 규칙

### 코드 작성 원칙
1. **명확한 네이밍** - 변수/함수명은 역할을 명확히 표현
2. **한글 주석** - 복잡한 비즈니스 로직에 한글 주석 추가
3. **에러 핸들링** - 사용자 친화적 한글 에러 메시지
4. **입력값 검증** - 점수 범위(0~100) 등 필수 검증

### NestJS 모듈 구조
```
backend/
├── src/
│   ├── auth/           # 인증/인가 (M1)
│   ├── user/           # 사용자 관리 (M1)
│   ├── family/         # 가족 관계 (M1)
│   ├── student/        # 학생 데이터 (M2)
│   ├── school/         # 학교/전형 (M3)
│   ├── diagnosis/      # 진단 엔진 (M4)
│   ├── ai/             # AI 에이전트 (M5)
│   ├── task/           # Task 관리 (M6)
│   ├── dashboard/      # 대시보드 (M7)
│   ├── consultant/     # 컨설턴트 (M8)
│   ├── payment/        # 결제 (M9)
│   └── analytics/      # Analytics (M10)
```

### DB 테이블 명명 규칙
- snake_case 사용
- 복수형 사용 (users, families, grades)
- 관계 테이블: `{테이블1}_{테이블2}` (예: user_families)

### AI 관련 규칙
- 프롬프트 버전 관리 필수
- AI 필터링 Layer 적용 (금지 문구, 사실 검증)
- AI 입출력 로그 저장

---

## ✅ 작업 전 체크리스트

### 새 기능 개발 시
- [ ] PRD v1.1.md에서 해당 기능 섹션 확인
- [ ] MILESTONES_M*.md에서 해당 마일스톤 확인
- [ ] WP_M*.md에서 작업 패키지 상세 확인
- [ ] SCENARIO_*.md에서 시나리오 확인
- [ ] data-flow-overview.md에서 데이터 흐름 확인
- [ ] Version 2 확장성 고려 여부 확인

### 코드 작성 시
- [ ] 사용자 권한 체크 로직 포함
- [ ] 입력값 검증 로직 포함
- [ ] 적절한 HTTP 상태 코드 사용
- [ ] 한글 에러 메시지 작성

### 테스트 시
- [ ] 해당 WP의 모든 Scenario 테스트
- [ ] 선행 Scenario 의존성 확인
- [ ] 권한별 접근 테스트

---

## 📊 KPI 참고

| 지표 | 설명 |
|------|------|
| 월간 활동 입력률 | 학생의 활동 데이터 입력 빈도 |
| 진단 실행률 | 진단 엔진 사용 비율 |
| 프리미엄 전환율 | 유료 전환 비율 |
| 학부모 재방문률 | 학부모 사용자 리텐션 |
| 액션 플랜 수행률 | AI 계획 실제 수행 비율 |

---

## ⚠️ 리스크 및 대응

| 리스크 | 대응 방안 |
|--------|----------|
| 일정 데이터 오류 | 관리자 승인 프로세스 강화 |
| AI 품질 문제 | 필터링 Layer + Feedback 분석 |
| Premium 가치 부족 | 리포트 강화 + 계획 기능 추가 |

---

## 🔗 빠른 참조

| 문서 | 용도 |
|------|------|
| [PRD v1.1.md](./PRD%20v1.1.md) | 전체 제품 요구사항 |
| [MILESTONES-FINAL.md](./MILESTONES-FINAL.md) | 마일스톤 전체 요약 |
| [MILESTONES-WP-SCENARIO.md](./MILESTONES-WP-SCENARIO.md) | WP별 시나리오 통합 |
| [data-flow-overview.md](./data-flow-overview.md) | 데이터 구조 & 흐름 |

---

> 📝 **Note**: 이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.
> 마지막 업데이트: 2025-12-20

---

## 🆕 최근 업데이트 (2025-12-19)

### 기능 확장 완료 (M21)
| 기능 | 설명 |
|------|------|
| **PDF 리포트 다운로드** | 학생 대시보드에서 원클릭 PDF 생성 |
| **이메일 알림 시스템** | D-Day, 주간 리포트, 상담 알림 스케줄러 (Cron) |
| **위젯 커스터마이징** | 대시보드 위젯 드래그 앤 드롭 설정 |
| **학습 캘린더** | D-Day + Task + 상담 통합 캘린더 뷰 |
| **상담 채팅** | 컨설턴트와 실시간 채팅 UI |
| **학습 시간 트래커** | 과목별 스톱워치 및 학습 통계 |
| **AI 튜터 챗봇** | 학습 질문에 AI 답변, 과목별 설정 |
| **Coming Soon 페이지** | 대입 확장, 학원/과외 매칭, 멘토링 |

### UI/UX 고도화 완료 (M22)
| 항목 | 설명 |
|------|------|
| **애니메이션 시스템** | fade-in, slide-up, scale-in, bounce-in, shimmer |
| **다크 모드 완성** | CSS 변수 기반 완전한 다크 테마 |
| **Glass Morphism** | 반투명 블러 배경 효과 (.glass) |
| **인터랙션 효과** | hover-lift, hover-scale, hover-glow |
| **스켈레톤 개선** | Shimmer 애니메이션 적용 |
| **버튼/카드 효과** | active:scale-95, animate, glass 옵션 |

### 완료된 기능 (M18~M19)
| 기능 | 설명 |
|------|------|
| **성적 트렌드 분석** | 과목별 성적 추이 그래프, AI 기반 개선 조언 |
| **학교 비교** | 목표 학교 간 비교 분석 (정원, 경쟁률, 요건) |
| **면접 준비 도우미** | 학교별 예상 질문, AI 모의 면접, 피드백 |
| **D-Day 대시보드** | 입시 일정 카운트다운, 중요 알림 |
| **게이미피케이션** | 학습 활동별 성취 뱃지 (15종) |
| **목표 성적 트래커** | 과목별 목표 설정, 달성률 추적 |
| **합격 시뮬레이션** | 가상 시나리오 기반 합격 확률 예측 |
| **Q&A 커뮤니티** | 입시 질문/답변, 좋아요, 채택 기능 |
| **합격생 후기** | 합격 후기 공유, 검증 뱃지, 댓글 |
| **AI 자기소개서 도우미** | 초안 생성, 첨삭, 학교별 템플릿 |
| **학교별 합격 예측 AI** | 현재 스펙 기반 합격 확률 분석 |

### 리팩토링 완료 (M20)
| 항목 | 상태 | 설명 |
|------|------|------|
| 토큰 키 통일 | ✅ 완료 | getToken/setToken/clearToken 공통 함수화 (20개 파일) |
| API URL 통일 | ✅ 완료 | getApiUrl() 전역 사용 (32개 파일) |
| 날짜/시간 포맷 | ✅ 완료 | formatDate, formatDateTime 공통 유틸리티 |
| 에러 처리 통일 | ✅ 완료 | handleApiError 공통 함수 |
| 타입 정의 통합 | ✅ 완료 | 공통 types.ts 생성 |
| AI 서비스 중복 제거 | 📋 예정 | BaseAiService 추상 클래스화 (향후 진행) |

### 테스트 & QA 완료 (M23) ⭐ NEW
| 영역 | 테스트 수 | 파일 수 | 설명 |
|------|----------|---------|------|
| Backend Unit | 30+ | 10+ | Jest 기반 서비스 테스트 (Auth, Student, School, AI) |
| Backend E2E | 20+ | 4 | Supertest API 통합 테스트 |
| Frontend Unit | 87 | 10 | RTL 컴포넌트/훅/유틸 테스트 |
| Cypress E2E | 80+ | 7 | 시나리오 기반 UI 테스트 |

### 주요 테스트 파일 (신규)
| 경로 | 내용 |
|------|------|
| `backend/src/**/*.spec.ts` | 서비스 유닛 테스트 |
| `backend/test/*.e2e-spec.ts` | API E2E 테스트 |
| `frontend/src/__tests__/` | 컴포넌트/훅/유틸 테스트 |
| `frontend/cypress/e2e/` | Cypress E2E 시나리오 |

### 기술 스택 추가
- `xml2js` - Google News RSS 파싱
- `pdfkit` - PDF 리포트 생성
- `nodemailer` - 이메일 발송
- `react-joyride` - 온보딩 튜토리얼
- `@nestjs/schedule` - 이메일 알림 스케줄러

### 주요 파일 (신규)
| 파일 | 용도 |
|------|------|
| `frontend/src/hooks/useWidgetSettings.ts` | 위젯 커스터마이징 훅 |
| `frontend/src/hooks/useDarkMode.ts` | 다크 모드 훅 |
| `frontend/src/app/dashboard/student/calendar/page.tsx` | 학습 캘린더 |
| `frontend/src/app/dashboard/student/chat/page.tsx` | 상담 채팅 |
| `frontend/src/app/dashboard/student/study-time/page.tsx` | 학습 시간 트래커 |
| `frontend/src/app/dashboard/student/tutor/page.tsx` | AI 튜터 챗봇 |
| `backend/src/notification/email-scheduler.service.ts` | 이메일 스케줄러 |

### 기존 주요 파일
| 파일 | 용도 |
|------|------|
| `frontend/src/lib/api.ts` | 토큰/API URL 관리 (getToken, setToken, clearToken, getApiUrl) |
| `backend/src/synergy/` | 시너지 기능 모듈 (성적분석, 학교비교, 면접, D-Day) |
| `backend/src/gamification/` | 게이미피케이션 모듈 (뱃지) |
| `backend/src/community/` | 커뮤니티 모듈 (Q&A, 합격후기) |
| `backend/src/ai/personal-statement.service.ts` | AI 자기소개서 서비스 |
| `backend/src/ai/admission-prediction.service.ts` | AI 합격예측 서비스 |

### 이전 업데이트 (2025-12-16)
| 기능 | 설명 |
|------|------|
| **모바일 반응형 UI** | 사이드바 슬라이드 애니메이션, 하단 네비게이션 바, 터치 최적화 |
| **성능 최적화** | 이미지 최적화 (WebP/AVIF), 스켈레톤 UI, API 캐싱 |
| **모바일 테스트 환경** | 동적 API URL, CORS 확장, 전체 네트워크 바인딩 |
| **Google News RSS 크롤링** | 특목고 관련 실시간 뉴스 수집 |
| **데모 체험 모드** | 랜딩 페이지에서 테스트 계정으로 즉시 체험 |
| **PDF 리포트** | 학생 종합 리포트 및 진단 결과 PDF 다운로드 |
| **온보딩 튜토리얼** | 첫 로그인 시 역할별 가이드 |
| **이메일 알림** | 환영/상담예약/진단완료 알림 |

