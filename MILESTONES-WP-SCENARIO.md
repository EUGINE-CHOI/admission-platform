
---

# 🟦 M1 — 계정/가족 시스템

## WP1.1 — 로그인/회원가입

### Scenario WP1.1-1: 회원가입 성공
Given: 존재하지 않는 이메일  
When: 학생이 회원가입 요청  
Then: 계정 생성, 201 반환  
선행: 없음

### Scenario WP1.1-2: 이메일 중복으로 회원가입 실패  
Given: 이미 가입된 이메일  
When: 동일 이메일로 회원가입  
Then: 409 Conflict  
선행: WP1.1-1

### Scenario WP1.1-3: 로그인 성공  
Given: 가입된 이메일/비밀번호  
When: 로그인 요청  
Then: 200 OK + JWT 반환  
선행: WP1.1-1

### Scenario WP1.1-4: 비밀번호 오류  
Given: 동일 이메일 존재  
When: WrongPass로 로그인  
Then: 401 Unauthorized  
선행: WP1.1-1

---

## WP1.3 — 가족 연결

### Scenario WP1.3-1: 부모가 초대 코드 생성  
Given: 부모 계정  
When: 초대 코드 생성  
Then: 초대 코드 저장  
선행: WP1.1-3

### Scenario WP1.3-2: 학생이 초대 코드 입력  
Given: 부모 초대 코드가 유효  
When: 학생이 코드 입력  
Then: family_id 연결  
선행: WP1.3-1

### Scenario WP1.3-3: 잘못된 초대 코드  
Given: 존재하지 않는 코드  
When: 학생이 코드 입력  
Then: 400 Bad Request  
선행: 없음

---

## WP1.4 — 부모의 자녀 정보 열람

### Scenario WP1.4-1: 부모가 자녀 정보 조회  
Given: family_id 연결됨  
When: 부모가 조회  
Then: 자녀 정보 표시  
선행: WP1.3-2

### Scenario WP1.4-2: 권한 없는 학생 정보 요청  
Given: 연결되지 않은 학생  
When: 부모가 해당 학생 조회  
Then: 403 Forbidden  
선행: 없음

---

# 🟦 M2 — 학생 데이터 입력

## WP2.1 — 성적 입력

### Scenario WP2.1-1: 유효한 성적 저장  
Given: 학생 로그인  
When: 국어/95/90 저장  
Then: 성적 레코드 생성  
선행: WP1.1-3

### Scenario WP2.1-2: 점수 범위 오류  
Given: 학생 로그인  
When: 150점으로 저장  
Then: 400 오류  
선행: 없음

---

## WP2.2 — 활동 입력

### Scenario WP2.2-1: 활동 저장  
Given: 학생 로그인  
When: 동아리 활동 저장  
Then: 활동 레코드 생성  
선행: WP1.1-3

### Scenario WP2.2-2: 활동명 누락  
Given: 학생 로그인  
When: 활동명 없이 저장  
Then: 400 Bad Request  
선행: 없음

---

## WP2.3 — 독서 입력

### Scenario WP2.3-1: 독서 기록 저장  
Given: 학생 로그인  
When: 책 입력  
Then: 독서 레코드 생성  
선행: WP1.1-3

### Scenario WP2.3-2: 중복 기록  
Given: 동일 책 기록 존재  
When: 같은 책 저장  
Then: 409 Conflict  
선행: WP2.3-1

---

## WP2.4 — 학부모 승인 Flow

### Scenario WP2.4-1: 부모가 활동 승인  
Given: 활동 상태=대기  
When: 부모가 승인  
Then: 승인됨  
선행: WP2.2-1, WP1.4-1

### Scenario WP2.4-2: 부모가 수정요청  
Given: 대기 상태  
When: 부모가 수정 요청  
Then: 학생에게 알림  
선행: WP2.2-1

---

# 🟦 M3 — 전형/일정 수집 (크롤러/관리자 승인)

## WP3.1 — 크롤러

### Scenario WP3.1-1: 기본 크롤링 성공  
Given: HTML 구조 정상  
When: 크롤러 실행  
Then: JSON 데이터 생성  
선행: 없음

### Scenario WP3.1-2: 구조 변경으로 실패  
Given: Selector 변경  
When: 크롤러 실행  
Then: 에러 로그  
선행: 없음

### Scenario WP3.1-3: 네트워크 오류  
Given: 서버 다운  
When: 크롤러 실행  
Then: Timeout / Retry  
선행: 없음

---

## WP3.2 — 전형/일정 DB 반영

### Scenario WP3.2-1: 전형 데이터 저장  
Given: 유효 school_id  
When: 전형 저장  
Then: draft 저장  
선행: WP3.1-1

