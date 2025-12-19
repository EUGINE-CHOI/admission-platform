
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
Then: 401 Unauthorized + "이메일 또는 비밀번호를 확인해주세요" 메시지  
선행: WP1.1-1

### Scenario WP1.1-5: 서버 연결 실패  
Given: 백엔드 서버 다운  
When: 로그인 시도  
Then: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요" 메시지  
선행: 없음

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

### Scenario WP11.1-5: 뉴스 상세 모달
Given: 뉴스 목록 표시
When: 뉴스 카드 클릭
Then: 페이지 내 모달에서 상세 정보(제목, 요약, 출처, 날짜) 표시
선행: WP11.1-2

### Scenario WP11.1-6: 원문 기사 이동
Given: 뉴스 상세 모달 열림
When: "전체 기사 보기" 클릭
Then: 새 창에서 원본 뉴스 기사 페이지 이동
선행: WP11.1-5

### Scenario WP11.1-7: 뉴스 북마크
Given: 뉴스 상세 모달 열림
When: "북마크" 버튼 클릭
Then: localStorage에 뉴스 저장, 북마크 상태 토글
선행: WP11.1-5

### Scenario WP11.1-8: 뉴스 링크 복사
Given: 뉴스 상세 모달 열림
When: "링크 복사" 버튼 클릭
Then: 클립보드에 뉴스 URL 복사
선행: WP11.1-5

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

# 🟦 M14 — 기능 완성도 강화

## WP14.1 — 상담 예약/일정 캘린더

### Scenario WP14.1-1: 캘린더 뷰 표시
Given: 보호자 로그인
When: 캘린더 페이지 접속
Then: 입시 일정 + 상담 예약 캘린더 표시
선행: WP1.1-3

### Scenario WP14.1-2: 상담 예약 생성
Given: 캘린더 페이지
When: "상담 예약" 버튼 클릭 + 정보 입력
Then: 상담 예약 생성 및 캘린더에 표시
선행: WP14.1-1

### Scenario WP14.1-3: 일정 상세 보기
Given: 캘린더에 일정 존재
When: 일정 클릭
Then: 상세 모달 표시
선행: WP14.1-1

---

## WP14.2 — PDF 리포트 다운로드

### Scenario WP14.2-1: 학생 리포트 생성
Given: 학생 데이터 존재 (성적, 활동, 독서)
When: PDF 다운로드 요청
Then: 종합 리포트 PDF 생성 및 다운로드
선행: WP2.1-1, WP2.2-1, WP2.3-1

### Scenario WP14.2-2: 진단 리포트 생성
Given: 진단 결과 존재
When: 진단 PDF 다운로드 요청
Then: 진단 결과 PDF 생성 및 다운로드
선행: WP4.1-1

### Scenario WP14.2-3: 보호자 권한 확인
Given: 보호자-학생 연결됨
When: 보호자가 학생 리포트 요청
Then: 연결된 학생 리포트만 다운로드 가능
선행: WP1.3-2

---

## WP14.3 — 보호자 대시보드 상세화

### Scenario WP14.3-1: 학생 상세 페이지
Given: 보호자-학생 연결됨
When: 학생 카드 클릭
Then: 성적 차트, 활동 분포, 역량 레이더 차트 표시
선행: WP1.4-1

### Scenario WP14.3-2: 학생별 리포트 다운로드
Given: 학생 상세 페이지
When: "리포트 다운로드" 클릭
Then: 해당 학생 PDF 리포트 다운로드
선행: WP14.2-1, WP14.3-1

---

# 🟦 M15 — 사용자 경험 개선

## WP15.1 — 온보딩 튜토리얼

### Scenario WP15.1-1: 첫 로그인 튜토리얼
Given: 신규 사용자 첫 로그인
When: 대시보드 접속
Then: 인터랙티브 튜토리얼 시작 (react-joyride)
선행: WP1.1-3

### Scenario WP15.1-2: 역할별 튜토리얼
Given: 학생/보호자 로그인
When: 튜토리얼 시작
Then: 역할에 맞는 가이드 단계 표시
선행: WP15.1-1

### Scenario WP15.1-3: 튜토리얼 스킵/완료
Given: 튜토리얼 진행 중
When: "건너뛰기" 또는 완료
Then: localStorage에 완료 상태 저장, 재방문 시 미표시
선행: WP15.1-1

