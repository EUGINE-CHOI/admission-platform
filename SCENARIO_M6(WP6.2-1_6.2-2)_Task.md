# 📋 M6 — 액션 플랜 실행(Task) 및 타임라인 시스템 (Execution Layer)

> **목적**: 입시 준비 과정의 실제 실행·진행도를 데이터로 측정하여 성장과 행동 중심 서비스를 완성

---

## 📋 공통 정의

### Task 상태 (TaskStatus)
| Status | 설명 |
|--------|------|
| `TODO` | 아직 시작하지 않음 |
| `IN_PROGRESS` | 진행 중 |
| `DONE` | 완료됨 |
| `SKIPPED` | 건너뜀 |

### Event 타입 (EventType)
| Type | 설명 |
|------|------|
| `GRADE_ADDED` | 성적 입력 |
| `GRADE_APPROVED` | 성적 승인 |
| `ACTIVITY_ADDED` | 활동 입력 |
| `ACTIVITY_APPROVED` | 활동 승인 |
| `READING_ADDED` | 독서 기록 추가 |
| `ATTENDANCE_UPDATED` | 출결 정보 수정 |
| `VOLUNTEER_ADDED` | 봉사활동 추가 |
| `DIAGNOSIS_RUN` | 진단 실행 |
| `PLAN_CREATED` | 액션 플랜 생성 |
| `TASK_STARTED` | 태스크 시작 |
| `TASK_COMPLETED` | 태스크 완료 |
| `TASK_SKIPPED` | 태스크 건너뜀 |
| `FEEDBACK_GIVEN` | AI 피드백 제공 |
| `TARGET_SCHOOL_ADDED` | 목표 학교 추가 |
| `RECOMMENDATION_RECEIVED` | 추천 학교 수신 |

---

## 🔧 WP6.1 — PlanTasks 생성/저장

> M5에서 액션 플랜 생성 시 WeeklyTask가 자동 생성됨. 이 WP는 Task 조회 및 관리에 초점.

### Scenario WP6.1-1: 액션 플랜의 모든 Task 목록 조회

**Given**: 학생에게 12주 액션 플랜과 각 주차별 Task가 생성되어 있다.

**When**: 학생이 액션 플랜 상세 조회 API를 호출한다.

**Then**: 200 OK와 함께 12주간의 모든 Task가 주차별로 그룹화되어 반환된다.

**선행 Scenario**: WP5.4-1

---

### Scenario WP6.1-2: 특정 주차 Task만 조회

**Given**: 액션 플랜에 12주간의 Task가 있다.

**When**: 학생이 3주차 Task만 조회 API를 호출한다.

**Then**: 200 OK와 함께 3주차 Task만 필터링되어 반환된다.

**선행 Scenario**: WP6.1-1

---

### Scenario WP6.1-3: 오늘 날짜 기준 해당 주차 Task 조회

**Given**: 액션 플랜 시작일로부터 15일이 경과했다 (3주차).

**When**: 학생이 "이번 주 할 일" API를 호출한다.

**Then**: 200 OK와 함께 3주차에 해당하는 Task 목록이 반환된다.

**선행 Scenario**: WP6.1-1

---

## ✅ WP6.2 — Task 완료 체크 기능

### Scenario WP6.2-1: 학생이 Task를 완료로 표시

**Given**: 액션 플랜에 포함된 Task가 "TODO" 상태로 존재한다.

**When**: 학생이 Task 상세 화면에서 "완료" 버튼을 누른다.

**Then**: 
- Task 상태가 "DONE"으로 변경된다
- 완료 시간(completedAt)이 기록된다
- TASK_COMPLETED 이벤트가 EventLog에 저장된다

**선행 Scenario**: WP5.4-1, WP6.1-1

---

### Scenario WP6.2-2: 권한 없는 사용자가 Task 변경 시도

**Given**: 특정 학생의 Task가 존재하지만, 다른 학생 계정으로 로그인되어 있다.

**When**: 해당 Task를 완료로 변경하려 한다.

**Then**: 403 Forbidden과 "이 작업을 변경할 권한이 없습니다" 메시지가 반환된다.

**선행 Scenario**: 없음

---

### Scenario WP6.2-3: Task를 진행 중으로 변경

**Given**: Task가 "TODO" 상태이다.

**When**: 학생이 "시작하기" 버튼을 누른다.

**Then**: 
- Task 상태가 "IN_PROGRESS"로 변경된다
- TASK_STARTED 이벤트가 EventLog에 저장된다

**선행 Scenario**: WP6.1-1

---

### Scenario WP6.2-4: Task를 건너뛰기로 표시

**Given**: Task가 "TODO" 또는 "IN_PROGRESS" 상태이다.

