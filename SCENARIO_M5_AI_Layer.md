# 🤖 M5 — AI 에이전트 Layer 시나리오

> **목적**: 학생 데이터 + 진단 결과를 활용하여 AI 기반 문장/전략/계획을 생성하는 AI Core 개발

---

## 📋 공통 정의

### AI 출력 타입 (AIOutputType)
| Type | 설명 |
|------|------|
| `RECORD_SENTENCE` | 생기부 문장 생성 |
| `CLUB_RECOMMENDATION` | 동아리 추천 |
| `SUBJECT_ADVICE` | 교과 조언 |
| `READING_GUIDE` | 독서 추천/가이드 |
| `ACTION_PLAN` | 액션 플랜 |

### AI 피드백 타입 (FeedbackType)
| Type | 설명 |
|------|------|
| `LIKE` | 좋아요 |
| `DISLIKE` | 싫어요 |
| `EDITED` | 수정함 |

### 최소 요구사항
| 기능 | 필요 조건 |
|------|----------|
| 생기부 문장 생성 | 승인된 활동 1개 이상 |
| 동아리/교과/독서 조언 | 로그인 상태 |
| 액션 플랜 생성 | 진단 결과 1개 이상 |

---

## 🔧 WP5.1 — AI Orchestrator 구축

> AI 호출의 핵심 인프라. 모든 AI 에이전트가 이 Orchestrator를 통해 OpenAI API를 호출함.

### Scenario WP5.1-1: AI API 연결 테스트 성공

**Given**: 유효한 OpenAI API 키가 환경 변수에 설정되어 있다.

**When**: 시스템이 간단한 테스트 프롬프트를 전송한다.

**Then**: 200 OK와 함께 AI 응답이 정상적으로 반환된다.

**선행 Scenario**: 없음

---

### Scenario WP5.1-2: API 키 미설정으로 호출 실패

**Given**: OpenAI API 키가 환경 변수에 설정되어 있지 않다.

**When**: AI 기능을 호출한다.

**Then**: 500 Internal Server Error와 "AI 서비스가 설정되지 않았습니다" 메시지가 반환된다.

**선행 Scenario**: 없음

---

### Scenario WP5.1-3: API 호출 실패 시 재시도 로직

**Given**: OpenAI API가 일시적으로 응답하지 않는다.

**When**: AI 기능을 호출한다.

**Then**: 최대 3회 재시도 후 실패 시 "AI 서비스 일시 장애" 메시지가 반환된다.

**선행 Scenario**: WP5.1-1

---

### Scenario WP5.1-4: AI 출력물 DB 저장 성공

**Given**: AI가 유효한 응답을 생성했다.

**When**: 응답이 반환된다.

**Then**: AIOutput 테이블에 prompt, response, type, studentId가 저장된다.

**선행 Scenario**: WP5.1-1

---

## 📝 WP5.2 — 생기부 문장 생성 에이전트

### Scenario WP5.2-1: 정상적인 활동 데이터로 문장 생성 성공

**Given**: 학생의 승인된 활동 데이터(활동명, 역할, 성과)가 존재한다.

**When**: 특정 활동에 대해 "생기부 문장 생성"을 요청한다.

**Then**: 201 Created, AI가 해당 활동 기반 생기부 문장 초안을 생성하여 반환하고 DB에 저장된다.

**선행 Scenario**: WP2.2-1, WP5.1-1

---

### Scenario WP5.2-2: 활동 데이터가 없는 경우 생성 실패

**Given**: 학생의 승인된 활동 데이터가 비어 있다.

**When**: 생기부 문장 생성을 요청한다.

**Then**: 400 Bad Request와 "생성할 활동 데이터가 없습니다" 메시지가 반환된다.

**선행 Scenario**: 없음

---

### Scenario WP5.2-3: 특정 활동 선택하여 문장 생성

**Given**: 학생이 3개의 승인된 활동을 가지고 있다.

**When**: 특정 활동 ID를 지정하여 문장 생성을 요청한다.

**Then**: 해당 활동만을 기반으로 한 생기부 문장이 생성된다.

**선행 Scenario**: WP5.2-1

---

### Scenario WP5.2-4: 전체 활동 기반 종합 문장 생성

**Given**: 학생이 다양한 유형의 승인된 활동을 가지고 있다.

**When**: 활동 ID 없이 "전체 활동 종합 문장 생성"을 요청한다.

