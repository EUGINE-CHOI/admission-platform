# 🏠 M7 — 학부모·학생 대시보드 & 보고서 시스템 (UX Intelligence Layer)

> **목적**: 학생·학부모에게 입시 전체를 이해 가능하게 요약해 주는 핵심 UX 기능

---

## 📋 공통 정의

### 대시보드 데이터 출처
| 구성요소 | 데이터 출처 |
|---------|-----------|
| 오늘의 할 일 | WeeklyTask (M5/M6) |
| 추천 학교 | RecommendedSchool (M4) |
| 진단 상태 | DiagnosisResult (M4) |
| 플랜 진행도 | ActionPlan + WeeklyTask (M5/M6) |
| 다가오는 일정 | AdmissionSchedule (M3) |
| 성장 타임라인 | EventLog (M6) |

---

## 🏠 WP7.1 — 학생 홈 대시보드

### Scenario WP7.1-1: 홈 대시보드에서 오늘의 할 일을 확인

**Given**: 학생에게 액션 플랜과 Task가 이미 생성되어 있다.

**When**: 학생이 로그인 후 홈 화면에 접속한다.

**Then**: "오늘의 할 일" 섹션에 오늘 날짜에 해당하는 Task 목록이 표시된다.

**선행 Scenario**: WP5.4-1, WP6.1-1

---

### Scenario WP7.1-2: 아직 생성된 플랜이 없을 때 안내 메시지

**Given**: 해당 학생에 대해 액션 플랜이 존재하지 않는다.

**When**: 학생이 홈 대시보드에 접속한다.

**Then**: "아직 생성된 플랜이 없습니다. 진단을 먼저 실행해 주세요."라는 안내 메시지가 표시된다.

**선행 Scenario**: 없음

---

### Scenario WP7.1-3: 이번 주 플랜 요약 표시

**Given**: 학생에게 진행 중인 액션 플랜이 있다.

**When**: 홈 대시보드에 접속한다.

**Then**: 이번 주 플랜 카드에 주차 테마, 총 Task 수, 완료된 Task 수가 표시된다.

**선행 Scenario**: WP5.4-1

---

### Scenario WP7.1-4: 추천 학교 요약 카드 표시

**Given**: 학생에게 진단 결과와 추천 학교가 있다.

**When**: 홈 대시보드에 접속한다.

**Then**: 상위 3개 추천 학교가 적합도와 함께 카드로 표시된다.

**선행 Scenario**: WP4.3-1

---

### Scenario WP7.1-5: 다가오는 입시 일정 표시

**Given**: 목표 학교의 입시 일정이 등록되어 있다.

**When**: 홈 대시보드에 접속한다.

**Then**: 7일 이내 다가오는 입시 일정이 날짜순으로 표시된다.

**선행 Scenario**: WP3.4-1, WP4.0-1

---

### Scenario WP7.1-6: 최근 성장 이벤트 하이라이트

**Given**: 학생에게 최근 활동 이벤트가 기록되어 있다.

**When**: 홈 대시보드에 접속한다.

**Then**: 최근 3개의 주요 이벤트(성적 입력, 활동 승인, 진단 완료 등)가 표시된다.

**선행 Scenario**: WP6.3-1

---

### Scenario WP7.1-7: 홈 대시보드 API 응답

**Given**: 학생이 인증된 상태이다.

**When**: GET /dashboard/student API를 호출한다.

**Then**: 오늘의 할 일, 이번 주 플랜, 추천 학교, 다가오는 일정, 최근 이벤트가 하나의 응답으로 반환된다.

**선행 Scenario**: WP7.1-1 ~ WP7.1-6

---

## 📊 WP7.2 — 학부모 대시보드

### Scenario WP7.2-1: 자녀 요약 스냅샷 표시

**Given**: 자녀와 가족 연결이 되어 있고, 진단/플랜/Task 데이터가 존재한다.

