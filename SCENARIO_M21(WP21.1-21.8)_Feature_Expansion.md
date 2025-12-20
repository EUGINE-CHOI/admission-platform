# 🚀 M21 — 기능 확장 (Feature Expansion Layer) 시나리오

> **버전**: 1.0
> **의존성**: M7 (대시보드), M8 (상담), M18 (D-Day)
> **대상 사용자**: STUDENT 역할
> **상태**: ✅ 완료

---

## 📄 WP21.1 — PDF 리포트 다운로드

### Scenario WP21.1-1: PDF 다운로드

**Given:**
- 학생 대시보드 접속
- 성적, 활동 데이터 존재

**When:**
- "PDF 다운로드" 버튼 클릭

**Then:**
- PDF 파일 생성 및 다운로드
- 내용: 성적 요약, 활동 목록, 진단 결과

**선행 Scenario:** WP2.1-1

---

## 📧 WP21.2 — 이메일 알림 스케줄러

### Scenario WP21.2-1: D-Day 알림

**Given:**
- D-Day 7일 이내 이벤트 존재

**When:**
- 매일 아침 9시 (Cron)

**Then:**
- 해당 사용자에게 이메일 발송

**선행 Scenario:** WP18.3-1

---

### Scenario WP21.2-2: 주간 리포트

**Given:**
- 주간 활동 기록 존재

**When:**
- 매주 일요일 저녁 8시 (Cron)

**Then:**
- 학생에게 주간 학습 리포트 이메일 발송

**선행 Scenario:** WP1.1-3

---

## ⚙️ WP21.3 — 위젯 커스터마이징

### Scenario WP21.3-1: 위젯 설정

**Given:**
- 학생 대시보드 접속

**When:**
- 위젯 설정 버튼 클릭

**Then:**
- 위젯 설정 모달 표시
- 위젯 토글/순서 변경 가능

**선행 Scenario:** WP1.1-3

---

## 📅 WP21.4 — 학습 캘린더

### Scenario WP21.4-1: 통합 캘린더 조회

**Given:**
- 학생 로그인

**When:**
- 학습 캘린더 페이지 접속

**Then:**
- D-Day + Task + 상담 일정 통합 표시

**선행 Scenario:** WP1.1-3

---

## 💬 WP21.5 — 상담 채팅

### Scenario WP21.5-1: 메시지 전송

**Given:**
- 상담 채팅 페이지 접속

**When:**
- 메시지 입력 후 전송

**Then:**
- 메시지 저장 및 표시

**선행 Scenario:** WP8.2-1

---

## ⏱️ WP21.6 — 학습 시간 트래커

### Scenario WP21.6-1: 타이머 기록

**Given:**
- 학습 시간 페이지 접속

**When:**
- 과목 선택 후 시작 → 종료

**Then:**
- 학습 세션 저장
- 오늘/이번주 통계 표시

**선행 Scenario:** WP1.1-3

---

## 🤖 WP21.7 — AI 튜터 챗봇

### Scenario WP21.7-1: AI 질문

**Given:**
- AI 튜터 페이지 접속

**When:**
- 과목 선택 후 질문 입력

**Then:**
- AI 응답 생성 및 표시

**선행 Scenario:** WP1.1-3

---

## 🔜 WP21.8 — Coming Soon 페이지

### Scenario WP21.8-1: 대입 확장

**Given:**
- 대입 확장 메뉴 클릭

**When:**
- 페이지 로드

**Then:**
- "Coming Soon" 페이지 표시

**선행 Scenario:** 없음

---

## ✅ 완료 체크리스트

- [x] WP21.1: PDF 다운로드
- [x] WP21.2: 이메일 스케줄러
- [x] WP21.3: 위젯 설정
- [x] WP21.4: 학습 캘린더
- [x] WP21.5: 상담 채팅
- [x] WP21.6: 학습 시간 트래커
- [x] WP21.7: AI 튜터
- [x] WP21.8: Coming Soon




