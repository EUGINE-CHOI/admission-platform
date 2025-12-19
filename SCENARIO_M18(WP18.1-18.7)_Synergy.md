# 🔗 M18 — 시너지 기능 (Synergy Features Layer) 시나리오

> **버전**: 1.0
> **의존성**: M2 (성적), M3 (학교), M5 (AI), M6 (Task)
> **대상 사용자**: STUDENT 역할
> **상태**: ✅ 완료

---

## 📈 WP18.1 — 성적 트렌드 분석

### API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/synergy/grade-trend` | 성적 트렌드 조회 |

---

### Scenario WP18.1-1: 성적 트렌드 조회

**Given:**
- 학생이 여러 학기 성적을 입력함

**When:**
- 성적 트렌드 페이지 접속

**Then:**
- 과목별 성적 추이 그래프 표시
- 학기별 비교 차트 표시

**선행 Scenario:** WP2.1-1

---

### Scenario WP18.1-2: AI 개선 조언

**Given:**
- 성적 트렌드가 표시되어 있다

**When:**
- "AI 분석" 버튼 클릭

**Then:**
- 성적 패턴 분석 결과 표시
- 개선이 필요한 과목 추천
- 구체적인 학습 조언 제공

**선행 Scenario:** WP18.1-1

---

## 🏫 WP18.2 — 학교 비교

### API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/synergy/compare-schools` | 학교 비교 |

---

### Scenario WP18.2-1: 학교 비교 실행

**Given:**
- 2개 이상의 목표 학교가 설정됨

**When:**
- 학교 비교 페이지 접속

**Then:**
- 비교표 표시:
  - 정원
  - 경쟁률
  - 입학 요건
  - 특징

**선행 Scenario:** WP3.3-1

---

### Scenario WP18.2-2: 비교 결과 저장

**Given:**
- 학교 비교 결과가 표시됨

**When:**
- "저장" 버튼 클릭

**Then:**
- 비교 결과 PDF 다운로드
- 또는 히스토리에 저장

**선행 Scenario:** WP18.2-1

---

## ⏰ WP18.3 — D-Day 대시보드

### API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/synergy/d-day` | D-Day 목록 |
| POST | `/api/synergy/d-day` | D-Day 추가 |
| DELETE | `/api/synergy/d-day/:id` | D-Day 삭제 |

---

### Scenario WP18.3-1: D-Day 목록 조회

**Given:**
- 목표 학교가 설정되어 있다

**When:**
- D-Day 페이지 접속

**Then:**
- 목표 학교 입시 일정 D-Day 표시
- 가장 가까운 일정 강조

**선행 Scenario:** WP3.3-1

---

### Scenario WP18.3-2: 커스텀 D-Day 추가

**Given:**
- D-Day 페이지에 있다

**When:**
- "D-Day 추가" 버튼 → 정보 입력 → 저장

**Then:**
- 새 D-Day 항목 추가
- 카운트다운 시작

**선행 Scenario:** WP18.3-1

---

### Scenario WP18.3-3: D-Day 알림

**Given:**
- D-Day가 7일 이내

**When:**
- 매일 아침 9시 (스케줄러)

**Then:**
- 이메일/알림으로 D-Day 리마인더 발송

**선행 Scenario:** WP18.3-1

---

## 🎤 WP18.4 — 면접 준비 도우미

### API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/synergy/interview/questions` | 예상 질문 생성 |
| POST | `/api/synergy/interview/practice` | 모의 면접 |
| POST | `/api/synergy/interview/feedback` | 피드백 |

---

### Scenario WP18.4-1: 예상 질문 생성

**Given:**
- 목표 학교가 설정되어 있다

**When:**
- 면접 준비 → "예상 질문 보기"

**Then:**
- 학교별 예상 면접 질문 5~10개 표시
- 질문 유형별 분류

**선행 Scenario:** WP3.3-1

---

### Scenario WP18.4-2: AI 모의 면접

**Given:**
- 예상 질문이 표시되어 있다

**When:**
- "모의 면접 시작" 버튼 클릭

**Then:**
- AI가 면접관 역할
- 질문 제시 → 답변 입력 → 다음 질문
- 총 5~10문항 진행

**선행 Scenario:** WP18.4-1

---

### Scenario WP18.4-3: 면접 피드백

**Given:**
- 모의 면접 완료

**When:**
- 결과 페이지 표시

**Then:**
- 각 답변에 대한 AI 피드백
- 개선점 및 모범 답변 제시
- 종합 점수 표시

**선행 Scenario:** WP18.4-2

---

## 🏆 WP18.5 — 게이미피케이션 (성취 뱃지)

### API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/badges` | 뱃지 목록 |
| GET | `/api/badges/my` | 내 뱃지 |

---

### Scenario WP18.5-1: 뱃지 획득

**Given:**
- 학생이 특정 조건 달성 (예: 성적 입력 5회)

**When:**
- 조건 충족 시점

**Then:**
- 뱃지 획득 알림 표시
- "성적왕" 뱃지 획득
- 프로필에 뱃지 추가

**선행 Scenario:** WP2.1-1

---

### Scenario WP18.5-2: 뱃지 목록 조회

**Given:**
- 뱃지 페이지 접속

**When:**
- 페이지 로드

**Then:**
- 전체 뱃지 목록 (15종) 표시
- 획득한 뱃지 하이라이트
- 미획득 뱃지 조건 표시

**선행 Scenario:** 없음

---

## 🎯 WP18.6 — 목표 성적 트래커

### API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/goals` | 목표 목록 |
| POST | `/api/goals` | 목표 설정 |
| PUT | `/api/goals/:id` | 목표 수정 |

---

### Scenario WP18.6-1: 목표 설정

**Given:**
- 목표 트래커 페이지 접속

**When:**
- 과목별 목표 성적 입력 → 저장

**Then:**
- 목표 저장 완료
- 현재 성적과 비교 표시

**선행 Scenario:** WP2.1-1

---

### Scenario WP18.6-2: 달성률 추적

**Given:**
- 목표가 설정되어 있다
- 새 성적 입력

**When:**
- 대시보드 접속

**Then:**
- 목표 달성률 % 표시
- 달성/미달성 시각화

**선행 Scenario:** WP18.6-1

---

## 🎲 WP18.7 — 합격 시뮬레이션

### API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/synergy/simulate` | 시뮬레이션 실행 |

---

### Scenario WP18.7-1: 시뮬레이션 실행

**Given:**
- 현재 성적/활동 데이터 존재

**When:**
- 시뮬레이션 페이지 → "예측하기"

**Then:**
- 현재 스펙 기준 합격 확률 표시
- 목표 학교별 확률 비교

**선행 Scenario:** WP2.1-1

---

### Scenario WP18.7-2: 가상 시나리오

**Given:**
- 시뮬레이션 결과 표시됨

**When:**
- 성적 슬라이더로 "국어 1등급 → 2등급" 변경

**Then:**
- 실시간 확률 재계산
- 변경 전후 비교 표시

**선행 Scenario:** WP18.7-1

---

## ✅ 완료 체크리스트

- [x] WP18.1: 성적 트렌드
- [x] WP18.2: 학교 비교
- [x] WP18.3: D-Day 대시보드
- [x] WP18.4: 면접 준비
- [x] WP18.5: 게이미피케이션
- [x] WP18.6: 목표 트래커
- [x] WP18.7: 합격 시뮬레이션