---

## WP15.2 — 이메일 알림 연동

### Scenario WP15.2-1: 환영 이메일
Given: 회원가입 완료
When: 계정 생성 직후
Then: 환영 이메일 발송 (Nodemailer)
선행: WP1.1-1

### Scenario WP15.2-2: 상담 예약 알림
Given: 상담 예약 생성
When: 예약 완료
Then: 관련자(보호자, 컨설턴트)에게 이메일 발송
선행: WP8.2-1

### Scenario WP15.2-3: 진단 완료 알림
Given: AI 진단 완료
When: 진단 결과 저장
Then: 보호자에게 이메일 발송
선행: WP4.1-1

---

## WP15.3 — 로딩/에러 상태 UI

### Scenario WP15.3-1: 로딩 상태 표시
Given: 데이터 페칭 중
When: API 호출 진행
Then: 스피너 + 로딩 메시지 표시
선행: 없음

### Scenario WP15.3-2: 에러 상태 표시
Given: API 호출 실패
When: 에러 발생
Then: 에러 아이콘 + 메시지 + 재시도 버튼 표시
선행: 없음

### Scenario WP15.3-3: 스켈레톤 UI
Given: 초기 페이지 로드
When: 데이터 로딩 중
Then: 카드/리스트 스켈레톤 애니메이션 표시
선행: 없음

---

# 🟦 M16 — 데이터 고도화

## WP16.1 — 학교 데이터 확장

### Scenario WP16.1-1: 일반고 데이터 추가
Given: 기존 특목고/자사고 데이터
When: 시드 데이터 실행
Then: 주요 일반고 데이터 추가
선행: WP12.2-1

### Scenario WP16.1-2: 특성화고 데이터 추가
Given: 학교 DB
When: 시드 데이터 실행
Then: 예술고, 체육고, 특성화고 데이터 추가
선행: WP16.1-1

### Scenario WP16.1-3: 학교 유형별 필터링
Given: 확장된 학교 DB
When: 학교 검색 시 유형 필터 선택
Then: 해당 유형 학교만 표시
선행: WP16.1-2

---

## WP16.2 — 입시 일정 2025-2026

### Scenario WP16.2-1: 2025 입시 일정
Given: 학교 DB
When: 입시 일정 시드 실행
Then: 2025학년도 주요 일정 저장
선행: WP3.2-3

### Scenario WP16.2-2: 2026 입시 일정
Given: 학교 DB
When: 입시 일정 시드 실행
Then: 2026학년도 예상 일정 저장
선행: WP16.2-1

### Scenario WP16.2-3: 일정 캘린더 연동
Given: 입시 일정 데이터
When: 보호자 캘린더 접속
Then: 목표학교 입시 일정 자동 표시
선행: WP14.1-1, WP16.2-1

---

## WP16.3 — AI 진단 알고리즘 개선

### Scenario WP16.3-1: 학교 유형별 분석
Given: 진단 요청
When: 목표학교 유형이 과학고
Then: 수학/과학 성적 가중치 높여 분석
선행: WP4.1-1

### Scenario WP16.3-2: 세분화된 레벨
Given: 진단 실행
When: 점수 계산 완료
Then: FIT/CHALLENGE/UNLIKELY 레벨 판정
선행: WP16.3-1

### Scenario WP16.3-3: 강점/약점 분석
Given: 진단 결과
When: 분석 완료
Then: 영역별 강점/약점 상세 분석 제공
선행: WP16.3-2

---

# 🟦 M17 — 모바일 & 성능 최적화

## WP17.1 — 모바일 반응형 UI

### Scenario WP17.1-1: 모바일 사이드바
Given: 모바일 기기에서 대시보드 접속
When: 햄버거 메뉴 클릭
Then: 사이드바 슬라이드 인 애니메이션 + 오버레이 표시
선행: WP1.1-3

### Scenario WP17.1-2: 모바일 네비게이션 바
Given: 모바일 기기에서 대시보드 접속
When: 화면 하단 확인
Then: 역할별 주요 메뉴 하단 네비게이션 바 표시
선행: WP17.1-1

### Scenario WP17.1-3: 모바일 레이아웃 최적화
Given: 모바일 기기
When: 각 페이지 접속
Then: 카드/테이블이 모바일 최적화 레이아웃으로 표시
선행: 없음