**When**: 학부모가 대시보드에 접속한다.

**Then**: 상단에 자녀별 3줄 스냅샷(진단 상태, 플랜 진행도, 다가오는 일정)이 표시된다.

**선행 Scenario**: WP1.3-2, WP4.1-1, WP5.4-1, WP6.2-1

---

### Scenario WP7.2-2: 연결된 자녀가 없는 경우

**Given**: 학부모 계정이지만 아직 어떤 자녀와도 연결되어 있지 않다.

**When**: 학부모가 대시보드에 접속한다.

**Then**: "자녀 계정을 먼저 연결해 주세요" 안내와 함께 자녀 초대 플로우로 유도된다.

**선행 Scenario**: 없음

---

### Scenario WP7.2-3: 다중 자녀 스냅샷 표시

**Given**: 학부모에게 2명의 자녀가 연결되어 있다.

**When**: 학부모 대시보드에 접속한다.

**Then**: 각 자녀별로 개별 스냅샷 카드가 표시된다.

**선행 Scenario**: WP7.2-1

---

### Scenario WP7.2-4: 자녀 진단 상태 상세 조회

**Given**: 학부모 대시보드에 자녀 스냅샷이 표시되어 있다.

**When**: "진단 상태" 섹션을 클릭한다.

**Then**: 자녀의 최신 진단 결과 상세 페이지로 이동한다.

**선행 Scenario**: WP7.2-1

---

### Scenario WP7.2-5: 자녀 플랜 진행도 상세 조회

**Given**: 학부모 대시보드에 자녀 스냅샷이 표시되어 있다.

**When**: "플랜 진행도" 섹션을 클릭한다.

**Then**: 자녀의 액션 플랜 상세 페이지로 이동한다.

**선행 Scenario**: WP7.2-1

---

### Scenario WP7.2-6: 학부모 대시보드 API 응답

**Given**: 학부모가 인증된 상태이다.

**When**: GET /dashboard/parent API를 호출한다.

**Then**: 모든 자녀의 스냅샷(진단 상태, 플랜 진행도, 다가오는 일정)이 반환된다.

**선행 Scenario**: WP7.2-1

---

## 📅 WP7.3 — 입시 일정 캘린더

### Scenario WP7.3-1: 월별 캘린더 조회

**Given**: 학생에게 목표 학교가 설정되어 있고, 해당 학교들의 입시 일정이 등록되어 있다.

**When**: 캘린더 페이지에서 특정 월을 조회한다.

**Then**: 해당 월의 모든 입시 일정이 날짜별로 표시된다.

**선행 Scenario**: WP3.4-1, WP4.0-1

---

### Scenario WP7.3-2: 일정 유형별 필터링

**Given**: 캘린더에 다양한 유형의 일정(설명회, 원서접수, 면접 등)이 있다.

**When**: "면접" 유형으로 필터링한다.

**Then**: 면접 일정만 표시된다.

**선행 Scenario**: WP7.3-1

---

### Scenario WP7.3-3: 학교별 일정 필터링

**Given**: 캘린더에 여러 학교의 일정이 있다.

**When**: 특정 학교만 선택하여 필터링한다.

**Then**: 해당 학교의 일정만 표시된다.

**선행 Scenario**: WP7.3-1

---

### Scenario WP7.3-4: 일정 상세 조회

**Given**: 캘린더에 일정이 표시되어 있다.

**When**: 특정 일정을 클릭한다.

**Then**: 일정 상세 정보(장소, 시간, 준비물 등)가 모달로 표시된다.

**선행 Scenario**: WP7.3-1

---

### Scenario WP7.3-5: 목표 학교 미설정 시 안내

**Given**: 학생이 아직 목표 학교를 설정하지 않았다.

**When**: 캘린더 페이지에 접속한다.

**Then**: "목표 학교를 먼저 설정하면 해당 학교의 일정을 확인할 수 있습니다" 안내가 표시된다.