### Scenario WP3.2-2: 연도/버전 중복  
Given: 동일 연도 존재  
When: 저장 요청  
Then: 409 Conflict  
선행: WP3.2-1

### Scenario WP3.2-3: 일정 데이터 저장  
Given: draft 전형  
When: 일정 저장  
Then: schedule 저장  
선행: WP3.2-1

---

## WP3.3 — 관리자 승인

### Scenario WP3.3-1: Admin 승인  
Given: draft  
When: Publish  
Then: published  
선행: WP3.2-1

### Scenario WP3.3-2: 수정 후 승인  
Given: draft  
When: 수정+Publish  
Then: 최신 버전 저장  
선행: WP3.3-1

### Scenario WP3.3-3: 미승인 전형 조회 차단  
Given: draft  
When: 학생이 조회  
Then: 404 응답  
선행: 없음

---

## WP3.4 — 학교 상세 페이지

### Scenario WP3.4-1: 게시된 전형 조회  
Given: published  
When: 학생이 상세 요청  
Then: 전형 표시  
선행: WP3.3-1

### Scenario WP3.4-2: 전형 없음  
Given: 신규 학교  
When: 조회  
Then: “전형 없음” 표시  
선행: 없음

### Scenario WP3.4-3: 잘못된 school_id  
Given: 없는 ID  
When: 조회  
Then: 404  
선행: 없음

---

# 🟦 M4 — 진단 엔진

## WP4.1 — 단순 진단

### Scenario WP4.1-1: FIT 판정  
Given: 내신이 학교 기준 충족  
When: 진단 실행  
Then: FIT 반환  
선행: WP2.1-1, WP3.2 완료

### Scenario WP4.1-2: CHALLENGE/UNLIKELY 판정  
Given: 내신 낮음  
When: 진단 실행  
Then: CHALLENGE/UNLIKELY  
선행: WP2.1-1

---

## WP4.3 — 추천 학교 Top3

### Scenario WP4.3-1: 추천 3개 반환  
Given: 학교 데이터 충분  
When: 진단  
Then: Top3 목록  
선행: WP4.1-1

### Scenario WP4.3-2: 추천 1개만  
Given: 조건 맞는 학교 1개  
When: 진단  
Then: 1개 표시  
선행: WP4.1-2

---

# 🟦 M5 — AI 에이전트

## WP5.2 — 생기부 문장 생성

### Scenario WP5.2-1: 문장 생성 성공  
Given: 활동 데이터 있음  
When: 생성 요청  
Then: 문장 초안  
선행: WP2.2-1

### Scenario WP5.2-2: 활동 없음  
Given: 활동 없음  
When: 생성  
Then: 400  
선행: 없음

---

## WP5.4 — 액션 플랜 생성

### Scenario WP5.4-1: 플랜 생성  
Given: 진단 완료  
When: 플랜 요청  
Then: 주간 Task 포함 생성  
선행: WP4.1-1

### Scenario WP5.4-2: 진단 없음  
Given: 진단 X  
When: 플랜 요청  
Then: 400  
선행: 없음

---

# 🟦 M6 — Task / 타임라인

## WP6.2 — 완료 체크

### Scenario WP6.2-1: Task 완료  
Given: Task todo  
When: 완료 클릭  
Then: done+시간 기록  
선행: WP5.4-1

### Scenario WP6.2-2: 권한 없음  
Given: 다른 학생 Task  
When: 완료 시도  
Then: 403  
선행: 없음

---

# 🟦 M7 — 대시보드

## WP7.1 — 학생 홈

### Scenario WP7.1-1: 오늘의 할 일 표시  
Given: 플랜/Task 존재  
When: 홈 접속  
Then: 오늘 Task 표시  
선행: WP5.4-1

### Scenario WP7.1-2: 플랜 없음  
Given: 플랜 X  
When: 홈 접속  
Then: 안내 메시지  
선행: 없음

---

## WP7.2 — 학부모 대시보드

### Scenario WP7.2-1: 3줄 요약  
Given: 가족 연결 + 진단 + 플랜  
When: 접속  
Then: 요약 표시  
선행: WP1.3-2, WP4.1-1

### Scenario WP7.2-2: 자녀 없음  
Given: family_id 없음  
When: 접속  
Then: 연결 유도  
선행: 없음

---

# 🟦 M8 — 컨설턴트

## WP8.1 — 컨설턴트 인증

### Scenario WP8.1-1: 로그인 성공  
Given: 컨설턴트 계정  
When: 로그인  
Then: Dashboard 표시  
선행: WP1.1-1

### Scenario WP8.1-2: 학생 접근 차단  
Given: 학생  
When: 컨설턴트 API 호출  
Then: 403  
선행: 없음

---

## WP8.2 — 상담 예약