**When**: 학생이 "건너뛰기" 버튼을 누르고 사유를 입력한다.

**Then**: 
- Task 상태가 "SKIPPED"로 변경된다
- TASK_SKIPPED 이벤트가 사유와 함께 EventLog에 저장된다

**선행 Scenario**: WP6.1-1

---

### Scenario WP6.2-5: 완료된 Task를 다시 미완료로 변경

**Given**: Task가 "DONE" 상태이다.

**When**: 학생이 "완료 취소" 버튼을 누른다.

**Then**: Task 상태가 "TODO"로 변경되고 completedAt이 null로 초기화된다.

**선행 Scenario**: WP6.2-1

---

### Scenario WP6.2-6: 플랜 진행률 계산

**Given**: 12주 플랜에 총 36개의 Task가 있고, 12개가 DONE, 3개가 SKIPPED 상태이다.

**When**: 플랜 상세 조회 API를 호출한다.

**Then**: 응답에 progressRate: 33.3% (12/36), completionRate: 41.7% (15/36)가 포함된다.

**선행 Scenario**: WP6.2-1, WP6.2-4

---

## 📝 WP6.3 — Event Log 저장

### Scenario WP6.3-1: 성적 입력 시 이벤트 자동 기록

**Given**: 학생이 로그인되어 있다.

**When**: 학생이 새 성적을 입력한다.

**Then**: GRADE_ADDED 이벤트가 EventLog에 저장된다.

**선행 Scenario**: WP2.1-1

---

### Scenario WP6.3-2: 활동 승인 시 이벤트 자동 기록

**Given**: 학부모가 자녀의 활동 데이터를 조회 중이다.

**When**: 학부모가 활동을 승인한다.

**Then**: ACTIVITY_APPROVED 이벤트가 EventLog에 저장된다.

**선행 Scenario**: WP2.2-3

---

### Scenario WP6.3-3: 진단 실행 시 이벤트 자동 기록

**Given**: 학생에게 목표 학교가 설정되어 있다.

**When**: 학생이 진단을 실행한다.

**Then**: DIAGNOSIS_RUN 이벤트가 진단 결과 요약과 함께 EventLog에 저장된다.

**선행 Scenario**: WP4.1-1

---

### Scenario WP6.3-4: 액션 플랜 생성 시 이벤트 자동 기록

**Given**: 학생에게 진단 결과가 있다.

**When**: 학생이 액션 플랜을 생성한다.

**Then**: PLAN_CREATED 이벤트가 플랜 제목과 함께 EventLog에 저장된다.

**선행 Scenario**: WP5.4-1

---

### Scenario WP6.3-5: 이벤트 로그 조회 (최신순)

**Given**: 학생에게 다양한 이벤트가 기록되어 있다.

**When**: 이벤트 로그 조회 API를 호출한다.

**Then**: 200 OK와 함께 최신 이벤트부터 시간순으로 정렬된 목록이 반환된다.

**선행 Scenario**: WP6.3-1 ~ WP6.3-4

---

### Scenario WP6.3-6: 이벤트 타입별 필터링

**Given**: 학생에게 GRADE_ADDED, ACTIVITY_ADDED, TASK_COMPLETED 등 다양한 이벤트가 있다.

**When**: type=TASK_COMPLETED 파라미터로 이벤트 로그를 조회한다.

**Then**: TASK_COMPLETED 타입의 이벤트만 필터링되어 반환된다.

**선행 Scenario**: WP6.3-5

---

### Scenario WP6.3-7: 기간별 이벤트 조회

**Given**: 지난 3개월간의 이벤트가 기록되어 있다.

**When**: startDate, endDate 파라미터로 특정 기간의 이벤트를 조회한다.

**Then**: 해당 기간 내의 이벤트만 반환된다.

**선행 Scenario**: WP6.3-5

---

### Scenario WP6.3-8: 학부모가 자녀 이벤트 로그 조회

**Given**: 학부모와 자녀가 가족으로 연결되어 있다.

**When**: 학부모가 자녀 이벤트 로그 조회 API를 호출한다.

**Then**: 200 OK와 함께 자녀의 이벤트 로그가 반환된다.

**선행 Scenario**: WP1.3-2, WP6.3-5

---

## 📊 WP6.4 — Student Timeline (성장 타임라인)

### Scenario WP6.4-1: 학생 타임라인 전체 조회

**Given**: 학생에게 3개월간의 활동/진단/플랜 이벤트가 기록되어 있다.

**When**: 학생이 "나의 성장 타임라인" 페이지에 접속한다.

**Then**: 시간순으로 정렬된 이벤트 카드가 타임라인 형태로 표시된다.

**선행 Scenario**: WP6.3-5

---

### Scenario WP6.4-2: 타임라인에서 이벤트 상세 조회