**선행 Scenario**: 없음

---

### Scenario WP7.3-6: 캘린더 API 응답

**Given**: 학생이 인증된 상태이다.

**When**: GET /calendar/admissions?year=2025&month=12 API를 호출한다.

**Then**: 해당 월의 목표 학교 및 관심 학교 일정이 반환된다.

**선행 Scenario**: WP7.3-1

---

### Scenario WP7.3-7: D-day 카운트다운 표시

**Given**: 7일 이내에 중요 일정(원서접수, 면접)이 있다.

**When**: 캘린더 또는 대시보드를 조회한다.

**Then**: "D-3: OO고 원서접수 마감" 형태로 카운트다운이 표시된다.

**선행 Scenario**: WP7.3-1

---

## 📄 WP7.4 — PDF 보고서 생성

### Scenario WP7.4-1: 진단 보고서 PDF 생성

**Given**: 학생에게 진단 결과가 있다.

**When**: "진단 보고서 다운로드" 버튼을 클릭한다.

**Then**: 진단 결과(점수, 강점, 약점, 추천 학교)가 포함된 PDF가 다운로드된다.

**선행 Scenario**: WP4.1-1

---

### Scenario WP7.4-2: 종합 리포트 PDF 생성

**Given**: 학생에게 진단 결과, 액션 플랜, AI 조언이 모두 있다.

**When**: "종합 리포트 다운로드" 버튼을 클릭한다.

**Then**: 다음 내용이 포함된 PDF가 생성된다:
- 학생 프로필 요약
- 진단 결과 및 추천 학교
- 액션 플랜 개요
- AI 생성 조언 요약
- 향후 주요 일정

**선행 Scenario**: WP4.1-1, WP5.4-1, WP5.3-1

---

### Scenario WP7.4-3: 학부모가 자녀 보고서 다운로드

**Given**: 학부모와 자녀가 가족으로 연결되어 있다.

**When**: 학부모가 자녀 리포트 다운로드 API를 호출한다.

**Then**: 자녀의 종합 리포트 PDF가 다운로드된다.

**선행 Scenario**: WP1.3-2, WP7.4-2

---

### Scenario WP7.4-4: 보고서 생성 중 로딩 표시

**Given**: PDF 생성에 시간이 소요된다.

**When**: 보고서 다운로드를 요청한다.

**Then**: "보고서를 생성 중입니다..." 로딩 메시지가 표시되고, 완료 시 자동 다운로드된다.

**선행 Scenario**: WP7.4-1

---

### Scenario WP7.4-5: 진단 결과 없이 보고서 요청 시 실패

**Given**: 학생이 아직 진단을 실행하지 않았다.

**When**: 보고서 다운로드를 시도한다.

**Then**: 400 Bad Request와 "진단을 먼저 실행해 주세요" 메시지가 반환된다.

**선행 Scenario**: 없음

---

### Scenario WP7.4-6: 보고서 생성 API

**Given**: 학생이 인증된 상태이다.

**When**: GET /reports/comprehensive 또는 GET /reports/diagnosis API를 호출한다.

**Then**: PDF 파일이 Content-Type: application/pdf로 반환된다.

**선행 Scenario**: WP7.4-1

---

## 📊 시나리오 의존성 맵

```
[M4 진단 결과] ──────┬──────────────────┐
                     │                  │
[M5 액션 플랜] ──────┼──────────────────┤
                     │                  │
[M6 Event Log] ──────┤                  │
                     │                  │
[M3 입시 일정] ──────┤                  │
                     ▼                  ▼
              ┌─────────────┐    ┌─────────────┐
              │   WP7.1     │    │   WP7.2     │
              │ 학생 대시보드│    │ 학부모 대시보드│
              └─────────────┘    └─────────────┘
                     │                  │
                     └────────┬─────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
       ▼                      ▼                      ▼
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│   WP7.3     │        │   WP7.4     │        │   FE 구현    │
│  캘린더     │        │ PDF 보고서  │        │             │
└─────────────┘        └─────────────┘        └─────────────┘
```