### Scenario WP8.2-1: 예약 생성  
Given: 부모+구독 Active  
When: 예약 생성  
Then: pending 생성  
선행: WP9.1-1

### Scenario WP8.2-2: 구독 없음  
Given: inactive  
When: 예약 시도  
Then: 402/403  
선행: 없음

### Scenario WP8.2-3: 일정 중복  
Given: 기예약 있음  
When: 같은 시간대 예약  
Then: 409  
선행: WP8.2-1

---

## WP8.3 — 상담 기록

### Scenario WP8.3-1: 상담 상세 조회  
Given: 배정된 상담 존재  
When: 컨설턴트가 조회  
Then: 학생 정보 표시  
선행: WP8.2-1

### Scenario WP8.3-2: 타 컨설턴트 접근 차단  
Given: 다른 컨설턴트  
When: 상담 조회  
Then: 403  
선행: 없음

### Scenario WP8.3-3: 상담 노트 저장  
Given: 상담 진행  
When: 노트 저장  
Then: 저장됨  
선행: WP8.3-1

---

## WP8.4 — AI 상담 리포트

### Scenario WP8.4-1: AI 리포트 생성  
Given: 진단/활동/노트 존재  
When: 생성  
Then: 리포트 초안  
선행: WP5.1, WP8.3-3

### Scenario WP8.4-2: 진단 없음  
Given: 진단 X  
When: 생성  
Then: 400  
선행: 없음

### Scenario WP8.4-3: AI 장애  
Given: API 실패  
When: 생성  
Then: Fallback 메시지  
선행: 없음

---

## WP8.5 — 리포트 공유

### Scenario WP8.5-1: 리포트 공유  
Given: 리포트 확정됨  
When: 공유  
Then: 학부모/학생에 표시  
선행: WP8.4-1

### Scenario WP8.5-2: 초안 상태  
Given: 확정 X  
When: 공유  
Then: 400  
선행: 없음

### Scenario WP8.5-3: 권한 없음  
Given: 타인  
When: 리포트 접근  
Then: 403  
선행: 없음

---

# 🟦 M9 — 결제

## WP9.1 — 결제 플로우

### Scenario WP9.1-1: 결제 성공  
Given: 유효한 카드  
When: 결제 완료  
Then: active 구독  
선행: 없음

### Scenario WP9.1-2: 결제 실패  
Given: 잔액 부족  
When: 결제 시도  
Then: inactive 유지  
선행: 없음

---

# 🟦 M10 — Analytics & 운영

## WP10.1 — 운영 로그

### Scenario WP10.1-1: 오류 발생 → Sentry 기록  
Given: Sentry 연결  
When: 서버 오류  
Then: Sentry 기록  
선행: 없음

### Scenario WP10.1-2: 관리자 로그 조회  
Given: 오류 다수 발생  
When: Sentry 조회  
Then: 오류 목록 표시  
선행: WP10.1-1

### Scenario WP10.1-3: Slack Webhook 알림  
Given: Webhook 설정됨  
When: 오류 발생  
Then: Slack 메시지  
선행: WP10.1-1

---

## WP10.2 — KPI 대시보드

### Scenario WP10.2-1: 활동 입력률 계산  
Given: 활동 100건, 학생 50명  
When: KPI 조회  
Then: 2건/학생  
선행: WP6.3

### Scenario WP10.2-2: 전환율 계산  
Given: 100명 중 12명 Active  
When: KPI 조회  
Then: 12%  
선행: WP9.1-1

### Scenario WP10.2-3: 데이터 없음  
Given: 데이터 0  
When: 조회  
Then: “데이터 없음”  
선행: 없음

---

## WP10.3 — AI 분석

### Scenario WP10.3-1: Feedback 분석 성공  
Given: Feedback 다수  
When: Analyzer 조회  
Then: 좋아요/싫어요/수정 비율 표시  
선행: WP5.5

### Scenario WP10.3-2: 품질 저하 감지  
Given: 수정률 70%  
When: 7일 필터  
Then: Warning  
선행: WP10.3-1

### Scenario WP10.3-3: 데이터 없음  
Given: Feedback=0  
When: 조회  
Then: 안내 메시지  
선행: 없음

---

# 🟦 M11 — 뉴스 & 정보 서비스

## WP11.1 — 특목고 뉴스 크롤링

### Scenario WP11.1-1: 뉴스 자동 수집
Given: Google News RSS 연결
When: 키워드(외고, 자사고, 과학고, 영재고) 검색
Then: 최신 뉴스 수집 및 캐시
선행: 없음

### Scenario WP11.1-2: 뉴스 목록 조회
Given: 캐시된 뉴스 존재
When: 학생이 뉴스 페이지 접속
Then: 10개씩 페이지네이션 표시
선행: WP11.1-1