**Given**: 타임라인에 DIAGNOSIS_RUN 이벤트가 표시되어 있다.

**When**: 해당 이벤트 카드를 클릭한다.

**Then**: 진단 결과 상세 페이지로 이동한다.

**선행 Scenario**: WP6.4-1

---

### Scenario WP6.4-3: 월별 타임라인 그룹화

**Given**: 6개월간의 이벤트가 기록되어 있다.

**When**: 타임라인을 월별 그룹화 모드로 조회한다.

**Then**: 각 월별로 이벤트가 그룹화되어 표시된다.

**선행 Scenario**: WP6.4-1

---

### Scenario WP6.4-4: 학부모가 자녀 타임라인 조회

**Given**: 학부모와 자녀가 가족으로 연결되어 있다.

**When**: 학부모가 자녀의 성장 타임라인을 조회한다.

**Then**: 자녀의 타임라인이 읽기 전용으로 표시된다.

**선행 Scenario**: WP1.3-2, WP6.4-1

---

### Scenario WP6.4-5: 빈 타임라인 안내

**Given**: 학생이 아직 어떤 활동도 기록하지 않았다.

**When**: 타임라인 페이지에 접속한다.

**Then**: "아직 기록된 활동이 없습니다. 첫 성적이나 활동을 입력해보세요!" 안내가 표시된다.

**선행 Scenario**: 없음

---

## 📊 시나리오 의존성 맵

```
[M2 학생 데이터] ──────┐
    ├── 성적 입력      │
    ├── 활동 입력      │
    └── 독서 입력      │
                       ▼
              ┌───────────────┐
              │   WP6.3       │
              │  Event Log    │◄──── [M4 진단 결과]
              │   자동 기록    │◄──── [M5 액션 플랜]
              └───────┬───────┘
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   WP6.1     │ │   WP6.2     │ │   WP6.4     │
│ Task 조회   │ │ Task 완료   │ │ Timeline    │
└─────────────┘ └─────────────┘ └─────────────┘
       │              │              │
       └──────────────┴──────────────┘
                      │
                      ▼
              ┌───────────────┐
              │   M7          │
              │  Dashboard    │
              └───────────────┘
```

---

## 📝 API 엔드포인트 요약

| WP | Method | Endpoint | 설명 | 권한 |
|----|--------|----------|------|------|
| WP6.1 | GET | `/tasks` | 현재 주차 Task 목록 | STUDENT |
| WP6.1 | GET | `/tasks/plan/:planId` | 플랜의 전체 Task | STUDENT |
| WP6.1 | GET | `/tasks/plan/:planId/week/:weekNum` | 특정 주차 Task | STUDENT |
| WP6.2 | PATCH | `/tasks/:taskId/status` | Task 상태 변경 | STUDENT |
| WP6.2 | GET | `/tasks/plan/:planId/progress` | 플랜 진행률 조회 | STUDENT |
| WP6.3 | GET | `/events` | 이벤트 로그 조회 | STUDENT |
| WP6.3 | GET | `/events/children/:childId` | 자녀 이벤트 조회 | PARENT |
| WP6.4 | GET | `/timeline` | 타임라인 조회 | STUDENT |
| WP6.4 | GET | `/timeline/children/:childId` | 자녀 타임라인 | PARENT |

---

## 📊 응답 예시

### Task 상태 변경 (WP6.2)
```json
// Request
PATCH /tasks/task_xxx/status
{
  "status": "DONE"
}

// Response
{
  "task": {
    "id": "task_xxx",
    "title": "목표 학교 최종 확정",
    "status": "DONE",
    "completedAt": "2025-12-06T12:00:00Z"
  },
  "event": {
    "id": "evt_xxx",
    "type": "TASK_COMPLETED",
    "title": "할 일 완료: 목표 학교 최종 확정"
  }
}
```

### 플랜 진행률 (WP6.2)
```json
{
  "planId": "plan_xxx",
  "totalTasks": 36,
  "completed": 12,
  "inProgress": 2,
  "skipped": 3,
  "todo": 19,
  "progressRate": 33.3,
  "completionRate": 41.7
}
```

### 이벤트 로그 (WP6.3)
```json
{
  "events": [
    {
      "id": "evt_001",
      "type": "TASK_COMPLETED",
      "title": "할 일 완료: 자기소개서 초안 작성",
      "createdAt": "2025-12-06T12:00:00Z"
    },
    {
      "id": "evt_002",
      "type": "DIAGNOSIS_RUN",
      "title": "진단 실행",
      "description": "3개 학교 진단 완료 - 평균 적합도: 78%",
      "createdAt": "2025-12-05T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

> 📝 **Note**: 이 시나리오는 BDD(Behavior-Driven Development) 형식으로 작성되었습니다.