**Then**: 모든 활동을 종합한 생기부 문장이 생성된다.

**선행 Scenario**: WP5.2-1

---

### Scenario WP5.2-5: 이전 생성 결과 조회

**Given**: 학생이 이전에 생기부 문장을 생성한 적이 있다.

**When**: 생성 이력 조회 API를 호출한다.

**Then**: 200 OK와 함께 이전 생성 결과 목록이 반환된다.

**선행 Scenario**: WP5.2-1

---

## 🎯 WP5.3 — 동아리/교과/독서 조언 에이전트

### 동아리 추천

#### Scenario WP5.3-1: 학생 데이터 기반 동아리 추천 성공

**Given**: 학생의 성적, 활동, 목표 학교 정보가 존재한다.

**When**: "동아리 추천" API를 호출한다.

**Then**: 201 Created, 학생에게 적합한 동아리 유형 3개가 추천 이유와 함께 반환된다.

**선행 Scenario**: WP2.1-1, WP5.1-1

---

#### Scenario WP5.3-2: 목표 학교 특성에 맞는 동아리 추천

**Given**: 학생이 과학고를 목표 학교로 설정했다.

**When**: 동아리 추천을 요청한다.

**Then**: 과학 관련 동아리(과학탐구반, 수학동아리 등)가 우선 추천된다.

**선행 Scenario**: WP4.0-1, WP5.3-1

---

### 교과 조언

#### Scenario WP5.3-3: 성적 기반 교과 학습 조언 성공

**Given**: 학생의 과목별 성적 데이터가 존재한다.

**When**: "교과 조언" API를 호출한다.

**Then**: 201 Created, 취약 과목 분석과 학습 전략이 반환된다.

**선행 Scenario**: WP2.1-1, WP5.1-1

---

#### Scenario WP5.3-4: 목표 학교 전형에 맞는 교과 전략 제시

**Given**: 학생의 목표 학교가 면접 비중이 높은 전형을 운영한다.

**When**: 교과 조언을 요청한다.

**Then**: 면접 대비를 위한 교과 학습 전략이 포함된다.

**선행 Scenario**: WP4.0-1, WP5.3-3

---

### 독서 추천

#### Scenario WP5.3-5: 맞춤 독서 추천 성공

**Given**: 학생의 목표 학교와 활동 데이터가 존재한다.

**When**: "독서 추천" API를 호출한다.

**Then**: 201 Created, 학생 상황에 맞는 도서 3권이 추천 이유와 함께 반환된다.

**선행 Scenario**: WP5.1-1

---

#### Scenario WP5.3-6: 기존 독서 기록 고려한 추천

**Given**: 학생이 이미 5권의 독서 기록을 가지고 있다.

**When**: 독서 추천을 요청한다.

**Then**: 기존에 읽은 책을 제외하고 추천되며, 독서 성향이 반영된다.

**선행 Scenario**: WP2.3-1, WP5.3-5

---

#### Scenario WP5.3-7: 독후 활동 가이드 생성

**Given**: 학생이 특정 책의 독후 가이드를 요청한다.

**When**: 책 제목과 함께 "독후 가이드 생성" API를 호출한다.

**Then**: 201 Created, 해당 책에 대한 독후 활동 아이디어가 반환된다.

**선행 Scenario**: WP5.1-1

---

## 📅 WP5.4 — AI 액션 플랜 생성

### Scenario WP5.4-1: 진단 결과 기반 3개월 액션 플랜 생성 성공

**Given**: 학생에 대한 최신 진단 결과가 존재한다.

**When**: "3개월 액션 플랜 생성"을 요청한다.

**Then**: 201 Created, 12주간의 주간 할 일이 포함된 액션 플랜이 생성되어 DB에 저장된다.

**선행 Scenario**: WP4.1-1, WP5.1-1

---

### Scenario WP5.4-2: 진단 결과가 없는 상태에서 요청 시 실패

**Given**: 아직 한 번도 진단을 실행한 적이 없다.

**When**: 액션 플랜 생성을 시도한다.

**Then**: 400 Bad Request와 "진단 결과가 먼저 필요합니다" 메시지가 반환된다.

**선행 Scenario**: 없음

---

### Scenario WP5.4-3: 목표 학교 특성 반영된 액션 플랜

**Given**: 학생이 자사고를 목표로 설정했고 진단 결과가 존재한다.