---

## WP17.2 — 성능 최적화

### Scenario WP17.2-1: 이미지 최적화
Given: 이미지 포함 페이지
When: 페이지 로드
Then: WebP/AVIF 포맷 + 지연 로딩 적용
선행: 없음

### Scenario WP17.2-2: 스켈레톤 UI
Given: 데이터 로딩 중
When: 페이지 초기 렌더링
Then: 카드/리스트/테이블 스켈레톤 애니메이션 표시
선행: 없음

### Scenario WP17.2-3: API 캐싱
Given: API 호출
When: 동일 요청 반복
Then: 캐시된 데이터 반환 (TTL 기반)
선행: 없음

---

## WP17.3 — 모바일 테스트 환경

### Scenario WP17.3-1: 동적 API URL
Given: 모바일에서 컴퓨터 IP로 접속
When: API 호출
Then: 자동으로 같은 IP의 백엔드로 요청
선행: 없음

### Scenario WP17.3-2: CORS 확장
Given: 외부 IP에서 API 접근
When: 모바일 기기에서 요청
Then: CORS 허용으로 정상 응답
선행: WP17.3-1

### Scenario WP17.3-3: 전체 네트워크 바인딩
Given: 백엔드 서버 시작
When: 0.0.0.0으로 바인딩
Then: 모든 네트워크 인터페이스에서 접근 가능
선행: 없음

---

# 🟦 M18 — 시너지 기능

## WP18.1 — 성적 트렌드 분석

### Scenario WP18.1-1: 과목별 성적 추이 조회
Given: 학생이 성적 3회 이상 입력됨
When: 성적 분석 페이지 접속
Then: 과목별 선 그래프로 성적 추이 표시
선행: WP2.1-1

### Scenario WP18.1-2: AI 개선 조언
Given: 성적 트렌드 분석 완료
When: 분석 결과 확인
Then: 과목별 맞춤 개선 조언 제공
선행: WP18.1-1

---

## WP18.2 — 학교 비교

### Scenario WP18.2-1: 목표 학교 비교
Given: 목표 학교 2개 이상 설정됨
When: 학교 비교 요청
Then: 정원, 경쟁률, 입학 요건 비교 표 표시
선행: WP4.2-1

---

## WP18.3 — D-Day 대시보드

### Scenario WP18.3-1: D-Day 목록 조회
Given: 목표 학교 설정됨
When: D-Day 페이지 접속
Then: 학교별 주요 일정 카운트다운 표시
선행: WP4.2-1

### Scenario WP18.3-2: 커스텀 D-Day 추가
Given: D-Day 페이지 접속
When: 새 D-Day 추가
Then: 개인 일정 D-Day로 등록됨
선행: WP18.3-1

---

## WP18.4 — 면접 준비 도우미

### Scenario WP18.4-1: 예상 질문 조회
Given: 목표 학교 설정됨
When: 면접 준비 페이지 접속
Then: 학교별 예상 면접 질문 목록 표시
선행: WP4.2-1

### Scenario WP18.4-2: AI 모의 면접
Given: 예상 질문 선택됨
When: 답변 입력 후 제출
Then: AI가 답변 피드백 제공
선행: WP18.4-1

---

## WP18.5 — 게이미피케이션 (성취 뱃지)

### Scenario WP18.5-1: 뱃지 획득
Given: 특정 활동 완료 (예: 성적 첫 입력)
When: 활동 저장
Then: 해당 뱃지 자동 부여 + 알림
선행: WP2.1-1

### Scenario WP18.5-2: 뱃지 현황 조회
Given: 뱃지 페이지 접속
When: 뱃지 목록 조회
Then: 획득/미획득 뱃지 구분 표시
선행: WP18.5-1

---

## WP18.6 — 목표 성적 트래커

### Scenario WP18.6-1: 목표 성적 설정
Given: 학생 로그인
When: 과목별 목표 점수 설정
Then: 목표 저장됨
선행: WP1.1-3

### Scenario WP18.6-2: 달성률 조회
Given: 목표 설정 + 성적 입력됨
When: 목표 트래커 페이지 접속
Then: 과목별 달성률 프로그레스바 표시
선행: WP18.6-1

---

## WP18.7 — 합격 시뮬레이션