---

## 📝 API 엔드포인트 요약

| WP | Method | Endpoint | 설명 | 권한 |
|----|--------|----------|------|------|
| WP7.1 | GET | `/dashboard/student` | 학생 홈 대시보드 종합 | STUDENT |
| WP7.2 | GET | `/dashboard/parent` | 학부모 대시보드 종합 | PARENT |
| WP7.2 | GET | `/dashboard/parent/children/:childId` | 특정 자녀 상세 | PARENT |
| WP7.3 | GET | `/calendar/admissions` | 입시 일정 캘린더 | STUDENT |
| WP7.3 | GET | `/calendar/admissions/upcoming` | 다가오는 일정 (7일) | STUDENT |
| WP7.4 | GET | `/reports/diagnosis` | 진단 보고서 PDF | STUDENT |
| WP7.4 | GET | `/reports/comprehensive` | 종합 보고서 PDF | STUDENT |
| WP7.4 | GET | `/reports/children/:childId` | 자녀 보고서 PDF | PARENT |

---

## 📊 응답 예시

### 학생 대시보드 (WP7.1)
```json
{
  "todayTasks": [
    { "id": "task_1", "title": "자기소개서 초안 작성", "status": "TODO" },
    { "id": "task_2", "title": "수학 문제집 1단원", "status": "IN_PROGRESS" }
  ],
  "weekSummary": {
    "weekNumber": 3,
    "theme": "자기소개서 준비",
    "totalTasks": 5,
    "completedTasks": 2,
    "progressRate": 40
  },
  "recommendedSchools": [
    { "schoolId": "sch_1", "name": "서울과학고", "score": 85, "level": "FIT" },
    { "schoolId": "sch_2", "name": "한성과학고", "score": 78, "level": "CHALLENGE" }
  ],
  "upcomingSchedules": [
    { "id": "sched_1", "schoolName": "서울과학고", "type": "INFO_SESSION", "date": "2025-12-10", "daysLeft": 4 }
  ],
  "recentEvents": [
    { "type": "TASK_COMPLETED", "title": "진단 결과 검토 완료", "createdAt": "2025-12-05T10:00:00Z" }
  ]
}
```

### 학부모 대시보드 (WP7.2)
```json
{
  "children": [
    {
      "childId": "user_xxx",
      "name": "김학생",
      "snapshot": {
        "diagnosis": {
          "lastRun": "2025-12-05",
          "topSchool": "서울과학고",
          "topScore": 85
        },
        "plan": {
          "title": "3개월 입시 준비 플랜",
          "progressRate": 35,
          "currentWeek": 3
        },
        "upcomingSchedule": {
          "title": "서울과학고 설명회",
          "date": "2025-12-10",
          "daysLeft": 4
        }
      }
    }
  ]
}
```

### 캘린더 (WP7.3)
```json
{
  "year": 2025,
  "month": 12,
  "schedules": [
    {
      "id": "sched_1",
      "schoolId": "sch_1",
      "schoolName": "서울과학고",
      "type": "INFO_SESSION",
      "title": "2026학년도 신입생 입학설명회",
      "startDate": "2025-12-10T14:00:00Z",
      "endDate": "2025-12-10T17:00:00Z",
      "location": "서울과학고 강당"
    },
    {
      "id": "sched_2",
      "schoolId": "sch_1",
      "schoolName": "서울과학고",
      "type": "APPLICATION",
      "title": "원서접수",
      "startDate": "2025-12-15T09:00:00Z",
      "endDate": "2025-12-17T18:00:00Z"
    }
  ]
}
```

---

> 📝 **Note**: 이 시나리오는 BDD(Behavior-Driven Development) 형식으로 작성되었습니다.