**When**: 액션 플랜 생성을 요청한다.

**Then**: 자사고 입시 일정과 준비 항목이 반영된 플랜이 생성된다.

**선행 Scenario**: WP4.0-1, WP5.4-1

---

### Scenario WP5.4-4: 기존 플랜이 있는 상태에서 새 플랜 생성

**Given**: 학생에게 이미 진행 중인 액션 플랜이 있다.

**When**: 새로운 액션 플랜 생성을 요청한다.

**Then**: 기존 플랜은 ARCHIVED 상태로 변경되고, 새 플랜이 생성된다.

**선행 Scenario**: WP5.4-1

---

### Scenario WP5.4-5: 액션 플랜 목록 조회

**Given**: 학생에게 2개의 액션 플랜(1개 ACTIVE, 1개 ARCHIVED)이 있다.

**When**: 액션 플랜 목록 조회 API를 호출한다.

**Then**: 200 OK와 함께 플랜 목록이 상태별로 반환된다.

**선행 Scenario**: WP5.4-4

---

### Scenario WP5.4-6: 특정 주차 할 일 조회

**Given**: 액션 플랜이 생성되어 있다.

**When**: 3주차 할 일 조회 API를 호출한다.

**Then**: 200 OK와 함께 3주차에 해당하는 Task 목록이 반환된다.

**선행 Scenario**: WP5.4-1

---

### Scenario WP5.4-7: 학부모가 자녀 액션 플랜 조회

**Given**: 학부모와 자녀가 가족으로 연결되어 있고, 자녀에게 액션 플랜이 있다.

**When**: 학부모가 자녀 액션 플랜 조회 API를 호출한다.

**Then**: 200 OK와 함께 자녀의 액션 플랜이 반환된다.

**선행 Scenario**: WP1.3-2, WP5.4-1

---

## 👍 WP5.5 — AI 출력물 피드백 시스템

### Scenario WP5.5-1: AI 출력물에 좋아요 피드백

**Given**: 학생이 AI 생성 결과물을 받았다.

**When**: 해당 출력물에 "좋아요" 피드백을 보낸다.

**Then**: 200 OK, AIFeedback 테이블에 LIKE가 저장된다.

**선행 Scenario**: WP5.2-1

---

### Scenario WP5.5-2: AI 출력물에 싫어요 피드백과 사유 입력

**Given**: 학생이 AI 생성 결과물을 받았다.

**When**: "싫어요"와 함께 불만족 사유를 입력한다.

**Then**: 200 OK, AIFeedback에 DISLIKE와 comment가 저장된다.

**선행 Scenario**: WP5.2-1

---

### Scenario WP5.5-3: AI 출력물 수정 후 저장

**Given**: 학생이 생기부 문장 초안을 받았다.

**When**: 문장을 수정하고 "수정 저장" 버튼을 누른다.

**Then**: 200 OK, AIFeedback에 EDITED와 수정된 내용이 저장된다.

**선행 Scenario**: WP5.2-1

---

### Scenario WP5.5-4: 피드백 통계 조회 (관리자)

**Given**: 여러 사용자가 AI 출력물에 피드백을 남겼다.

**When**: 관리자가 피드백 통계 API를 호출한다.

**Then**: 200 OK, 출력 타입별 좋아요/싫어요/수정 비율이 반환된다.

**선행 Scenario**: WP5.5-1, WP5.5-2, WP5.5-3

---

### Scenario WP5.5-5: 동일 출력물에 중복 피드백 방지

**Given**: 학생이 특정 AI 출력물에 이미 좋아요를 눌렀다.

**When**: 같은 출력물에 다시 좋아요를 누른다.

**Then**: 409 Conflict와 "이미 피드백을 남겼습니다" 메시지가 반환된다.

**선행 Scenario**: WP5.5-1

---

### Scenario WP5.5-6: 피드백 변경 (좋아요 → 싫어요)

**Given**: 학생이 특정 AI 출력물에 좋아요를 눌렀다.

**When**: 피드백을 싫어요로 변경 요청한다.

**Then**: 200 OK, 기존 피드백이 DISLIKE로 업데이트된다.

**선행 Scenario**: WP5.5-1

---

## 📊 시나리오 의존성 맵