### Scenario WP18.7-1: 시뮬레이션 실행
Given: 학생 데이터 입력됨
When: 가상 성적 시나리오 입력
Then: 예측 합격 확률 계산 표시
선행: WP4.1-1

---

# 🟦 M19 — 커뮤니티 & AI 고급 기능

## WP19.1 — Q&A 커뮤니티

### Scenario WP19.1-1: 질문 작성
Given: 학생/학부모 로그인
When: 새 질문 작성
Then: 질문 등록됨
선행: WP1.1-3

### Scenario WP19.1-2: 답변 작성
Given: 질문 상세 페이지
When: 답변 작성
Then: 답변 등록됨
선행: WP19.1-1

### Scenario WP19.1-3: 답변 채택
Given: 질문 작성자 로그인
When: 답변 채택
Then: 채택 표시 + 답변자 포인트/뱃지
선행: WP19.1-2

---

## WP19.2 — 합격생 후기

### Scenario WP19.2-1: 후기 작성
Given: 합격생 계정
When: 합격 후기 작성
Then: 후기 등록 (검토 대기)
선행: WP1.1-3

### Scenario WP19.2-2: 후기 검증
Given: 관리자 로그인
When: 후기 검증 승인
Then: 검증 뱃지 부여
선행: WP19.2-1

### Scenario WP19.2-3: 후기 조회
Given: 합격 후기 페이지 접속
When: 학교/년도 필터 적용
Then: 필터된 후기 목록 표시
선행: 없음

---

## WP19.3 — AI 자기소개서 도우미

### Scenario WP19.3-1: 초안 생성
Given: 학생 데이터 입력됨
When: 자기소개서 초안 요청
Then: AI가 초안 생성
선행: WP2.1-1

### Scenario WP19.3-2: 첨삭 요청
Given: 자기소개서 작성됨
When: 첨삭 요청
Then: AI가 개선점 피드백 제공
선행: WP19.3-1

### Scenario WP19.3-3: 학교별 템플릿
Given: 목표 학교 설정됨
When: 템플릿 요청
Then: 학교별 자기소개서 가이드라인 제공
선행: WP4.2-1

---

## WP19.4 — 학교별 합격 예측 AI

### Scenario WP19.4-1: 합격 예측 조회
Given: 학생 데이터 + 목표 학교 설정됨
When: 합격 예측 요청
Then: 학교별 합격 확률 (%) 표시
선행: WP4.2-1

### Scenario WP19.4-2: 개선 추천
Given: 합격 예측 결과 확인
When: 상세 분석 요청
Then: 합격 확률 높이기 위한 개선점 제시
선행: WP19.4-1

---

# 🟦 M20 — 코드 리팩토링

## WP20.1 — 토큰 관리 통일

### Scenario WP20.1-1: 토큰 저장 함수 통일
Given: 로그인 성공
When: 토큰 저장
Then: setToken() 함수로 accessToken, token 키 모두 저장
선행: WP1.1-3

### Scenario WP20.1-2: 토큰 조회 함수 통일
Given: API 요청 필요
When: 토큰 조회
Then: getToken() 함수로 accessToken → token 순서로 폴백 조회
선행: WP20.1-1

### Scenario WP20.1-3: 토큰 삭제 함수 통일
Given: 로그아웃 요청
When: 토큰 삭제
Then: clearToken() 함수로 모든 토큰 키 삭제
선행: WP20.1-1

---

## WP20.2 — API URL 통일 (예정)

### Scenario WP20.2-1: getApiUrl 함수 전역 사용
Given: API 호출 필요
When: URL 결정
Then: getApiUrl()로 동적 URL 반환
선행: 없음

---

## WP20.3 — AI 서비스 리팩토링 (예정)

### Scenario WP20.3-1: BaseAiService 추상 클래스화
Given: AI 관련 API 호출
When: 서비스 초기화
Then: 공통 로직 BaseAiService에서 상속
선행: 없음

---

# 🟦 M21 — 기능 확장

## WP21.1 — PDF 리포트 다운로드

### Scenario WP21.1-1: PDF 다운로드
Given: 학생 대시보드 접속
When: PDF 다운로드 버튼 클릭
Then: 학생 리포트 PDF 파일 생성 및 다운로드
선행: WP1.1-3

---

## WP21.2 — 이메일 알림 스케줄러