### Scenario WP11.1-3: 키워드 필터링
Given: 뉴스 목록 표시
When: 특정 키워드(예: 과학고) 선택
Then: 해당 키워드 뉴스만 필터링
선행: WP11.1-2

### Scenario WP11.1-4: 뉴스 검색
Given: 뉴스 목록 표시
When: 검색어 입력
Then: 제목/내용 검색 결과 표시
선행: WP11.1-2

---

## WP11.2 — 데모 체험 모드

### Scenario WP11.2-1: 데모 버튼 클릭
Given: 랜딩 페이지 접속
When: "데모 체험하기" 버튼 클릭
Then: 테스트 계정 자동 로그인 + 대시보드 이동
선행: 없음

### Scenario WP11.2-2: 체험 중 뱃지 표시
Given: 데모 모드 로그인
When: 대시보드 접속
Then: 상단에 "체험 중" 뱃지 표시
선행: WP11.2-1

### Scenario WP11.2-3: 데모 모드 해제
Given: 데모 모드 활성
When: 로그아웃
Then: 데모 모드 해제, 메인 페이지 이동
선행: WP11.2-2

---

# 🟦 M12 — 데이터 확장

## WP12.1 — 중학교 데이터베이스

### Scenario WP12.1-1: 중학교 검색
Given: 중학교 DB 존재 (서울/인천/경기)
When: 회원가입 시 중학교명 입력
Then: 자동완성 목록 표시
선행: 없음

### Scenario WP12.1-2: 중학교 선택 저장
Given: 자동완성 목록 표시
When: 중학교 선택
Then: 사용자 프로필에 중학교 정보 연결
선행: WP12.1-1

### Scenario WP12.1-3: 중학교 홈페이지 링크
Given: 중학교 정보 저장됨
When: 대시보드에서 중학교명 표시
Then: 클릭 시 학교 홈페이지 이동
선행: WP12.1-2

---

## WP12.2 — 특목고/자사고 데이터 확장

### Scenario WP12.2-1: 전국 특목고 데이터
Given: 관리자 시드 데이터
When: 과학고/외고/국제고/예고/체고/자사고 데이터 로드
Then: 전국 특목고 DB 구축 완료
선행: 없음

### Scenario WP12.2-2: 입시 경쟁률 데이터
Given: 특목고 DB 존재
When: 2019-2025년 경쟁률 데이터 로드
Then: 역대 경쟁률 조회 가능
선행: WP12.2-1

### Scenario WP12.2-3: 학교 홈페이지 연동
Given: 학교 정보에 website 필드
When: 학생이 목표학교 선택
Then: 학교명 옆 홈페이지 링크 표시
선행: WP12.2-1

---

# 🟦 M13 — AI 멘토 고도화

## WP13.1 — AI 기능 확장

### Scenario WP13.1-1: 빠른 질문
Given: AI 멘토 페이지 접속
When: 입시 관련 질문 입력
Then: AI 맞춤형 답변 생성
선행: WP1.1-3

### Scenario WP13.1-2: 종합 분석
Given: 성적/활동/목표학교 입력됨
When: 종합 분석 요청
Then: 현황 분석 + 핵심 조언 생성
선행: WP2.1-1, WP2.2-1

### Scenario WP13.1-3: 학교 추천
Given: 지역/학교유형 선택
When: 학교 추천 요청
Then: 맞춤형 학교 리스트 생성
선행: WP12.2-1

### Scenario WP13.1-4: 독서 추천
Given: 관심 분야 입력
When: 독서 추천 요청
Then: 입시용 도서 리스트 생성
선행: WP1.1-3

### Scenario WP13.1-5: 동아리 추천
Given: 관심사 입력
When: 동아리 추천 요청
Then: 맞춤형 동아리 리스트 생성
선행: WP1.1-3

---

## WP13.2 — AI 히스토리

### Scenario WP13.2-1: 사용 기록 저장
Given: AI 기능 사용
When: 응답 생성 완료
Then: localStorage에 히스토리 저장
선행: WP13.1-1

### Scenario WP13.2-2: 히스토리 조회
Given: AI 멘토 페이지 접속
When: 기능 미선택 상태
Then: 최근 사용 기록 10개 표시
선행: WP13.2-1

### Scenario WP13.2-3: 히스토리 재활용
Given: 히스토리 목록 표시
When: 특정 기록 클릭
Then: 해당 입력/결과 복원
선행: WP13.2-2

---

# 🎉 끝  
본 문서는 MVP 전 기능에 대한  
**Milestone → Work Package → Scenario**  
계층 구조를 완성한 최종 버전이다.

**2025-12-13 업데이트:**
- M11: 뉴스 & 정보 서비스 추가
- M12: 데이터 확장 (중학교 DB, 특목고 확장) 추가
- M13: AI 멘토 고도화 추가