```
[M4 진단 결과] ────────────────────────┐
                                       │
[M2 학생 데이터] ──────────────────────┤
    ├── 성적 (WP2.1)                   │
    ├── 활동 (WP2.2)                   ▼
    └── 독서 (WP2.3)           ┌───────────────┐
                               │  WP5.1        │
                               │  AI Orchestrator│
                               └───────┬───────┘
                                       │
       ┌───────────────────────────────┼───────────────────────────────┐
       │                               │                               │
       ▼                               ▼                               ▼
┌─────────────┐               ┌─────────────┐               ┌─────────────┐
│   WP5.2     │               │   WP5.3     │               │   WP5.4     │
│ 생기부 문장 │               │ 조언 에이전트│               │ 액션 플랜   │
└─────────────┘               └─────────────┘               └─────────────┘
       │                               │                               │
       └───────────────────────────────┴───────────────────────────────┘
                                       │
                                       ▼
                               ┌───────────────┐
                               │   WP5.5       │
                               │ 피드백 시스템  │
                               └───────────────┘
```

---

## 📝 API 엔드포인트 요약

| WP | Method | Endpoint | 설명 | 권한 |
|----|--------|----------|------|------|
| WP5.1 | GET | `/ai/health` | AI 서비스 상태 확인 | PUBLIC |
| WP5.2 | POST | `/ai/record-sentence` | 생기부 문장 생성 | STUDENT |
| WP5.2 | POST | `/ai/record-sentence/:activityId` | 특정 활동 문장 생성 | STUDENT |
| WP5.2 | GET | `/ai/record-sentence/history` | 생성 이력 조회 | STUDENT |
| WP5.3 | POST | `/ai/recommend/club` | 동아리 추천 | STUDENT |
| WP5.3 | POST | `/ai/advice/subject` | 교과 조언 | STUDENT |
| WP5.3 | POST | `/ai/recommend/reading` | 독서 추천 | STUDENT |
| WP5.3 | POST | `/ai/guide/reading` | 독후 가이드 생성 | STUDENT |
| WP5.4 | POST | `/ai/action-plan` | 액션 플랜 생성 | STUDENT |
| WP5.4 | GET | `/ai/action-plan` | 액션 플랜 목록 조회 | STUDENT |
| WP5.4 | GET | `/ai/action-plan/:planId` | 특정 플랜 상세 조회 | STUDENT |
| WP5.4 | GET | `/ai/action-plan/:planId/week/:weekNum` | 주간 할 일 조회 | STUDENT |
| WP5.4 | GET | `/ai/children/:childId/action-plan` | 자녀 플랜 조회 | PARENT |
| WP5.5 | POST | `/ai/output/:outputId/feedback` | 피드백 등록 | STUDENT |
| WP5.5 | PATCH | `/ai/output/:outputId/feedback` | 피드백 수정 | STUDENT |
| WP5.5 | GET | `/ai/feedback/stats` | 피드백 통계 | ADMIN |

---

## 📊 응답 예시

### 생기부 문장 생성 (WP5.2)
```json
{
  "output": {
    "id": "ai_xxx",
    "type": "RECORD_SENTENCE",
    "activityId": "act_xxx",
    "prompt": "...",
    "response": "과학탐구 동아리에서 팀장으로 활동하며 '친환경 플라스틱 대체재 연구' 프로젝트를 주도함. 실험 설계부터 결과 분석까지 전 과정을 총괄하였으며...",
    "createdAt": "2025-12-06T10:00:00Z"
  }
}
```

### 액션 플랜 생성 (WP5.4)
```json
{
  "actionPlan": {
    "id": "plan_xxx",
    "studentId": "user_xxx",
    "title": "2026학년도 자사고 입시 준비 플랜",
    "startDate": "2025-12-09",
    "endDate": "2026-03-01",
    "goals": ["내신 1등급 유지", "자기소개서 완성", "면접 준비"],
    "weeklyTasks": [
      {
        "week": 1,
        "theme": "현황 분석 및 목표 설정",
        "tasks": [
          { "id": "task_1", "title": "진단 결과 재검토", "status": "TODO" },
          { "id": "task_2", "title": "목표 학교 최종 확정", "status": "TODO" }
        ]
      }
    ],
    "status": "ACTIVE",
    "createdAt": "2025-12-06T10:00:00Z"
  }
}
```

---

> 📝 **Note**: 이 시나리오는 BDD(Behavior-Driven Development) 형식으로 작성되었습니다.
> 각 시나리오는 독립적인 테스트 케이스로 구현될 수 있습니다.