### Scenario WP21.2-1: D-Day 알림
Given: D-Day 7일 이내 이벤트 존재
When: 매일 아침 9시 (Cron)
Then: 해당 사용자에게 이메일 발송
선행: WP18.3-1

### Scenario WP21.2-2: 주간 리포트
Given: 주간 활동 기록 존재
When: 매주 일요일 저녁 8시 (Cron)
Then: 학생에게 주간 학습 리포트 이메일 발송
선행: WP1.1-3

### Scenario WP21.2-3: 상담 리마인더
Given: 상담 예약 1시간 전
When: 매시간 정각 체크 (Cron)
Then: 학생/컨설턴트에게 알림 이메일 발송
선행: WP8.2-1

---

## WP21.3 — 위젯 커스터마이징

### Scenario WP21.3-1: 위젯 설정 열기
Given: 학생 대시보드 접속
When: 위젯 설정 버튼 클릭
Then: 위젯 설정 모달 표시
선행: WP1.1-3

### Scenario WP21.3-2: 위젯 토글
Given: 위젯 설정 모달 열림
When: 위젯 활성화/비활성화 토글
Then: localStorage에 설정 저장, 대시보드 반영
선행: WP21.3-1

### Scenario WP21.3-3: 위젯 순서 변경
Given: 위젯 설정 모달 열림
When: 드래그 앤 드롭으로 순서 변경
Then: 새 순서 localStorage에 저장
선행: WP21.3-1

---

## WP21.4 — 학습 캘린더

### Scenario WP21.4-1: 캘린더 조회
Given: 학생 로그인
When: 학습 캘린더 페이지 접속
Then: D-Day + Task + 상담 일정 통합 표시
선행: WP1.1-3

### Scenario WP21.4-2: 날짜 선택
Given: 캘린더 표시됨
When: 특정 날짜 클릭
Then: 해당 날짜의 이벤트 목록 사이드바에 표시
선행: WP21.4-1

---

## WP21.5 — 상담 채팅

### Scenario WP21.5-1: 채팅 목록 조회
Given: 학생 로그인
When: 상담 채팅 페이지 접속
Then: 진행 중인 상담 목록 표시
선행: WP8.2-1

### Scenario WP21.5-2: 메시지 전송
Given: 상담 선택됨
When: 메시지 입력 후 전송
Then: 메시지 저장 및 표시
선행: WP21.5-1

---

## WP21.6 — 학습 시간 트래커

### Scenario WP21.6-1: 타이머 시작
Given: 학습 시간 페이지 접속
When: 과목 선택 후 시작 버튼 클릭
Then: 타이머 시작
선행: WP1.1-3

### Scenario WP21.6-2: 학습 기록 저장
Given: 타이머 1분 이상 동작
When: 저장 완료 버튼 클릭
Then: 학습 세션 localStorage에 저장
선행: WP21.6-1

### Scenario WP21.6-3: 통계 조회
Given: 학습 기록 존재
When: 학습 시간 페이지 접속
Then: 오늘/이번주/과목별 통계 표시
선행: WP21.6-2

---

## WP21.7 — AI 튜터 챗봇

### Scenario WP21.7-1: 질문 전송
Given: AI 튜터 페이지 접속
When: 과목 선택 후 질문 입력
Then: AI 응답 생성 및 표시
선행: WP1.1-3

### Scenario WP21.7-2: 대화 기록 저장
Given: AI와 대화 진행
When: 새 메시지 추가
Then: 대화 기록 localStorage에 저장
선행: WP21.7-1

---

# 🟦 M22 — UI/UX 고도화

## WP22.1 — 애니메이션 시스템

### Scenario WP22.1-1: 페이드 인 애니메이션
Given: 컴포넌트 마운트
When: animate-fade-in 클래스 적용
Then: 0.3s 페이드 인 효과
선행: 없음

### Scenario WP22.1-2: 슬라이드 업 애니메이션
Given: 컴포넌트 마운트
When: animate-slide-up 클래스 적용
Then: 아래에서 위로 슬라이드 효과
선행: 없음

---

## WP22.2 — 다크 모드

### Scenario WP22.2-1: 다크 모드 토글
Given: 앱 사용 중
When: 테마 토글 버튼 클릭
Then: 다크/라이트 모드 전환, localStorage 저장
선행: 없음

### Scenario WP22.2-2: 시스템 테마 감지
Given: 테마 설정 'system'
When: 시스템 다크 모드 변경
Then: 자동으로 테마 변경
선행: WP22.2-1

---

## WP22.3 — Glass Morphism

### Scenario WP22.3-1: Glass 카드
Given: 카드 컴포넌트
When: glass={true} 속성 적용
Then: 반투명 블러 배경 효과 적용
선행: 없음

---

## WP22.4 — 스켈레톤 로더

### Scenario WP22.4-1: Shimmer 효과
Given: 데이터 로딩 중
When: 스켈레톤 컴포넌트 표시
Then: Shimmer 애니메이션 적용
선행: 없음

---

# 🎉 끝  
본 문서는 MVP 전 기능에 대한  
**Milestone → Work Package → Scenario**  
계층 구조를 완성한 최종 버전이다.

**2025-12-19 (2차) 업데이트:**
- M21: 기능 확장 추가
  - WP21.1: PDF 리포트 다운로드 (✅ 완료)
  - WP21.2: 이메일 알림 스케줄러 (✅ 완료)
  - WP21.3: 위젯 커스터마이징 (✅ 완료)
  - WP21.4: 학습 캘린더 (✅ 완료)
  - WP21.5: 상담 채팅 (✅ 완료)
  - WP21.6: 학습 시간 트래커 (✅ 완료)
  - WP21.7: AI 튜터 챗봇 (✅ 완료)
- M22: UI/UX 고도화 추가
  - WP22.1: 애니메이션 시스템 (✅ 완료)
  - WP22.2: 다크 모드 (✅ 완료)
  - WP22.3: Glass Morphism (✅ 완료)
  - WP22.4: 스켈레톤 로더 (✅ 완료)

**2025-12-19 업데이트:**
- M18: 시너지 기능 추가
  - WP18.1: 성적 트렌드 분석 (과목별 추이, AI 개선 조언)
  - WP18.2: 학교 비교 (정원, 경쟁률, 입학 요건)
  - WP18.3: D-Day 대시보드 (카운트다운, 커스텀 D-Day)
  - WP18.4: 면접 준비 도우미 (예상 질문, AI 모의 면접)
  - WP18.5: 게이미피케이션 (성취 뱃지 15종)
  - WP18.6: 목표 성적 트래커 (과목별 목표, 달성률)
  - WP18.7: 합격 시뮬레이션 (가상 시나리오)
- M19: 커뮤니티 & AI 고급 기능 추가
  - WP19.1: Q&A 커뮤니티 (질문/답변/채택)
  - WP19.2: 합격생 후기 (후기 작성/검증/조회)
  - WP19.3: AI 자기소개서 도우미 (초안/첨삭/템플릿)
  - WP19.4: 학교별 합격 예측 AI (확률/개선 추천)
- M20: 코드 리팩토링
  - WP20.1: 토큰 관리 통일 (✅ 완료)
  - WP20.2: API URL 통일 (✅ 완료)
  - WP20.3: AI 서비스 리팩토링 (📋 예정)

**2025-12-16 업데이트:**
- M17: 모바일 & 성능 최적화 추가
  - WP17.1: 모바일 반응형 UI (사이드바 슬라이드, 하단 네비게이션 바, 레이아웃 최적화)
  - WP17.2: 성능 최적화 (이미지 최적화, 스켈레톤 UI, API 캐싱)
  - WP17.3: 모바일 테스트 환경 (동적 API URL, CORS 확장, 전체 네트워크 바인딩)

**2025-12-13 업데이트:**
- M11: 뉴스 & 정보 서비스 추가 (뉴스 상세 모달, 북마크, 링크 복사 기능 추가)
- M12: 데이터 확장 (중학교 DB, 특목고 확장) 추가
- M13: AI 멘토 고도화 추가
- M14: 기능 완성도 강화 (상담 캘린더, PDF 리포트, 보호자 대시보드 상세화)
- M15: 사용자 경험 개선 (온보딩 튜토리얼, 이메일 알림, 로딩/에러 UI)
- M16: 데이터 고도화 (학교 데이터 확장, 입시 일정 2025-2026, AI 진단 개선)
- WP1.1: 로그인 에러 메시지 개선 (서버 연결 실패, 인증 실패 구분)
- WP11.1: Google News RSS 실시간 크롤링으로 실제 뉴스 기사 제공
